from models.roleModel import Role
from extensions import db

def get_all_roles():
    roles = Role.query.all()
    return [{"id": r.id, "name": r.name, "description": r.description} for r in roles], 200

def create_role(data):
    name = data.get("name")
    description = data.get("description", "")

    if Role.query.filter_by(name=name).first():
        return {"error": "El rol ya existe"}, 400

    new_role = Role(name=name, description=description)
    db.session.add(new_role)
    db.session.commit()

    return {"message": "Rol creado exitosamente", "role": {"id": new_role.id, "name": new_role.name}}, 201

def delete_role(role_id):
    role = Role.query.get(role_id)
    if not role:
        return {"error": "Rol no encontrado"}, 404

    db.session.delete(role)
    db.session.commit()
    return {"message": "Rol eliminado exitosamente"}, 200
