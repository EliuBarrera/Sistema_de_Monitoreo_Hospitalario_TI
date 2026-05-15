from models.user_model import User, Role  # user_model.py (antes userModel.py)
from extensions import db
from werkzeug.security import generate_password_hash

# USERS 

def get_all_users():
    users = User.query.all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role_id": u.role_id,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return result, 200

def get_user(user_id):
    u = User.query.get(user_id)
    if not u:
        return {"error": "Usuario no encontrado"}, 404
    return {
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "role_id": u.role_id,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat() if u.created_at else None
    }, 200

def create_user(data):
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role_id = data.get("role_id")

    if not username or not email or not password:
        return {"error": "username, email y password son requeridos"}, 400

    if User.query.filter_by(email=email).first():
        return {"error": "El email ya está registrado"}, 400

    if User.query.filter_by(username=username).first():
        return {"error": "El username ya está en uso"}, 400

    new_user = User(
        username=username,
        email=email,
        password=generate_password_hash(password),
        role_id=role_id
    )
    db.session.add(new_user)
    db.session.commit()
    return {"message": "Usuario creado", "id": new_user.id}, 201

def update_user(user_id, data):
    u = User.query.get(user_id)
    if not u:
        return {"error": "Usuario no encontrado"}, 404

    if "username" in data:
        u.username = data["username"]
    if "email" in data:
        u.email = data["email"]
    if "password" in data:
        u.password = generate_password_hash(data["password"])
    if "role_id" in data:
        u.role_id = data["role_id"]
    if "is_active" in data:
        u.is_active = data["is_active"]

    db.session.commit()
    return {"message": "Usuario actualizado"}, 200

def delete_user(user_id):
    u = User.query.get(user_id)
    if not u:
        return {"error": "Usuario no encontrado"}, 404
    db.session.delete(u)
    db.session.commit()
    return {"message": "Usuario eliminado"}, 200

# ROLES

def get_all_roles():
    roles = Role.query.all()
    return [{"id": r.id, "name": r.name, "description": r.description} for r in roles], 200

def create_role(data):
    name = data.get("name")
    if not name:
        return {"error": "name es requerido"}, 400
    if Role.query.filter_by(name=name).first():
        return {"error": "El rol ya existe"}, 400
    new_role = Role(name=name, description=data.get("description", ""))
    db.session.add(new_role)
    db.session.commit()
    return {"message": "Rol creado", "id": new_role.id}, 201
