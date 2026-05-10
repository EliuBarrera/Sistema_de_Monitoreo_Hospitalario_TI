from sqlalchemy import null
from models.location_model import Location
from extensions import db

def get_all_locations():
    roots = Location.query.filter_by(parent_location_id=None).order_by(Location.id).all()
    return [serialize_location(location) for location in roots], 200

def get_location(location_id):
    location = Location.query.get(location_id)

    if not location:
        return {"error": "Location not found"}, 404

    return serialize_location(location), 200

def create_location(data):
    # Usamos .get() en lugar de corchetes para que no explote si no viene la llave.
    # Si no existe "parent_location_id" en el JSON, devolverá None por defecto.
    parent_id = data.get("parent_location_id")

    # Opcional: Validar que si envían un parent_id, este realmente exista en la DB
    if parent_id is not None:
        parent_exists = Location.query.get(parent_id)
        if not parent_exists:
            return {"error": f"La locación padre con ID {parent_id} no existe"}, 400

    new_location = Location(
        name=data["name"],
        building=data["building"],
        floor=data["floor"],
        room=data["room"],
        description=data["description"],
        parent_location_id=parent_id  # Aquí pasará el ID o None (raíz)
    )    
    db.session.add(new_location)
    db.session.commit()

    return {
        "location": serialize_location(new_location),
        "message": "Location created successfully"
    }, 201


def update_location(location_id, data):
    location = Location.query.get(location_id)

    if not location:
        return {"error": "Location not found"}, 404
    
    # Validación del padre en actualización
    parent_id = data.get("parent_location_id")
    if parent_id:
        # Evitar que una locación sea su propio padre (circularidad básica)
        if int(parent_id) == int(location_id):
            return {"error": "Una locación no puede ser padre de sí misma"}, 400
            
        existing_parent = Location.query.get(parent_id)
        if not existing_parent:
            return {"error": "Parent location not found"}, 404

    location.name = data.get("name", location.name)
    location.building = data.get("building", location.building)
    location.floor = data.get("floor", location.floor)
    location.room = data.get("room", location.room)
    location.description = data.get("description", location.description)
    
    if "parent_location_id" in data:
        location.parent_location_id = data["parent_location_id"]

    db.session.commit()

    return {
        "location": serialize_location(location),
        "message": "Location successfully updated"
    }, 200

def delete_location(location_id):
    location = Location.query.get(location_id)
    if not location:
        return {"error": "Location not found"}, 404

    if location.children:
        return {"error": "No se puede eliminar una ubicación con sub-ubicaciones asociadas"}, 409

    db.session.delete(location)
    db.session.commit()
    return {"message": "Location deleted successfully"}, 200

def serialize_location(location):
    if location is None:
        return None
    return {
        "id": location.id,
        "name": location.name,
        "building": location.building,
        "floor": location.floor,
        "room": location.room,
        "description": location.description,
        "parent_location_id": location.parent_location_id,
        "children": [serialize_location(child) for child in location.children]
    }