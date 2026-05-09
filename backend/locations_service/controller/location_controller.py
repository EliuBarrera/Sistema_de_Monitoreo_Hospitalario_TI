from sqlalchemy import null
from models.location_model import Location
from extensions import db

def get_all_locations():
    locations = Location.query.order_by(Location.id).all()
    return [serialize_location(location) for location in locations], 200

def get_location_by_id(location_id):
    location = Location.query.get(location_id)

    if not location:
        return {"error": "Location not found"}, 404

    return serialize_location(location), 200

def create_location(data):
    new_location = Location(
        name=data["name"],
        building=data["building"],
        floor=data["floor"],
        room=data["room"],
        description=data["description"],
        parent_location_id=data["parent_location_id"]
    )

    if Location.query.filter_by(id=new_location.id).first():
        return {"error": "Location already exists"}, 409
    
    db.session.add(new_location)
    db.session.commit()

    return serialize_location(new_location), {"message": "Location created successfully"}, 201


def update_location(location_id, data):
    location = Location.query.get(location_id)

    if not location:
        return {"error": "Location not found"}, 404
    
    existing_location = Location.query.filter_by(id=location.parent_location_id)

    if not existing_location:
        return {"error": "Parent location not found"}, 404

    location.name = data["name"]
    location.building = data["building"]
    location.floor = data["floor"]
    location.room = data["room"]
    location.description = data["description"]
    location.parent_location_id = data["parent_location_id"]

    db.session.commit()

    return serialize_location(location), {"message": "Location succesfully updated"}, 200

def delete_location(location_id):
    location = Location.query.get(location_id)
    if not location:
        return {"error": "Location not found"}, 404

    db.session.delete(location)
    db.session.commit()

    return {"message": "Location is deleted successfully"}, 200

def serialize_location(location):
    return {
        "id": location.id,
        "name": location.name,
        "building": location.building,
        "floor": location.floor,
        "room": location.room,
        "description": location.description,
        "parent_location_id": location.parent_location_id
    }