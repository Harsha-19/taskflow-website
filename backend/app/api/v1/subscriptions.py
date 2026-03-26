from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ...extensions import db
from ...models import Plan, Subscription
from ...utils import api_response

subs_bp = Blueprint("subscriptions", __name__)

@subs_bp.post("/")
@jwt_required()
def subscribe():
    """
    Choose a plan and create/update subscription.
    """
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    plan_id = payload.get("plan_id")

    if not plan_id:
        return api_response(success=False, message="Plan ID is required", status_code=400)

    plan = db.session.get(Plan, int(plan_id))
    if not plan:
        return api_response(success=False, message="Plan not found", status_code=404)

    # Cancel existing active subscriptions
    Subscription.query.filter_by(user_id=user_id, status="active").update({"status": "cancelled"})

    # Create new subscription
    sub = Subscription(user_id=user_id, plan_id=plan_id, status="active")
    db.session.add(sub)
    db.session.commit()

    return api_response(
        message="Subscription successful",
        data={"subscription": sub.to_dict()}, 
        status_code=201
    )

@subs_bp.get("/me")
@jwt_required()
def my_subscription():
    """
    Get current user's active subscription.
    """
    user_id = int(get_jwt_identity())
    sub = Subscription.query.filter_by(user_id=user_id, status="active").first()
    
    return api_response(data={"subscription": sub.to_dict() if sub else None})
