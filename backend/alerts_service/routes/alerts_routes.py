from flask import Blueprint, request, jsonify
from controllers.alert_controller import (
    get_all_alerts, get_alert, get_alerts_by_device,
    create_alert, update_alert, delete_alert,
    get_all_severities, create_severity
)

alerts_bp = Blueprint("alerts_bp", __name__)

# ALERT SEVERITIES

@alerts_bp.route("/severities", methods=["GET"])
def list_severities():
    result, status = get_all_severities()
    return jsonify(result), status

@alerts_bp.route("/severities", methods=["POST"])
def new_severity():
    data = request.get_json()
    result, status = create_severity(data)
    return jsonify(result), status

# ALERTS

@alerts_bp.route("/", methods=["GET"])
def list_alerts():
    result, status = get_all_alerts()
    return jsonify(result), status

@alerts_bp.route("/", methods=["POST"])
def new_alert():
    data = request.get_json()
    result, status = create_alert(data)
    return jsonify(result), status

@alerts_bp.route("/device/<int:device_id>", methods=["GET"])
def alerts_by_device(device_id):
    result, status = get_alerts_by_device(device_id)
    return jsonify(result), status

@alerts_bp.route("/<int:alert_id>", methods=["GET"])
def detail_alert(alert_id):
    result, status = get_alert(alert_id)
    return jsonify(result), status

@alerts_bp.route("/<int:alert_id>", methods=["PUT"])
def edit_alert(alert_id):
    data = request.get_json()
    result, status = update_alert(alert_id, data)
    return jsonify(result), status

@alerts_bp.route("/<int:alert_id>", methods=["DELETE"])
def remove_alert(alert_id):
    result, status = delete_alert(alert_id)
    return jsonify(result), status
