from models.user_model import User, Role
from extensions import db
from utils.jwt_handler import generate_token
from werkzeug.security import generate_password_hash, check_password_hash

def register(data):
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role_id = data.get("role_id")

    if not username or not email or not password:
        return {"error": "username, email y password son requeridos"}, 400

    if User.query.filter_by(email=email).first():
        return {"error": "El email ya está registrado"}, 400

    role = Role.query.get(role_id)

    if not role:
        return {"error": "El rol no existe"}, 404

    hashed_password = generate_password_hash(password)

    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        role_id=role_id
    )

    db.session.add(new_user)
    db.session.commit()

    return {"message": "Usuario registrado exitosamente", "user_id": new_user.id}, 201

def login(data):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"error": "email y password son requeridos"}, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"error": "Usuario no encontrado"}, 404

    if not check_password_hash(user.password, password):
        return {"error": "Credenciales incorrectas"}, 401

    role = Role.query.get(user.role_id)

    token = generate_token(user)

    return {
        "token": token,
        "user_id": user.id,
        "role": role.name
    }, 200

def get_all_users():
    users = User.query.all()
    return [user.to_dict() for user in users], 200

def get_all_roles():
    roles = Role.query.all()
    return [role.to_dict() for role in roles], 200