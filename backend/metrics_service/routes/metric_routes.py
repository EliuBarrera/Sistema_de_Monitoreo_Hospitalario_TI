from flask import Blueprint, jsonify, request

from controllers.metric_controller import (
    create_metric,
    delete_metric,
    get_all_metrics,
    get_metric_by_id,
    update_metric,
)
from utils.auth import require_auth


metrics_bp = Blueprint("metrics_bp", __name__)


@metrics_bp.route("/", methods=["GET"])
def list_metrics():
    result, status = get_all_metrics(request.args)
    return jsonify(result), status


@metrics_bp.route("/<int:metric_id>", methods=["GET"])
def get_metric(metric_id: int):
    result, status = get_metric_by_id(metric_id)
    return jsonify(result), status


@metrics_bp.route("/", methods=["POST"])
@require_auth
def new_metric():
    data = request.get_json()
    result, status = create_metric(data)
    return jsonify(result), status


@metrics_bp.route("/<int:metric_id>", methods=["PUT"])
@require_auth
def edit_metric(metric_id: int):
    data = request.get_json()
    result, status = update_metric(metric_id, data)
    return jsonify(result), status


@metrics_bp.route("/<int:metric_id>", methods=["DELETE"])
@require_auth
def remove_metric(metric_id: int):
    result, status = delete_metric(metric_id)
    return jsonify(result), status

