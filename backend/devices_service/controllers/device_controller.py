import ipaddress
import requests

from extensions import db
from models.deviceModel import Device
from models.deviceTypeModel import DeviceType

ALLOWED_STATUSES = {"active", "inactive", "maintenance"}
LOCATIONS_URL = "http://localhost:5004/locations"


# ── Helpers de validación ─────────────────────────────────────────────────────

def _err(msg: str, code: int):
    return {"error": msg}, code


def _validate_ip(ip_value: str):
    if ip_value in (None, ""):
        return None
    try:
        ipaddress.ip_address(ip_value)
        return None
    except ValueError:
        return _err("ip_address inválida", 400)


def _validate_status(status: str):
    if status not in ALLOWED_STATUSES:
        return _err(f"status inválido. Use: {', '.join(sorted(ALLOWED_STATUSES))}", 400)
    return None


def _validate_required_string(value, field: str):
    if not value:
        return _err(f"El campo '{field}' es requerido", 400)
    return None


def _validate_nonempty_string(value, field: str):
    if not value:
        return _err(f"El campo '{field}' no puede ser vacío", 400)
    return None


def _validate_serial_unique(serial_number: str, exclude_id: int = None):
    existing = Device.query.filter_by(serial_number=serial_number).first()
    if existing and existing.id != exclude_id:
        return _err("El serial_number ya existe", 400)
    return None


# ── Helpers de lookup ─────────────────────────────────────────────────────────

def _resolve_int(value, field: str):
    try:
        return int(value), None
    except (TypeError, ValueError):
        return None, _err(f"{field} debe ser entero", 400)


def _lookup_location(location_id):
    """Valida que la location exista consultando el microservicio de locations."""
    location_id, error = _resolve_int(location_id, "location_id")
    if error:
        return None, error
    try:
        response = requests.get(f"{LOCATIONS_URL}/{location_id}", timeout=5)
        if response.status_code == 404:
            return None, _err("location_id no existe", 400)
        if not response.ok:
            return None, _err("Error al verificar la location", 502)
    except requests.exceptions.Timeout:
        return None, _err("El servicio de locations no respondió a tiempo", 504)
    except requests.exceptions.ConnectionError:
        return None, _err("No se pudo conectar al servicio de locations", 503)
    return location_id, None


def _lookup_device_type(device_type_id):
    if device_type_id is None:
        return None, None
    device_type_id, error = _resolve_int(device_type_id, "device_type_id")
    if error:
        return None, error
    if not DeviceType.query.get(device_type_id):
        return None, _err("device_type_id no existe", 400)
    return device_type_id, None


def _lookup_device(device_id: int):
    device = Device.query.get(device_id)
    if not device:
        return None, _err("Dispositivo no encontrado", 404)
    return device, None


# ── Field updaters ────────────────────────────────────────────────────────────

def _update_name(device, data):
    value = data["name"]
    if err := _validate_nonempty_string(value, "name"):
        return err
    device.name = value


def _update_serial_number(device, data):
    value = data["serial_number"]
    if err := _validate_nonempty_string(value, "serial_number"):
        return err
    if err := _validate_serial_unique(value, exclude_id=device.id):
        return err
    device.serial_number = value


def _update_status(device, data):
    if err := _validate_status(data["status"]):
        return err
    device.status = data["status"]


def _update_ip_address(device, data):
    if err := _validate_ip(data["ip_address"]):
        return err
    device.ip_address = data["ip_address"]


def _update_device_type_id(device, data):
    device_type_id, error = _lookup_device_type(data["device_type_id"])
    if error:
        return error
    device.device_type_id = device_type_id


def _update_location_id(device, data):
    location_id, error = _lookup_location(data["location_id"])
    if error:
        return error
    device.location_id = location_id


_FIELD_UPDATERS = {
    "name":           _update_name,
    "serial_number":  _update_serial_number,
    "status":         _update_status,
    "ip_address":     _update_ip_address,
    "device_type_id": _update_device_type_id,
    "location_id":    _update_location_id,
}


# ── CRUD ──────────────────────────────────────────────────────────────────────

def get_all_devices(filters=None):
    filters = filters or {}
    query = Device.query

    if status := filters.get("status"):
        query = query.filter(Device.status == status)

    if (raw_type_id := filters.get("device_type_id")) is not None:
        device_type_id, error = _resolve_int(raw_type_id, "device_type_id")
        if error:
            return error
        query = query.filter(Device.device_type_id == device_type_id)

    if serial_number := filters.get("serial_number"):
        query = query.filter(Device.serial_number == serial_number)

    return [d.to_dict() for d in query.all()], 200


def get_device_by_id(device_id: int):
    device, error = _lookup_device(device_id)
    if error:
        return error
    return device.to_dict(), 200


def create_device(data):
    data = data or {}

    name = data.get("name")
    serial_number = data.get("serial_number")
    status = data.get("status", "active")
    ip_address = data.get("ip_address")

    for error in (
        _validate_required_string(name, "name"),
        _validate_required_string(serial_number, "serial_number"),
        _validate_serial_unique(serial_number),
        _validate_status(status),
        _validate_ip(ip_address),
    ):
        if error:
            return error

    if not data.get("location_id"):
        return _err("El campo 'location_id' es requerido", 400)
    location_id, error = _lookup_location(data["location_id"])
    if error:
        return error

    device_type_id, error = _lookup_device_type(data.get("device_type_id"))
    if error:
        return error

    new_device = Device(
        name=name,
        serial_number=serial_number,
        status=status,
        location_id=location_id,
        ip_address=ip_address,
        device_type_id=device_type_id,
    )
    db.session.add(new_device)
    db.session.commit()
    return {"message": "Dispositivo creado exitosamente", "device": new_device.to_dict()}, 201


def update_device(device_id: int, data):
    device, error = _lookup_device(device_id)
    if error:
        return error

    data = data or {}

    for field, updater in _FIELD_UPDATERS.items():
        if field in data:
            if err := updater(device, data):
                return err

    db.session.commit()
    return {"message": "Dispositivo actualizado exitosamente", "device": device.to_dict()}, 200


def delete_device(device_id: int):
    device, error = _lookup_device(device_id)
    if error:
        return error
    db.session.delete(device)
    db.session.commit()
    return {"message": "Dispositivo eliminado exitosamente"}, 200