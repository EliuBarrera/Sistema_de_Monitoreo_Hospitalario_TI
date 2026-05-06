import ipaddress

from extensions import db
from models.deviceModel import Device
from models.deviceTypeModel import DeviceType


ALLOWED_STATUSES = {"active", "inactive", "maintenance"}


def _validate_ip(ip_value: str):
    if ip_value in (None, ""):
        return True
    try:
        ipaddress.ip_address(ip_value)
        return True
    except ValueError:
        return False


def get_all_devices(filters=None):
    filters = filters or {}
    query = Device.query

    status = filters.get("status")
    if status:
        query = query.filter(Device.status == status)

    device_type_id = filters.get("device_type_id")
    if device_type_id is not None:
        try:
            device_type_id = int(device_type_id)
        except ValueError:
            return {"error": "device_type_id debe ser entero"}, 400
        query = query.filter(Device.device_type_id == device_type_id)

    serial_number = filters.get("serial_number")
    if serial_number:
        query = query.filter(Device.serial_number == serial_number)

    devices = query.all()
    return [d.to_dict() for d in devices], 200


def get_device_by_id(device_id: int):
    device = Device.query.get(device_id)
    if not device:
        return {"error": "Dispositivo no encontrado"}, 404
    return device.to_dict(), 200


def create_device(data):
    data = data or {}

    name = data.get("name")
    serial_number = data.get("serial_number")
    status = data.get("status", "active")
    location = data.get("location")
    ip_address = data.get("ip_address")
    device_type_id = data.get("device_type_id")

    if not name:
        return {"error": "El campo 'name' es requerido"}, 400
    if not serial_number:
        return {"error": "El campo 'serial_number' es requerido"}, 400
    if Device.query.filter_by(serial_number=serial_number).first():
        return {"error": "El serial_number ya existe"}, 400
    if status not in ALLOWED_STATUSES:
        return {"error": f"status inválido. Use: {', '.join(sorted(ALLOWED_STATUSES))}"}, 400
    if not _validate_ip(ip_address):
        return {"error": "ip_address inválida"}, 400

    if device_type_id is not None:
        try:
            device_type_id = int(device_type_id)
        except ValueError:
            return {"error": "device_type_id debe ser entero"}, 400
        if not DeviceType.query.get(device_type_id):
            return {"error": "device_type_id no existe"}, 400

    new_device = Device(
        name=name,
        serial_number=serial_number,
        status=status,
        location=location,
        ip_address=ip_address,
        device_type_id=device_type_id,
    )

    db.session.add(new_device)
    db.session.commit()
    return {"message": "Dispositivo creado exitosamente", "device": new_device.to_dict()}, 201


def update_device(device_id: int, data):
    device = Device.query.get(device_id)
    if not device:
        return {"error": "Dispositivo no encontrado"}, 404

    data = data or {}

    if "name" in data:
        if not data.get("name"):
            return {"error": "El campo 'name' no puede ser vacío"}, 400
        device.name = data.get("name")

    if "serial_number" in data:
        serial_number = data.get("serial_number")
        if not serial_number:
            return {"error": "El campo 'serial_number' no puede ser vacío"}, 400
        existing = Device.query.filter_by(serial_number=serial_number).first()
        if existing and existing.id != device.id:
            return {"error": "El serial_number ya existe"}, 400
        device.serial_number = serial_number

    if "status" in data:
        status = data.get("status")
        if status not in ALLOWED_STATUSES:
            return {"error": f"status inválido. Use: {', '.join(sorted(ALLOWED_STATUSES))}"}, 400
        device.status = status

    if "location" in data:
        device.location = data.get("location")

    if "ip_address" in data:
        ip_address = data.get("ip_address")
        if not _validate_ip(ip_address):
            return {"error": "ip_address inválida"}, 400
        device.ip_address = ip_address

    if "device_type_id" in data:
        device_type_id = data.get("device_type_id")
        if device_type_id is not None:
            try:
                device_type_id = int(device_type_id)
            except ValueError:
                return {"error": "device_type_id debe ser entero"}, 400
            if not DeviceType.query.get(device_type_id):
                return {"error": "device_type_id no existe"}, 400
        device.device_type_id = device_type_id

    db.session.commit()
    return {"message": "Dispositivo actualizado exitosamente", "device": device.to_dict()}, 200


def delete_device(device_id: int):
    device = Device.query.get(device_id)
    if not device:
        return {"error": "Dispositivo no encontrado"}, 404

    db.session.delete(device)
    db.session.commit()
    return {"message": "Dispositivo eliminado exitosamente"}, 200

