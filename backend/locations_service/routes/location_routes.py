from flask import Blueprint, jsonify, request
from controller.location_controller import *

location_bp = Blueprint('locations_bp', __name__)

@location_bp.route('/locations', methods=['GET'])
def get_locations_route():
    return jsonify(get_all_locations())

@location_bp.route('/locations/<id>', methods=['GET'])
def get_location_route(id):
    return jsonify(get_location(id))

@location_bp.route('/locations', methods=['POST'])
def create_location_route():
    return jsonify(create_location(request.json))

@location_bp.route('/locations/<id>', methods=['PUT'])
def update_location_route(id):
    return jsonify(update_location(id, request.json))

@location_bp.route('/locations/<id>', methods=['DELETE'])
def delete_location_route(id):
    return jsonify(delete_location(id))

