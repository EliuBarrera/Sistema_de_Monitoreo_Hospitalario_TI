SECRET_KEY = "hospital_san_rafael_secret_2024"

class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://postgres:12345@db:5432/hospital_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
