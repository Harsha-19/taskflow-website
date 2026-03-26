from flask import Blueprint
from .auth import auth_bp
from .users import users_bp
from .dashboard import dashboard_bp
from .tasks import tasks_bp
from .projects import projects_bp
from .plans import plans_bp
from .subscriptions import subs_bp
from .stats import stats_bp

v1_bp = Blueprint("v1", __name__, url_prefix="/api/v1")

v1_bp.register_blueprint(auth_bp, url_prefix="/auth")
v1_bp.register_blueprint(users_bp, url_prefix="/users")
v1_bp.register_blueprint(dashboard_bp, url_prefix="/dashboard")
v1_bp.register_blueprint(tasks_bp, url_prefix="/tasks")
v1_bp.register_blueprint(projects_bp, url_prefix="/projects")
v1_bp.register_blueprint(plans_bp, url_prefix="/plans")
v1_bp.register_blueprint(subs_bp, url_prefix="/subscriptions")
v1_bp.register_blueprint(stats_bp, url_prefix="/stats")
