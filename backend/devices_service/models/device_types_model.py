from extensions import db

class DeviceType(db.Model):
    __tablename__ = 'device_types'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(50), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False)

    devices = db.relationship('Device', backref='device_type', lazy=True)