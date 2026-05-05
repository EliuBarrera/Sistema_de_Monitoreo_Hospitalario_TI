from flask import Flask
from routes.user_routes import user_bp
from routes.role_routes import role_bp
from config import Config
from extensions import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False
    db.init_app(app)
    
    app.register_blueprint(user_bp, url_prefix="/users")
    app.register_blueprint(role_bp, url_prefix="/roles")

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(port=5004, debug=True)
