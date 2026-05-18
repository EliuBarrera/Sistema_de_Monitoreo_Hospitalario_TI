from flask import Blueprint, request, jsonify
from controllers.auth_controller import register, login, get_all_users

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/register", methods=["POST"])
def register_route():
    data = request.get_json()
    result = register(data)
    return jsonify(result), 200

@auth_bp.route("/login", methods=["POST"])
def login_route():
    data = request.get_json()
    return login(data)

@auth_bp.route("/users", methods=["GET"])
def get_all_users_route():
    result, status_code = get_all_users()
    return jsonify(result), status_code
