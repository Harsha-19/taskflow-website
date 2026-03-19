from __future__ import annotations

from flask import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import db
from ..models import User
from ..utils import api_response

users_bp = Blueprint("users", __name__)

@users_bp.get("/me")
@jwt_required()
def get_profile():
    """
    Get current user's profile.
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return api_response(success=False, error="User not found", status_code=404)
    return api_response(data={"user": user.to_public_dict()})
