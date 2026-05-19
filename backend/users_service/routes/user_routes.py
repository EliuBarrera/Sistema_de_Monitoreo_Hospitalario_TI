from flask import Blueprint, request, jsonify
from controllers.user_controller import (
    get_all_users, get_user, create_user, update_user, delete_user,
    get_all_roles, create_role
)

users_bp = Blueprint("users_bp", __name__)

# USERS

@users_bp.route("/", methods=["GET"])
def list_users():
    result, status = get_all_users()
    return jsonify(result), status

@users_bp.route("/", methods=["POST"])
def new_user():
    data = request.get_json()
    result, status = create_user(data)
    return jsonify(result), status

@users_bp.route("/<int:user_id>", methods=["GET"])
def detail_user(user_id):
    result, status = get_user(user_id)
    return jsonify(result), status

@users_bp.route("/<int:user_id>", methods=["PUT"])
def edit_user(user_id):
    data = request.get_json()
    result, status = update_user(user_id, data)
    return jsonify(result), status

@users_bp.route("/<int:user_id>", methods=["DELETE"])
def remove_user(user_id):
    result, status = delete_user(user_id)
    return jsonify(result), status

# ROLES

@users_bp.route("/roles", methods=["GET"])
def list_roles():
    result, status = get_all_roles()
    return jsonify(result), status

@users_bp.route("/roles", methods=["POST"])
def new_role():
    data = request.get_json()
    result, status = create_role(data)
    return jsonify(result), status
