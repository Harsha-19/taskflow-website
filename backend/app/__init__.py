from flask import Flask
from flask_cors import CORS
from sqlalchemy import inspect, text

from .config import Config
from .extensions import db, jwt
from .api.auth import auth_bp
from .api.dashboard import dashboard_bp
from .api.users import users_bp
from .plans_routes import plans_bp
from .project_routes import projects_bp
from .stats_routes import stats_bp
from .subscription_routes import subs_bp
from .task_routes import tasks_bp
from .utils import api_response


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS configuration
    CORS(
        app,
        resources={r"/*": {"origins": Config.CORS_ORIGINS}},
        supports_credentials=True,
    )

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(plans_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(subs_bp)
    app.register_blueprint(tasks_bp)

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return api_response(success=False, error="Bad request", status_code=400)

    @app.errorhandler(401)
    def unauthorized(e):
        return api_response(success=False, error="Unauthorized", status_code=401)

    @app.errorhandler(404)
    def not_found(e):
        return api_response(success=False, error="Resource not found", status_code=404)

    @app.errorhandler(500)
    def server_error(e):
        return api_response(success=False, error="Internal server error", status_code=500)

    # Create tables and seed data automatically for local development.
    with app.app_context():
        db.create_all()
        ensure_schema_updates()
        seed_plans()

    return app


def seed_plans():
    """
    Seed default plans if they don't exist.
    """
    from .models import Plan

    if not Plan.query.first():
        plans = [
            Plan(name="Starter", price=9, description="Basic plan", features=[]),
            Plan(name="Pro", price=29, description="Most popular", features=[]),
            Plan(name="Enterprise", price=99, description="Advanced plan", features=[]),
        ]
        db.session.add_all(plans)
        db.session.commit()


def ensure_schema_updates() -> None:
    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())
    if "tasks" not in tables:
        task_columns = set()
    else:
        task_columns = {column["name"] for column in inspector.get_columns("tasks")}
    project_columns = (
        {column["name"] for column in inspector.get_columns("projects")}
        if "projects" in tables
        else set()
    )
    statements: list[str] = []

    if "due_date" not in task_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN due_date DATETIME")
    if "priority" not in task_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'medium'")
    if "notes" not in task_columns:
        statements.append("ALTER TABLE tasks ADD COLUMN notes TEXT")
    if "description" not in project_columns:
        statements.append("ALTER TABLE projects ADD COLUMN description VARCHAR(255)")
    if "status" not in project_columns:
        statements.append("ALTER TABLE projects ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'")

    for statement in statements:
        db.session.execute(text(statement))

    if statements:
        db.session.commit()
