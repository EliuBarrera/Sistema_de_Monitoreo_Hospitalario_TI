from flask import Blueprint, request, jsonify
from controllers.role_controller import get_all_roles, create_role, delete_role

role_bp = Blueprint("role_bp", __name__)

@role_bp.route("/", methods=["GET"])
def get_roles_route():
    result, status = get_all_roles()
    return jsonify(result), status

@role_bp.route("/", methods=["POST"])
def create_role_route():
    data = request.get_json()
    result, status = create_role(data)
    return jsonify(result), status

@role_bp.route("/<int:role_id>", methods=["DELETE"])
def delete_role_route(role_id):
    result, status = delete_role(role_id)
    return jsonify(result), status
