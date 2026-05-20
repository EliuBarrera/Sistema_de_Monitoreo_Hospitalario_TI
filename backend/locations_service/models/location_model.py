from extensions import db

class Location(db.Model):
    __tablename__ = "locations"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    building = db.Column(db.String(50), nullable=False)
    floor = db.Column(db.Integer, nullable=True)
    room = db.Column(db.String(50), nullable=True)
    description = db.Column(db.String(255), nullable=False)
    parent_location_id = db.Column(db.Integer, db.ForeignKey("locations.id"))

    # Auto-referencia: remote_side=[id] le dice que 'id' es el lado "uno"
    children = db.relationship('Location', backref=db.backref('parent', remote_side=[id]))