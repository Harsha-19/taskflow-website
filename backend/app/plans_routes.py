from flask import Blueprint, jsonify

from .models import Plan

plans_bp = Blueprint("plans_api", __name__)


@plans_bp.get("/api/plans")
def get_plans():
    plans = Plan.query.all()

    return jsonify(
        [
            {
                "id": plan.id,
                "name": plan.name,
                "price": plan.price,
                "description": plan.description,
            }
            for plan in plans
        ]
    )
