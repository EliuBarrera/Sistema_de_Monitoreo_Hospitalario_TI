from flask import Blueprint, request, jsonify
from controllers.user_controller import get_all_users, get_user_by_id, create_user, update_user, delete_user

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/", methods=["GET"])
def get_users_route():
    result, status = get_all_users()
    return jsonify(result), status

@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user_route(user_id):
    result, status = get_user_by_id(user_id)
    return jsonify(result), status

@user_bp.route("/", methods=["POST"])
def create_user_route():
    data = request.get_json()
    result, status = create_user(data)
    return jsonify(result), status

@user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user_route(user_id):
    data = request.get_json()
    result, status = update_user(user_id, data)
    return jsonify(result), status

@user_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user_route(user_id):
    result, status = delete_user(user_id)
    return jsonify(result), status
