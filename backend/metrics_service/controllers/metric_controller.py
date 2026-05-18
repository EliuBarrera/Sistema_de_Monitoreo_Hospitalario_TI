from datetime import datetime

import requests

from extensions import db
from models.metric_model import Metric

DEVICE_SERVICE_URL = "http://localhost:5003/devices"


# ── Helpers de error ──────────────────────────────────────────────────────────

def _err(msg: str, code: int):
    return {"error": msg}, code


# ── Parsers ───────────────────────────────────────────────────────────────────

def _parse_int(value, field: str):
    if value in (None, ""):
        return None, None
    try:
        return int(value), None
    except (TypeError, ValueError):
        return None, _err(f"{field} debe ser entero", 400)


def _parse_float(value, field: str):
    if value in (None, ""):
        return None, _err(f"{field} es requerido", 400)
    try:
        return float(value), None
    except (TypeError, ValueError):
        return None, _err(f"{field} debe ser numérico", 400)


def _parse_iso_datetime(value, field: str):
    if value in (None, ""):
        return None, None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")), None
    except (AttributeError, ValueError):
        return None, _err(f"{field} debe ser ISO-8601 (ej: 2026-05-11T20:10:00)", 400)


# ── Helpers de lookup ─────────────────────────────────────────────────────────

def _lookup_metric(metric_id: int):
    metric = Metric.query.get(metric_id)
    if not metric:
        return None, _err("Métrica no encontrada", 404)
    return metric, None


def _lookup_device(device_id: int):
    """Verifica que el device exista consultando el microservicio de devices."""
    try:
        response = requests.get(f"{DEVICE_SERVICE_URL}/{device_id}", timeout=5)
        if response.status_code == 404:
            return None, _err("device_id no existe", 400)
        if not response.ok:
            return None, _err("Error al verificar el dispositivo", 502)
    except requests.exceptions.Timeout:
        return None, _err("El servicio de dispositivos no respondió a tiempo", 504)
    except requests.exceptions.ConnectionError:
        return None, _err("No se pudo conectar al servicio de dispositivos", 503)
    return device_id, None


# ── Field updaters ────────────────────────────────────────────────────────────

def _update_device_id(metric, data):
    device_id, err = _parse_int(data["device_id"], "device_id")
    if err:
        return err
    if device_id is not None:
        _, err = _lookup_device(device_id)
        if err:
            return err
    metric.device_id = device_id


def _update_patient_id(metric, data):
    patient_id, err = _parse_int(data["patient_id"], "patient_id")
    if err:
        return err
    metric.patient_id = patient_id


def _update_metric_type(metric, data):
    if not data.get("metric_type"):
        return _err("El campo 'metric_type' no puede ser vacío", 400)
    metric.metric_type = data["metric_type"]


def _update_value(metric, data):
    value, err = _parse_float(data["value"], "value")
    if err:
        return err
    metric.value = value


def _update_unit(metric, data):
    metric.unit = data["unit"]


def _update_timestamp(metric, data):
    timestamp, err = _parse_iso_datetime(data["timestamp"], "timestamp")
    if err:
        return err
    metric.timestamp = timestamp or metric.timestamp


_FIELD_UPDATERS = {
    "device_id":   _update_device_id,
    "patient_id":  _update_patient_id,
    "metric_type": _update_metric_type,
    "value":       _update_value,
    "unit":        _update_unit,
    "timestamp":   _update_timestamp,
}


# ── CRUD ──────────────────────────────────────────────────────────────────────

def get_all_metrics(filters=None):
    filters = filters or {}
    query = Metric.query

    device_id, err = _parse_int(filters.get("device_id"), "device_id")
    if err:
        return err
    if device_id is not None:
        query = query.filter(Metric.device_id == device_id)

    patient_id, err = _parse_int(filters.get("patient_id"), "patient_id")
    if err:
        return err
    if patient_id is not None:
        query = query.filter(Metric.patient_id == patient_id)

    if metric_type := filters.get("metric_type"):
        query = query.filter(Metric.metric_type == metric_type)

    date_from, err = _parse_iso_datetime(filters.get("from"), "from")
    if err:
        return err
    if date_from is not None:
        query = query.filter(Metric.timestamp >= date_from)

    date_to, err = _parse_iso_datetime(filters.get("to"), "to")
    if err:
        return err
    if date_to is not None:
        query = query.filter(Metric.timestamp <= date_to)

    return [m.to_dict() for m in query.order_by(Metric.timestamp.desc(), Metric.id.desc()).all()], 200


def get_metric_by_id(metric_id: int):
    metric, err = _lookup_metric(metric_id)
    if err:
        return err
    return metric.to_dict(), 200


def create_metric(data):
    data = data or {}

    device_id, err = _parse_int(data.get("device_id"), "device_id")
    if err:
        return err

    if device_id is not None:
        _, err = _lookup_device(device_id)
        if err:
            return err

    patient_id, err = _parse_int(data.get("patient_id"), "patient_id")
    if err:
        return err

    if not data.get("metric_type"):
        return _err("El campo 'metric_type' es requerido", 400)

    value, err = _parse_float(data.get("value"), "value")
    if err:
        return err

    timestamp, err = _parse_iso_datetime(data.get("timestamp"), "timestamp")
    if err:
        return err

    metric = Metric(
        device_id=device_id,
        patient_id=patient_id,
        metric_type=data["metric_type"],
        value=value,
        unit=data.get("unit"),
    )
    if timestamp is not None:
        metric.timestamp = timestamp

    db.session.add(metric)
    db.session.commit()
    return {"message": "Métrica creada exitosamente", "metric": metric.to_dict()}, 201


def update_metric(metric_id: int, data):
    metric, err = _lookup_metric(metric_id)
    if err:
        return err

    data = data or {}

    for field, updater in _FIELD_UPDATERS.items():
        if field in data:
            if err := updater(metric, data):
                return err

    db.session.commit()
    return {"message": "Métrica actualizada exitosamente", "metric": metric.to_dict()}, 200


def delete_metric(metric_id: int):
    metric, err = _lookup_metric(metric_id)
    if err:
        return err
    db.session.delete(metric)
    db.session.commit()
    return {"message": "Métrica eliminada exitosamente"}, 200