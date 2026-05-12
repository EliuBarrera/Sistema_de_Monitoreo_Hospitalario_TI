from flask import Blueprint, jsonify, request

from controllers.device_type_controller import *

device_type_bp = Blueprint("device_type_bp", __name__)


@device_type_bp.route("/", methods=["GET"])
def get_device_types_route():
    result, status = get_all_device_types()
    return jsonify(result), status


@device_type_bp.route("/<int:type_id>", methods=["GET"])
def get_device_type_route(type_id: int):
    result, status = get_device_type_by_id(type_id)
    return jsonify(result), status


@device_type_bp.route("/", methods=["POST"])
def create_device_type_route():
    data = request.get_json()
    result, status = create_device_type(data)
    return jsonify(result), status


@device_type_bp.route("/<int:type_id>", methods=["PUT"])
def update_device_type_route(type_id: int):
    data = request.get_json()
    result, status = update_device_type(type_id, data)
    return jsonify(result), status


@device_type_bp.route("/<int:type_id>", methods=["DELETE"])
def delete_device_type_route(type_id: int):
    result, status = delete_device_type(type_id)
    return jsonify(result), status

