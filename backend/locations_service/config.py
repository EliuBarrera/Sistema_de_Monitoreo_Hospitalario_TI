class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://postgres:123456@localhost:5432/microservices_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

SECRET_KEY = "super_secret_key"
