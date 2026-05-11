from functools import wraps

from flask import request

from utils.jwt_handler import decode_token


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return {"error": "Token faltante"}, 401

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return {"error": "Token faltante"}, 401

        try:
            decode_token(token)
        except Exception:
            return {"error": "Token inválido o expirado"}, 401

        return fn(*args, **kwargs)

    return wrapper

