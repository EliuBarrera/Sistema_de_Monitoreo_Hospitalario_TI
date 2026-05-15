from flask import Flask, request, jsonify
import requests
from functools import wraps
import jwt
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.json.sort_keys = False
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

# ─── URLs de cada microservicio ─────────────────────────────────────────────
SERVICE_URLS = {
    "auth":         os.getenv("AUTH_SERVICE_URL",      "http://localhost:5001") + "/auth",
    "users":        os.getenv("USERS_SERVICE_URL",     "http://localhost:5002") + "/users",
    "devices":      os.getenv("DEVICES_SERVICE_URL",   "http://localhost:5003") + "/devices",
    "device_types": os.getenv("DEVICES_SERVICE_URL",   "http://localhost:5003") + "/device-types",
    "locations":    os.getenv("LOCATIONS_SERVICE_URL", "http://localhost:5004") + "/locations",
    "metrics":      os.getenv("METRICS_SERVICE_URL",   "http://localhost:5005") + "/metrics",
    "alerts":       os.getenv("ALERTS_SERVICE_URL",    "http://localhost:5006") + "/alerts",
}

# ─── Cabeceras seguras para reenviar a los microservicios ───────────────────
FORWARD_HEADERS = {"Content-Type": "application/json"}


# ─── Middleware: verificación JWT ───────────────────────────────────────────
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Token requerido"}), 401
        try:
            token = auth_header.split(" ")[1]
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = decoded
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401
        except Exception:
            return jsonify({"error": "Error en el token"}), 401

        return f(*args, **kwargs)

    return decorated


# ─── Helper: proxy genérico con manejo de errores ───────────────────────────
def proxy(response):
    try:
        return jsonify(response.json()), response.status_code
    except Exception:
        return jsonify({
            "error": "Respuesta no JSON del microservicio",
            "status_code": response.status_code,
            "body": response.text[:500]
        }), 502


# ════════════════════════════════════════════════════════════════════════════
# AUTH
# ════════════════════════════════════════════════════════════════════════════

@app.route("/auth/register", methods=["POST"])
def auth_register():
    response = requests.post(f"{SERVICE_URLS['auth']}/register", json=request.json)
    return proxy(response)


@app.route("/auth/login", methods=["POST"])
def auth_login():
    response = requests.post(f"{SERVICE_URLS['auth']}/login", json=request.json)
    return proxy(response)


# ════════════════════════════════════════════════════════════════════════════
# USERS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/users", methods=["GET", "POST"])
@token_required
def users():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['users']}/")
    else:
        response = requests.post(f"{SERVICE_URLS['users']}/", json=request.json)
    return proxy(response)


@app.route("/users/<int:user_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def user_detail(user_id):
    url = f"{SERVICE_URLS['users']}/{user_id}"
    if request.method == "GET":
        response = requests.get(url)
    elif request.method == "PUT":
        response = requests.put(url, json=request.json)
    else:
        response = requests.delete(url)
    return proxy(response)


# ─── Roles (sub-recurso de users) ───────────────────────────────────────────

@app.route("/users/roles", methods=["GET", "POST"])
@token_required
def user_roles():
    url = f"{SERVICE_URLS['users']}/roles"
    if request.method == "GET":
        response = requests.get(url)
    else:
        response = requests.post(url, json=request.json)
    return proxy(response)


# ════════════════════════════════════════════════════════════════════════════
# LOCATIONS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/locations", methods=["GET", "POST"])
@token_required
def locations():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['locations']}/")
    else:
        response = requests.post(f"{SERVICE_URLS['locations']}/", json=request.json)
    return proxy(response)


@app.route("/locations/<int:location_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def location_detail(location_id):
    url = f"{SERVICE_URLS['locations']}/{location_id}"
    if request.method == "GET":
        response = requests.get(url)
    elif request.method == "PUT":
        response = requests.put(url, json=request.json)
    else:
        response = requests.delete(url)
    return proxy(response)


# ════════════════════════════════════════════════════════════════════════════
# DEVICES
# ════════════════════════════════════════════════════════════════════════════

@app.route("/devices", methods=["GET", "POST"])
@token_required
def devices():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['devices']}/", params=request.args)
    else:
        response = requests.post(f"{SERVICE_URLS['devices']}/", json=request.json)
    return proxy(response)


@app.route("/devices/<int:device_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def device_detail(device_id):
    url = f"{SERVICE_URLS['devices']}/{device_id}"
    if request.method == "GET":
        response = requests.get(url)
    elif request.method == "PUT":
        response = requests.put(url, json=request.json)
    else:
        response = requests.delete(url)
    return proxy(response)


# ─── Device Types ─────────────────────────────────────────────────────────

@app.route("/device-types", methods=["GET", "POST"])
@token_required
def device_types():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['device_types']}/", params=request.args)
    else:
        response = requests.post(f"{SERVICE_URLS['device_types']}/", json=request.json)
    return proxy(response)


@app.route("/device-types/<int:type_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def device_type_detail(type_id):
    url = f"{SERVICE_URLS['device_types']}/{type_id}"
    if request.method == "GET":
        response = requests.get(url)
    elif request.method == "PUT":
        response = requests.put(url, json=request.json)
    else:
        response = requests.delete(url)
    return proxy(response)


# ════════════════════════════════════════════════════════════════════════════
# METRICS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/metrics", methods=["GET", "POST"])
@token_required
def metrics():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['metrics']}/", params=request.args)
    else:
        response = requests.post(f"{SERVICE_URLS['metrics']}/", json=request.json)
    return proxy(response)


@app.route("/metrics/<int:metric_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def metric_detail(metric_id):
    url = f"{SERVICE_URLS['metrics']}/{metric_id}"
    if request.method == "GET":
        response = requests.get(url)
    elif request.method == "PUT":
        response = requests.put(url, json=request.json)
    else:
        response = requests.delete(url)
    return proxy(response)


# ════════════════════════════════════════════════════════════════════════════
# ALERTS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/alerts", methods=["GET", "POST"])
@token_required
def alerts():
    if request.method == "GET":
        response = requests.get(f"{SERVICE_URLS['alerts']}/", params=request.args)
    else:
        response = requests.post(f"{SERVICE_URLS['alerts']}/", json=request.json)
    return proxy(response)


@app.route("/alerts/<int:alert_id>", methods=["GET", "PUT", "DELETE"])
@token_required
def alert_detail(alert_id):
    url = f"{SERVICE_URLS['alerts']}/{alert_id}"
    if request.method == "GET":
        response = requests.get(url)
    elif request.method == "PUT":
        response = requests.put(url, json=request.json)
    else:
        response = requests.delete(url)
    return proxy(response)


# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    app.run(port=5000, debug=True)