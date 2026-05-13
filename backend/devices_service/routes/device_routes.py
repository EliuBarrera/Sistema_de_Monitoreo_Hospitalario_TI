from flask import Blueprint, jsonify, request

from controllers.device_controller import *


device_bp = Blueprint("device_bp", __name__)


@device_bp.route("/", methods=["GET"])
def get_devices_route():
    result, status = get_all_devices(request.args)
    return jsonify(result), status


@device_bp.route("/<int:device_id>", methods=["GET"])
def get_device_route(device_id: int):
    result, status = get_device_by_id(device_id)
    return jsonify(result), status


@device_bp.route("/", methods=["POST"])
def create_device_route():
    data = request.get_json()
    result, status = create_device(data)
    return jsonify(result), status


@device_bp.route("/<int:device_id>", methods=["PUT"])
def update_device_route(device_id: int):
    data = request.get_json()
    result, status = update_device(device_id, data)
    return jsonify(result), status


@device_bp.route("/<int:device_id>", methods=["DELETE"])
def delete_device_route(device_id: int):
    result, status = delete_device(device_id)
    return jsonify(result), status

