from models.userModel import User
from extensions import db
from werkzeug.security import generate_password_hash

def get_all_users():
    users = User.query.all()
    return [user.to_dict() for user in users], 200

def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"error": "Usuario no encontrado"}, 404
    return user.to_dict(), 200

def create_user(data):
    email = data.get("email")
    password = data.get("password")
    role_id = data.get("role_id")

    if User.query.filter_by(email=email).first():
        return {"error": "El usuario ya existe"}, 400

    hashed_password = generate_password_hash(password)

    new_user = User(
        email=email,
        password=hashed_password,
        role_id=role_id
    )

    db.session.add(new_user)
    db.session.commit()

    return {"message": "Usuario creado exitosamente", "user": new_user.to_dict()}, 201

def update_user(user_id, data):
    user = User.query.get(user_id)
    if not user:
        return {"error": "Usuario no encontrado"}, 404

    if "email" in data:
        user.email = data["email"]
    if "role_id" in data:
        user.role_id = data["role_id"]
    if "password" in data:
        user.password = generate_password_hash(data["password"])

    db.session.commit()
    return {"message": "Usuario actualizado exitosamente", "user": user.to_dict()}, 200

def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"error": "Usuario no encontrado"}, 404

    db.session.delete(user)
    db.session.commit()
    return {"message": "Usuario eliminado exitosamente"}, 200
