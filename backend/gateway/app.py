from flask import Flask, request, jsonify
import requests
from functools import wraps
import jwt
from dotenv import load_dotenv
import os
from flask_cors import CORS

app = Flask(__name__)
app.json.sort_keys = False
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

CORS(
    app,
    resources={
        r"/*": {
            "origins": "http://localhost:5173"
        }
    }
)

# Microservice configuration
SERVICE_URLS = {
    "auth": "http://localhost:5001/auth",
    "user": "http://localhost:5002/users",
    "devices": "http://localhost:5003/devices",
    "device_types": "http://localhost:5003/device-types",
    "locations": "http://localhost:5004/locations",
    "metrics": "http://localhost:5005/metrics",
    "alerts": "http://localhost:5006/alerts",
}

# ── Helpers de enriquecimiento ────────────────────────────────────────────────

def _fetch_json(url: str) -> dict | None:
    """GET a una URL; retorna el JSON o None si falla."""
    try:
        response = requests.get(url, timeout=5)
        return response.json() if response.status_code == 200 else None
    except requests.exceptions.RequestException:
        return None


def _enrich_device(device: dict) -> dict:
    """Agrega el objeto location al device."""
    location = None
    if location_id := device.get("location_id"):
        location = _fetch_json(f"{SERVICE_URLS['locations']}/{location_id}")
    device["location"] = location
    return device


def _enrich_metric(metric: dict) -> dict:
    """Agrega el objeto device (con su location) al metric."""
    device = None
    if device_id := metric.get("device_id"):
        device = _fetch_json(f"{SERVICE_URLS['devices']}/{device_id}")
        if device:
            _enrich_device(device)
    metric["device"] = device
    return metric


def _enrich_metrics(metrics: list[dict]) -> list[dict]:
    """
    Enriquece una lista de metrics evitando llamadas duplicadas:
    resuelve devices y locations por lotes de IDs únicos.
    """
    device_ids = {m["device_id"] for m in metrics if m.get("device_id")}
    devices_map = {
        did: device
        for did in device_ids
        if (device := _fetch_json(f"{SERVICE_URLS['devices']}/{did}"))
    }

    location_ids = {d["location_id"] for d in devices_map.values() if d.get("location_id")}
    locations_map = {
        lid: location
        for lid in location_ids
        if (location := _fetch_json(f"{SERVICE_URLS['locations']}/{lid}"))
    }

    for device in devices_map.values():
        device["location"] = locations_map.get(device.get("location_id"))

    for metric in metrics:
        metric["device"] = devices_map.get(metric.get("device_id"))

    return metrics


def _proxy(method: str, url: str, **kwargs):
    """Proxy genérico: reenvía la petición y retorna (json, status_code)."""
    try:
        response = requests.request(method, url, timeout=5, **kwargs)
        return jsonify(response.json()), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Servicio no disponible: {e}"}), 503


# ── Rutas ─────────────────────────────────────────────────────────────────────

# JWT - Token Verification
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Token requerido"}), 401
        try:
            token = auth_header.split(" ")[1]
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = decoded  # opcional (para roles luego)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401
        except Exception:
            return jsonify({"error": "Error en el token"}), 401

        return f(*args, **kwargs)

    return decorated

# AUTH ----------------------------------------
@app.route("/auth/register", methods=["POST"])
def register():
    response = requests.post(
        f"{SERVICE_URLS['auth']}/register",
        json=request.json
    )

    try:
        return jsonify(response.json()), response.status_code
    except Exception:
        return jsonify({
            "error": "La respuesta del servicio auth no es JSON",
            "status_code": response.status_code,
            "response": response.text
        }), 500


@app.route("/auth/login", methods=["POST"])
def login():
    response = requests.post(
        f"{SERVICE_URLS['auth']}/login",
        json=request.json
    )

    try:
        return jsonify(response.json()), response.status_code
    except Exception:
        return jsonify({
            "error": "La respuesta del servicio auth no es JSON",
            "status_code": response.status_code,
            "response": response.text
        }), 500

