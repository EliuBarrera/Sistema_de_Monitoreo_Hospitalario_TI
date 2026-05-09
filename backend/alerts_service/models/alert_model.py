from extensions import db
import datetime
class AlertSeverity(db.Model):
    __tablename__ = "alert_severities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) 
    # CRITICA, ALTA, MEDIA, BAJA

    alerts = db.relationship("Alert", back_populates="severity")

class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, nullable=False)               # FK externa
    severity_id = db.Column(db.Integer, db.ForeignKey("alert_severities.id"), nullable=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="activa")             # activa,  resuelta, ignorada
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    severity = db.relationship("AlertSeverity", back_populates="alerts")
