from extensions import db

class Location(db.Model):
    __tablename__ = "locations"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    building = db.Column(db.String(50), nullable=False)
    floor = db.Column(db.Integer, nullable=False)
    room = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(50), nullable=False)
    parent_location_id = db.Column(db.Integer, db.ForeignKey("location.id"))