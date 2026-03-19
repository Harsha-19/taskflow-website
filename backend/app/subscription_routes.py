from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from .extensions import db
from .models import Subscription

subs_bp = Blueprint("subscriptions_api", __name__)


@subs_bp.post("/api/subscription")
@jwt_required()
def create_subscription():
    user_id = get_jwt_identity()
    payload = request.get_json(silent=True) or {}
    plan_id = payload.get("plan_id")

    if not plan_id:
        return jsonify({"error": "plan_id required"}), 400

    sub = Subscription.query.filter_by(user_id=user_id).first()
    if sub:
        sub.plan_id = plan_id
        sub.status = "active"
    else:
        sub = Subscription(user_id=user_id, plan_id=plan_id)
        db.session.add(sub)

    db.session.commit()

    return jsonify({"message": "Subscribed successfully"}), 201


@subs_bp.get("/api/subscription/me")
@jwt_required()
def get_my_subscription():
    user_id = get_jwt_identity()

    sub = Subscription.query.filter_by(user_id=user_id).first()

    if not sub:
        return jsonify({"plan": None})

    return jsonify({"plan_id": sub.plan_id, "status": sub.status})
