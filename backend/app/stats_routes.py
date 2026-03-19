from flask_jwt_extended import get_jwt_identity, jwt_required
from flask import Blueprint

from .models import Project, Subscription, Task
from .utils import api_response

stats_bp = Blueprint("stats_api", __name__)


@stats_bp.get("/api/stats")
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())

    project_count = Project.query.filter_by(user_id=user_id).count()
    task_count = (
        Task.query.join(Project, Task.project_id == Project.id)
        .filter(Project.user_id == user_id)
        .count()
    )
    subscription = Subscription.query.filter_by(user_id=user_id, status="active").first()
    plan_name = subscription.plan.name if subscription and subscription.plan else "None"

    return api_response(
        data={
            "projects": project_count,
            "tasks": task_count,
            "plan": plan_name,
        }
    )
