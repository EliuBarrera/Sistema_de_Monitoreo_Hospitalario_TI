class Config:
    SECRET_KEY = "super_secret_key"
    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://postgres:12345@db:5432/microservices_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

