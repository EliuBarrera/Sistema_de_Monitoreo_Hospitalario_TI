from extensions import db
from models.deviceTypeModel import DeviceType


def get_all_device_types():
    types_ = DeviceType.query.all()
    return [t.to_dict() for t in types_], 200


def get_device_type_by_id(type_id: int):
    device_type = DeviceType.query.get(type_id)
    if not device_type:
        return {"error": "Tipo de dispositivo no encontrado"}, 404
    return device_type.to_dict(), 200


def create_device_type(data):
    name = (data or {}).get("name")
    description = (data or {}).get("description", "")

    if not name:
        return {"error": "El campo 'name' es requerido"}, 400

    if DeviceType.query.filter_by(name=name).first():
        return {"error": "El tipo de dispositivo ya existe"}, 400

    new_type = DeviceType(name=name, description=description)
    db.session.add(new_type)
    db.session.commit()

    return {"message": "Tipo de dispositivo creado exitosamente", "device_type": new_type.to_dict()}, 201


def update_device_type(type_id: int, data):
    device_type = DeviceType.query.get(type_id)
    if not device_type:
        return {"error": "Tipo de dispositivo no encontrado"}, 404

    data = data or {}

    if "name" in data:
        name = data.get("name")
        if not name:
            return {"error": "El campo 'name' no puede ser vacío"}, 400
        existing = DeviceType.query.filter_by(name=name).first()
        if existing and existing.id != device_type.id:
            return {"error": "El tipo de dispositivo ya existe"}, 400
        device_type.name = name

    if "description" in data:
        device_type.description = data.get("description")

    db.session.commit()
    return {"message": "Tipo de dispositivo actualizado exitosamente", "device_type": device_type.to_dict()}, 200


def delete_device_type(type_id: int):
    device_type = DeviceType.query.get(type_id)
    if not device_type:
        return {"error": "Tipo de dispositivo no encontrado"}, 404

    db.session.delete(device_type)
    db.session.commit()
    return {"message": "Tipo de dispositivo eliminado exitosamente"}, 200

