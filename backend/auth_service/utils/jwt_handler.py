import jwt
import datetime
from config import SECRET_KEY

def generate_token(user):
    payload = {
        "user_id": user.id,
        "role_id": user.role_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
