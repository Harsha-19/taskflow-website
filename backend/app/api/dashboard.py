from __future__ import annotations

from flask import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import db
from ..models import User, Subscription
from ..utils import api_response

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.get("/")
@jwt_required()
def dashboard_overview():
    """
    Get user-specific dashboard data.
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    
    if not user:
        return api_response(success=False, error="User not found", status_code=404)
        
    active_sub = Subscription.query.filter_by(user_id=user_id, status="active").first()
    
    data = {
        "welcome_message": f"Welcome back, {user.username}!",
        "stats": {
            "projects": 3 if not active_sub or active_sub.plan.name == "Starter" else 12,
            "usage": "45%",
            "active_plan": active_sub.plan.name if active_sub else "No active plan"
        },
        "recent_activity": [
            {"id": 1, "action": "Project created", "date": "2 hours ago"},
            {"id": 2, "action": "API key generated", "date": "Yesterday"}
        ]
    }
    
    return api_response(data=data)
