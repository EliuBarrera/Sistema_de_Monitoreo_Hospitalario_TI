from datetime import datetime

from extensions import db
from models.metric_model import Metric


def _parse_int(value, field_name: str):
    if value is None or value == "":
        return None, None
    try:
        return int(value), None
    except Exception:
        return None, {"error": f"{field_name} debe ser entero"}


def _parse_float(value, field_name: str):
    if value is None or value == "":
        return None, {"error": f"{field_name} es requerido"}
    try:
        return float(value), None
    except Exception:
        return None, {"error": f"{field_name} debe ser numérico"}


def _parse_iso_datetime(value, field_name: str):
    if value is None or value == "":
        return None, None
    try:
        # Soporta "2026-05-11T20:10:00" y "2026-05-11T20:10:00Z"
        cleaned = value.replace("Z", "+00:00")
        return datetime.fromisoformat(cleaned), None
    except Exception:
        return None, {"error": f"{field_name} debe ser ISO-8601 (ej: 2026-05-11T20:10:00)"}


def get_all_metrics(filters=None):
    filters = filters or {}
    query = Metric.query

    device_id, err = _parse_int(filters.get("device_id"), "device_id")
    if err:
        return err, 400
    if device_id is not None:
        query = query.filter(Metric.device_id == device_id)

    patient_id, err = _parse_int(filters.get("patient_id"), "patient_id")
    if err:
        return err, 400
    if patient_id is not None:
        query = query.filter(Metric.patient_id == patient_id)

    metric_type = filters.get("metric_type")
    if metric_type:
        query = query.filter(Metric.metric_type == metric_type)

    date_from, err = _parse_iso_datetime(filters.get("from"), "from")
    if err:
        return err, 400
    if date_from is not None:
        query = query.filter(Metric.timestamp >= date_from)

    date_to, err = _parse_iso_datetime(filters.get("to"), "to")
    if err:
        return err, 400
    if date_to is not None:
        query = query.filter(Metric.timestamp <= date_to)

    metrics = query.order_by(Metric.timestamp.desc(), Metric.id.desc()).all()
    return [m.to_dict() for m in metrics], 200


def get_metric_by_id(metric_id: int):
    metric = Metric.query.get(metric_id)
    if not metric:
        return {"error": "Métrica no encontrada"}, 404
    return metric.to_dict(), 200


def create_metric(data):
    data = data or {}

    device_id, err = _parse_int(data.get("device_id"), "device_id")
    if err:
        return err, 400
    patient_id, err = _parse_int(data.get("patient_id"), "patient_id")
    if err:
        return err, 400

    metric_type = data.get("metric_type")
    if not metric_type:
        return {"error": "El campo 'metric_type' es requerido"}, 400

    value, err = _parse_float(data.get("value"), "value")
    if err:
        return err, 400

    unit = data.get("unit")

    timestamp, err = _parse_iso_datetime(data.get("timestamp"), "timestamp")
    if err:
        return err, 400

    metric = Metric(
        device_id=device_id,
        patient_id=patient_id,
        metric_type=metric_type,
        value=value,
        unit=unit,
    )
    if timestamp is not None:
        metric.timestamp = timestamp

    db.session.add(metric)
    db.session.commit()
    return {"message": "Métrica creada exitosamente", "metric": metric.to_dict()}, 201


def update_metric(metric_id: int, data):
    metric = Metric.query.get(metric_id)
    if not metric:
        return {"error": "Métrica no encontrada"}, 404

    data = data or {}

    if "device_id" in data:
        device_id, err = _parse_int(data.get("device_id"), "device_id")
        if err:
            return err, 400
        metric.device_id = device_id

    if "patient_id" in data:
        patient_id, err = _parse_int(data.get("patient_id"), "patient_id")
        if err:
            return err, 400
        metric.patient_id = patient_id

    if "metric_type" in data:
        if not data.get("metric_type"):
            return {"error": "El campo 'metric_type' no puede ser vacío"}, 400
        metric.metric_type = data.get("metric_type")

    if "value" in data:
        value, err = _parse_float(data.get("value"), "value")
        if err:
            return err, 400
        metric.value = value

    if "unit" in data:
        metric.unit = data.get("unit")

    if "timestamp" in data:
        timestamp, err = _parse_iso_datetime(data.get("timestamp"), "timestamp")
        if err:
            return err, 400
        metric.timestamp = timestamp or metric.timestamp

    db.session.commit()
    return {"message": "Métrica actualizada exitosamente", "metric": metric.to_dict()}, 200


def delete_metric(metric_id: int):
    metric = Metric.query.get(metric_id)
    if not metric:
        return {"error": "Métrica no encontrada"}, 404
    db.session.delete(metric)
    db.session.commit()
    return {"message": "Métrica eliminada exitosamente"}, 200

