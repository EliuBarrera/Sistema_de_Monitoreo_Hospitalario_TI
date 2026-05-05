import jwt
import datetime
from config import Config

SECRET_KEY = Config.SECRET_KEY

def generate_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")