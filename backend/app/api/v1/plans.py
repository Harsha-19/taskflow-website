from __future__ import annotations

from flask import Blueprint
from ...models import Plan
from ...utils import api_response

plans_bp = Blueprint("plans", __name__)

@plans_bp.get("/")
def list_plans():
    """
    List all available subscription plans.
    """
    plans = Plan.query.all()
    return api_response(data={"plans": [p.to_dict() for p in plans]})
