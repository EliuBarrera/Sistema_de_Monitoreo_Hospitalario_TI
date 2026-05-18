import datetime

import requests

from extensions import db
from models.alert_model import Alert, AlertSeverity

DEVICE_SERVICE_URL = "http://localhost:5003/devices"


# ── Helpers de error ──────────────────────────────────────────────────────────

def _err(msg: str, code: int):
    return {"error": msg}, code


# ── Helpers de lookup ─────────────────────────────────────────────────────────

def _lookup_alert(alert_id: int):
    alert = Alert.query.get(alert_id)
    if not alert:
        return None, _err("Alerta no encontrada", 404)
    return alert, None


def _lookup_device(device_id: int):
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


def _lookup_severity(severity_id: int):
    severity = AlertSeverity.query.get(severity_id)
    if not severity:
        return None, _err("severity_id no existe", 400)
    return severity, None


# ── Serializer ────────────────────────────────────────────────────────────────

def _serialize(alert: Alert) -> dict:
    return {
        "id":          alert.id,
        "device_id":   alert.device_id,
        "severity_id": alert.severity_id,
        "severity":    alert.severity.name if alert.severity else None,
        "message":     alert.message,
        "status":      alert.status,
        "created_at":  alert.created_at.isoformat() if alert.created_at else None,
        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
    }


# ── Field updaters ────────────────────────────────────────────────────────────

def _update_status(alert, data):
    new_status = data["status"]
    if new_status == "resuelta" and not alert.resolved_at:
        alert.resolved_at = datetime.datetime.now(datetime.timezone.utc)
    elif new_status != "resuelta":
        alert.resolved_at = None
    # else: keep the existing resolved_at unchanged
    alert.status = new_status


def _update_message(alert, data):
    if not data.get("message"):
        return _err("El campo 'message' no puede ser vacío", 400)
    alert.message = data["message"]


def _update_severity_id(alert, data):
    severity_id = data["severity_id"]
    if severity_id is not None:
        _, err = _lookup_severity(severity_id)
        if err:
            return err
    alert.severity_id = severity_id


_FIELD_UPDATERS = {
    "status":      _update_status,
    "message":     _update_message,
    "severity_id": _update_severity_id,
}


# ── Alert Severities ──────────────────────────────────────────────────────────

def get_all_severities():
    return [{"id": s.id, "name": s.name} for s in AlertSeverity.query.all()], 200


def create_severity(data):
    name = data.get("name")
    if not name:
        return _err("name es requerido", 400)
    if AlertSeverity.query.filter_by(name=name).first():
        return _err("La severidad ya existe", 400)
    new_sev = AlertSeverity(name=name)
    db.session.add(new_sev)
    db.session.commit()
    return {"message": "Severidad creada", "id": new_sev.id}, 201


# ── Alerts CRUD ───────────────────────────────────────────────────────────────

def get_all_alerts():
    alerts = Alert.query.order_by(Alert.created_at.desc()).all()
    return [_serialize(a) for a in alerts], 200


def get_alerts_by_device(device_id: int):
    alerts = Alert.query.filter_by(device_id=device_id).order_by(Alert.created_at.desc()).all()
    return [_serialize(a) for a in alerts], 200


def get_alert(alert_id: int):
    alert, err = _lookup_alert(alert_id)
    if err:
        return err
    return _serialize(alert), 200


def create_alert(data):
    data = data or {}

    device_id = data.get("device_id")
    message   = data.get("message")

    if not device_id or not message:
        return _err("device_id y message son requeridos", 400)

    _, err = _lookup_device(device_id)
    if err:
        return err

    if severity_id := data.get("severity_id"):
        _, err = _lookup_severity(severity_id)
        if err:
            return err

    new_alert = Alert(
        device_id=device_id,
        severity_id=data.get("severity_id"),
        message=message,
        status=data.get("status", "activa"),
    )
    db.session.add(new_alert)
    db.session.commit()
    return {"message": "Alerta creada", "id": new_alert.id}, 201


def update_alert(alert_id: int, data):
    alert, err = _lookup_alert(alert_id)
    if err:
        return err

    data = data or {}

    for field, updater in _FIELD_UPDATERS.items():
        if field in data:
            if err := updater(alert, data):
                return err

    db.session.commit()
    return {"message": "Alerta actualizada"}, 200


def delete_alert(alert_id: int):
    alert, err = _lookup_alert(alert_id)
    if err:
        return err
    db.session.delete(alert)
    db.session.commit()
    return {"message": "Alerta eliminada"}, 200