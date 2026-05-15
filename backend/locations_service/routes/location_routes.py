from flask import Blueprint, jsonify, request
from controller.location_controller import (
    get_all_locations, get_location, create_location, update_location, delete_location
)

location_bp = Blueprint("locations_bp", __name__)


@location_bp.route("/", methods=["GET"])
def get_locations_route():
    result, status = get_all_locations()
    return jsonify(result), status


@location_bp.route("/<int:location_id>", methods=["GET"])
def get_location_route(location_id):
    result, status = get_location(location_id)
    return jsonify(result), status


@location_bp.route("/", methods=["POST"])
def create_location_route():
    result, status = create_location(request.json)
    return jsonify(result), status


@location_bp.route("/<int:location_id>", methods=["PUT"])
def update_location_route(location_id):
    result, status = update_location(location_id, request.json)
    return jsonify(result), status


@location_bp.route("/<int:location_id>", methods=["DELETE"])
def delete_location_route(location_id):
    result, status = delete_location(location_id)
    return jsonify(result), status
