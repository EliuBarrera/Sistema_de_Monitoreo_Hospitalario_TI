from models.alert_model import Alert, AlertSeverity
from extensions import db
import datetime

# ALERT SEVERITIES

def get_all_severities():
    sevs = AlertSeverity.query.all()
    return [
        {"id": s.id, "name": s.name}
        for s in sevs
    ], 200

def create_severity(data):
    name = data.get("name")
    if not name:
        return {"error": "name es requerido"}, 400
    if AlertSeverity.query.filter_by(name=name).first():
        return {"error": "La severidad ya existe"}, 400
    new_sev = AlertSeverity(
        name=name
    )
    db.session.add(new_sev)
    db.session.commit()
    return {"message": "Severidad creada", "id": new_sev.id}, 201

# ALERTS

def get_all_alerts():
    alerts = Alert.query.order_by(Alert.created_at.desc()).all()
    return [_serialize(a) for a in alerts], 200

def get_alerts_by_device(device_id):
    alerts = Alert.query.filter_by(device_id=device_id).order_by(Alert.created_at.desc()).all()
    return [_serialize(a) for a in alerts], 200

def get_alert(alert_id):
    a = Alert.query.get(alert_id)
    if not a:
        return {"error": "Alerta no encontrada"}, 404
    return _serialize(a), 200

def create_alert(data):
    device_id = data.get("device_id")
    message = data.get("message")
    if not device_id or not message:
        return {"error": "device_id y message son requeridos"}, 400
    new_alert = Alert(
        device_id=device_id,
        severity_id=data.get("severity_id"),
        message=message,
        status=data.get("status", "activa")
    )
    db.session.add(new_alert)
    db.session.commit()
    return {"message": "Alerta creada", "id": new_alert.id}, 201

def update_alert(alert_id, data):
    a = Alert.query.get(alert_id)
    if not a:
        return {"error": "Alerta no encontrada"}, 404
    
    if "status" in data:
        new_status = data["status"]
        if new_status == "resuelta" and not a.resolved_at:
            a.resolved_at = datetime.datetime.utcnow()
        elif new_status != "resuelta":
            a.resolved_at = None
        a.status = new_status

    if "message" in data:
        a.message = data["message"]
    if "severity_id" in data:
        a.severity_id = data["severity_id"]
    
    db.session.commit()
    return {"message": "Alerta actualizada"}, 200

def delete_alert(alert_id):
    a = Alert.query.get(alert_id)
    if not a:
        return {"error": "Alerta no encontrada"}, 404
    db.session.delete(a)
    db.session.commit()
    return {"message": "Alerta eliminada"}, 200

def _serialize(a):
    return {
        "id": a.id,
        "device_id": a.device_id,
        "severity_id": a.severity_id,
        "severity": a.severity.name if a.severity else None,
        "message": a.message,
        "status": a.status,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None
    }
