from extensions import db


class Device(db.Model):
    __tablename__ = "devices"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    serial_number = db.Column(db.String(120), unique=True, nullable=False)
    status = db.Column(db.String(30), nullable=False, default="active")
    location = db.Column(db.String(120), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)

    device_type_id = db.Column(db.Integer, db.ForeignKey("device_types.id"), nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, onupdate=db.func.now(), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "serial_number": self.serial_number,
            "status": self.status,
            "location": self.location,
            "ip_address": self.ip_address,
            "device_type_id": self.device_type_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

