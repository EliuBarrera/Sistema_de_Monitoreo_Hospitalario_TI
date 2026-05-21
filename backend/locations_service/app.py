from flask import Flask
from routes.location_routes import location_bp
from config import Config
from extensions import db

app = Flask(__name__)
app.config.from_object(Config)
app.json.sort_keys = False
db.init_app(app)
app.register_blueprint(location_bp)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5004, debug=True)
