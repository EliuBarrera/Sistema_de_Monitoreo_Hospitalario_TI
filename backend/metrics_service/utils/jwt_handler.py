import jwt

from config import Config


def decode_token(token: str):
    return jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])

