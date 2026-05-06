from extensions import db

class Device(db.Model):
    __tablename__ = 'devices'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    ip_address = db.Column(db.String(50), nullable=False)
    mac_address = db.Column(db.String(50), nullable=False)
    brand = db.Column(db.String(50), nullable=True)
    device_type_id = db.Column(db.Integer, db.ForeignKey('device_types.id'), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False)
    status = db.Column(db.String(50), nullable=True)
    model = db.Column(db.String(50), nullable=True)
    serial_number = db.Column(db.String(50), nullable=True)
    intstalled_date = db.Column(db.DateTime, nullable=True)
    last_seen = db.Column(db.DateTime, nullable=True)
    