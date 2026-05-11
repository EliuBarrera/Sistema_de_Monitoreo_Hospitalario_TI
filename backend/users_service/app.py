from flask import Flask
from routes.users_routes import users_bp
from config import Config
from extensions import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False
    db.init_app(app)
    app.register_blueprint(users_bp, url_prefix="/users")
    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(port=5002, debug=True)
