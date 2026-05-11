from extensions import db


class Metric(db.Model):
    __tablename__ = "metrics"

    id = db.Column(db.Integer, primary_key=True)

    device_id = db.Column(db.Integer, nullable=True)
    patient_id = db.Column(db.Integer, nullable=True)

    metric_type = db.Column(db.String(80), nullable=False)
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(40), nullable=True)

    # Si el cliente no manda timestamp, usamos now() del servidor
    timestamp = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, onupdate=db.func.now(), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "device_id": self.device_id,
            "patient_id": self.patient_id,
            "metric_type": self.metric_type,
            "value": self.value,
            "unit": self.unit,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

