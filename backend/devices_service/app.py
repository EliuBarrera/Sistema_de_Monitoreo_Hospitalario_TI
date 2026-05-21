from flask import Flask

from config import Config
from extensions import db
from routes.device_routes import device_bp
from routes.device_type_routes import device_type_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False

    db.init_app(app)

    app.register_blueprint(device_bp, url_prefix="/devices")
    app.register_blueprint(device_type_bp, url_prefix="/device-types")

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5003, debug=True)
