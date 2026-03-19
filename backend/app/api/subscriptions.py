from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import db
from ..models import User, Plan, Subscription
from ..utils import api_response

subscriptions_bp = Blueprint("subscriptions", __name__)

@subscriptions_bp.post("/")
@jwt_required()
def subscribe():
    """
    Choose a plan and create/update subscription.
    """
    user_id = get_jwt_identity()
    payload = request.get_json(silent=True) or {}
    plan_id = payload.get("plan_id")

    if not plan_id:
        return api_response(success=False, error="plan_id is required", status_code=400)

    plan = db.session.get(Plan, plan_id)
    if not plan:
        return api_response(success=False, error="Plan not found", status_code=404)

    # Cancel existing active subscriptions
    Subscription.query.filter_by(user_id=user_id, status="active").update({"status": "cancelled"})

    # Create new subscription
    sub = Subscription(user_id=user_id, plan_id=plan_id, status="active")
    db.session.add(sub)
    db.session.commit()

    return api_response(data={"subscription": sub.to_dict()}, status_code=201)

@subscriptions_bp.get("/me")
@jwt_required()
def my_subscription():
    """
    Get current user's active subscription.
    """
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(user_id=user_id, status="active").first()
    
    if not sub:
        return api_response(data={"subscription": None})
        
    return api_response(data={"subscription": sub.to_dict()})
