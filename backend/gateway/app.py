from flask import Flask, request, jsonify
import requests
from functools import wraps
import jwt

app = Flask(__name__)
app.json.sort_keys = False
SECRET_KEY = "super_secret_key_please_change_me"

# Microservice configuration
SERVICE_URLS = {
    "auth": "http://localhost:5001/auth",
    "user": "http://localhost:5002/users",
    "locations": "http://localhost:5004/locations"
}

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

# AUHT ----------------------------------------
@app.route("/auth/register", methods=["POST"])
def register():
    response = requests.post(f"{SERVICE_URLS['auth']}/register", json=request.json)
    return jsonify(response.json()), response.status_code

@app.route("/auth/login", methods=["POST"])
def login():
    response = requests.post(f"{SERVICE_URLS['auth']}/login", json=request.json)
    return jsonify(response.json()), response.status_code

# GET BY ID (GET), UPDATE (PUT), DELETE (DELETE)
@app.route("/users/<int:id>", methods=["GET", "PUT", "DELETE"])
@token_required
def user_detail(id):
    
    if request.method == 'GET':
        response = requests.get(f"{SERVICE_URLS['user']}/{id}")
    elif request.method == 'PUT':
        response = requests.put(f"{SERVICE_URLS['user']}/{id}", json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(f"{SERVICE_URLS['user']}/{id}")    
    return jsonify(response.json()), response.status_code

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

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False
    db.init_app(app)
    app.register_blueprint(location_bp, url_prefix="/locations")
    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(port=5000, debug=True)
