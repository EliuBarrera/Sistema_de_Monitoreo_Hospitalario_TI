from flask import Blueprint, request, jsonify
from controllers.auth_controller import register, login

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/register", methods=["POST"])
def register_route():
    data = request.get_json()
    result, status = register(data)
    return jsonify(result), status  # Respeta el status code real (201, 400, 404, 502, 503...)


@auth_bp.route("/login", methods=["POST"])
def login_route():
    data = request.get_json()
    result, status = login(data)
    return jsonify(result), status  # Respeta el status code real (200, 400, 401, 404)