from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from .extensions import db
from .models import User

auth_bp = Blueprint("auth", __name__)


def _json_error(message: str, status_code: int):
    return jsonify(error=message), status_code


@auth_bp.post("/api/auth/register")
def register():
    """
    Create a new user account.

    Expects JSON:
    - username
    - email
    - password
    """
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not username or not email or not password:
        return _json_error("username, email, and password are required", 400)

    user = User(username=username, email=email)
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return _json_error("username or email already exists", 409)

    return jsonify(user=user.to_public_dict()), 201


@auth_bp.post("/api/auth/login")
def login():
    """
    Authenticate a user and return a JWT.

    Expects JSON:
    - username_or_email
    - password
    """
    payload = request.get_json(silent=True) or {}
    username_or_email = (payload.get("username_or_email") or "").strip()
    password = payload.get("password") or ""

    if not username_or_email or not password:
        return _json_error("username_or_email and password are required", 400)

    normalized_login = username_or_email.lower()
    user = User.query.filter(
        or_(User.username == username_or_email, User.email == normalized_login)
    ).first()

    if user is None or not user.check_password(password):
        return _json_error("invalid credentials", 401)

    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token, user=user.to_public_dict()), 200


@auth_bp.get("/api/auth/me")
@jwt_required()
def me():
    """
    Return the current authenticated user's public profile.
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id) if user_id is not None else None
    if user is None:
        return _json_error("user not found", 404)
    return jsonify(user=user.to_public_dict()), 200