# MIX USERS - AUTH ----------------------------------------

@app.route("/users", methods=["GET"])
@token_required
def get_all_users():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['auth']}/users")
        return jsonify(response.json()), response.status_code

@app.route("/roles", methods=["GET"])
def get_all_roles():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['auth']}/roles")
        return jsonify(response.json()), response.status_code           

# USERS ----------------------------------------    

# GET BY ID (GET), UPDATE (PUT), DELETE (DELETE)
@app.route("/users/<int:id>", methods=["GET", "PUT", "DELETE"])
@token_required
def user_detail(id: int):
    url = f"{SERVICE_URLS['user']}/{id}"

    if request.method == "PUT":
        return _proxy("PUT", url, json=request.json)

    if request.method == "DELETE":
        return _proxy("DELETE", url)

    return _proxy("GET", url)

# LOCATIONS ----------------------------------------

# METHODS: GET ALL (GET), CREATE (POST)
@app.route("/locations", methods=["GET", "POST"])
@token_required
def locations():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['locations']}")
        return jsonify(response.json()), response.status_code
        
    if request.method == "POST":
        response = requests.post(f"{SERVICE_URLS['locations']}", json=request.json)
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)
        return jsonify(response.json()), response.status_code

# GET BY ID (GET), UPDATE (PUT), DELETE (DELETE)
@app.route("/locations/<int:id>", methods=["GET", "PUT", "DELETE"])
@token_required
def location_detail(id):
    
    if request.method == 'GET':
        response = requests.get(f"{SERVICE_URLS['locations']}/{id}")
    elif request.method == 'PUT':
        response = requests.put(f"{SERVICE_URLS['locations']}/{id}", json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(f"{SERVICE_URLS['locations']}/{id}")    
    return jsonify(response.json()), response.status_code

# DEVICES ----------------------------------------

# ── Helpers de enriquecimiento (lista) ───────────────────────────────────────

def _enrich_devices(devices: list[dict]) -> list[dict]:
    """Resuelve locations por lote de IDs únicos y las inyecta en cada device."""
    location_ids = {d["location_id"] for d in devices if d.get("location_id")}
    locations_map = {
        lid: location
        for lid in location_ids
        if (location := _fetch_json(f"{SERVICE_URLS['locations']}/{lid}"))
    }

    for device in devices:
        device["location"] = locations_map.get(device.get("location_id"))

    return devices


# Rutas DEVICES ─────────────────────────────────────────────────────────────

@app.route("/devices", methods=["GET", "POST"])
@token_required
def devices():
    if request.method == "POST":
        return _proxy("POST", f"{SERVICE_URLS['devices']}/", json=request.json)

    response = requests.get(f"{SERVICE_URLS['devices']}/", params=request.args, timeout=5)
    if response.status_code != 200:
        return jsonify(response.json()), response.status_code

    return jsonify(_enrich_devices(response.json())), 200


@app.route("/devices/<int:device_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def device_detail(device_id: int):
    url = f"{SERVICE_URLS['devices']}/{device_id}"

    if request.method == "PUT":
        return _proxy("PUT", url, json=request.json)

    if request.method == "DELETE":
        return _proxy("DELETE", url)

    response = requests.get(url, timeout=5)
    if response.status_code != 200:
        return jsonify(response.json()), response.status_code

    return jsonify(_enrich_device(response.json())), 200


# DEVICE TYPES ────────────────────────────────────────────────────────

@app.route("/device-types", methods=["GET", "POST"])
@token_required
def device_types():
    if request.method == "POST":
        return _proxy("POST", f"{SERVICE_URLS['device_types']}/", json=request.json)

    return _proxy("GET", f"{SERVICE_URLS['device_types']}/", params=request.args)


@app.route("/device-types/<int:type_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def device_type_detail(type_id: int):
    url = f"{SERVICE_URLS['device_types']}/{type_id}"

    if request.method == "PUT":
        return _proxy("PUT", url, json=request.json)

    if request.method == "DELETE":
        return _proxy("DELETE", url)

    return _proxy("GET", url)

# METRICS ----------------------------------------
@app.route("/metrics", methods=["GET", "POST"])
@token_required
def metrics():
    if request.method == "POST":
        return _proxy("POST", f"{SERVICE_URLS['metrics']}/", json=request.json)

    response = requests.get(f"{SERVICE_URLS['metrics']}/", params=request.args, timeout=5)
    if response.status_code != 200:
        return jsonify(response.json()), response.status_code

    return jsonify(_enrich_metrics(response.json())), 200


@app.route("/metrics/<int:metric_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def metric_detail(metric_id: int):
    url = f"{SERVICE_URLS['metrics']}/{metric_id}"

    if request.method == "PUT":
        return _proxy("PUT", url, json=request.json)

    if request.method == "DELETE":
        return _proxy("DELETE", url)

    response = requests.get(url, timeout=5)
    if response.status_code != 200:
        return jsonify(response.json()), response.status_code

    return jsonify(_enrich_metric(response.json())), 200


# ALERTS ----------------------------------------
# ── Rutas alerts ──────────────────────────────────────────────────────────────

def _enrich_alert(alert: dict) -> dict:
    """Agrega el objeto device (con su location) al alert."""
    device = None
    if device_id := alert.get("device_id"):
        device = _fetch_json(f"{SERVICE_URLS['devices']}/{device_id}")
        if device:
            _enrich_device(device)
    alert["device"] = device
    return alert


def _enrich_alerts(alerts: list[dict]) -> list[dict]:
    """Resuelve devices y locations por lote de IDs únicos."""
    device_ids = {a["device_id"] for a in alerts if a.get("device_id")}
    devices_map = {
        did: device
        for did in device_ids
        if (device := _fetch_json(f"{SERVICE_URLS['devices']}/{did}"))
    }

    location_ids = {d["location_id"] for d in devices_map.values() if d.get("location_id")}
    locations_map = {
        lid: location
        for lid in location_ids
        if (location := _fetch_json(f"{SERVICE_URLS['locations']}/{lid}"))
    }

    for device in devices_map.values():
        device["location"] = locations_map.get(device.get("location_id"))

    for alert in alerts:
        alert["device"] = devices_map.get(alert.get("device_id"))

    return alerts


@app.route("/alerts/severities", methods=["GET", "POST"])
@token_required
def alert_severities():
    if request.method == "POST":
        return _proxy("POST", f"{SERVICE_URLS['alerts']}/severities", json=request.json)
    return _proxy("GET", f"{SERVICE_URLS['alerts']}/severities")


@app.route("/alerts", methods=["GET", "POST"])
@token_required
def alerts():
    if request.method == "POST":
        return _proxy("POST", f"{SERVICE_URLS['alerts']}/", json=request.json)

    response = requests.get(f"{SERVICE_URLS['alerts']}/", params=request.args, timeout=5)
    if response.status_code != 200:
        return jsonify(response.json()), response.status_code

    return jsonify(_enrich_alerts(response.json())), 200


@app.route("/alerts/device/<int:device_id>", methods=["GET"])
@token_required
def alerts_by_device(device_id: int):
    response = requests.get(f"{SERVICE_URLS['alerts']}/device/{device_id}", timeout=5)
    if response.status_code != 200:
        return jsonify(response.json()), response.status_code

    return jsonify(_enrich_alerts(response.json())), 200


@app.route("/alerts/<int:alert_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def alert_detail(alert_id: int):
    url = f"{SERVICE_URLS['alerts']}/{alert_id}"

    if request.method == "PUT":
        return _proxy("PUT", url, json=request.json)

    if request.method == "DELETE":
        return _proxy("DELETE", url)

    response = requests.get(url, timeout=5)
    if response.status_code != 200:
        return jsonify(response.json()), response.status_code

    return jsonify(_enrich_alert(response.json())), 200


if __name__ == "__main__":
    app.run(port=5000, debug=True)