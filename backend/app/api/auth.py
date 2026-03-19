from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import User
from ..utils import api_response

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/register")
def register():
    """
    Create a new user account.
    """
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not username or not email or not password:
        return api_response(success=False, error="username, email, and password are required", status_code=400)

    user = User(username=username, email=email)
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return api_response(success=False, error="username or email already exists", status_code=409)

    return api_response(data={"user": user.to_public_dict()}, status_code=201)

@auth_bp.post("/login")
def login():
    """
    Authenticate a user and return a JWT.
    """
    payload = request.get_json(silent=True) or {}
    username_or_email = (payload.get("username_or_email") or "").strip()
    password = payload.get("password") or ""

    if not username_or_email or not password:
        return api_response(success=False, error="username_or_email and password are required", status_code=400)

    user = (
        User.query.filter(User.username == username_or_email).first()
        or User.query.filter(User.email == username_or_email.lower()).first()
    )

    if user is None or not user.check_password(password):
        return api_response(success=False, error="invalid credentials", status_code=401)

    access_token = create_access_token(identity=str(user.id))
    return api_response(data={
        "access_token": access_token,
        "user": user.to_public_dict()
    })

@auth_bp.get("/me")
@jwt_required()
def me():
    """
    Return the current authenticated user's public profile.
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id)) if user_id is not None else None
    if user is None:
        return api_response(success=False, error="user not found", status_code=404)
    return api_response(data={"user": user.to_public_dict()})
