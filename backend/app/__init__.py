from __future__ import annotations

import os
from flask import Flask, request
from flask_cors import CORS
from flask_talisman import Talisman
from sqlalchemy import inspect, text

from .config import Config
from .extensions import db, jwt, ma, limiter
from .api.v1 import v1_bp
from .utils import api_response

def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS configuration
    # Note: supports_credentials requires specific origins (not "*")
    CORS(
        app,
        resources={r"/*": {
            "origins": Config.CORS_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
        }},
        supports_credentials=True,
    )
    
    # Security Headers
    # Security Headers - Disable force_https temporarily to troubleshoot CORS
    Talisman(app, force_https=False)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    limiter.init_app(app)

    # Register Blueprints
    app.register_blueprint(v1_bp)

    @app.route("/")
    def home():
        return api_response(
            message="Welcome to TaskFlow API",
            data={
                "version": "v1",
                "docs": "/api/v1/docs" # Placeholder for future swagger
            }
        )

    @app.route("/health")
    def health_check():
        return api_response(message="Status Healthy", data={"status": "ok"})

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return api_response(success=False, message="Bad request", status_code=400)

    @app.errorhandler(401)
    def unauthorized(e):
        return api_response(success=False, message="Unauthorized", status_code=401)

    @app.errorhandler(404)
    def not_found(e):
        return api_response(success=False, message="Resource not found", status_code=404)

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return api_response(success=False, message="Rate limit exceeded", status_code=429)

    @app.errorhandler(500)
    def server_error(e):
        return api_response(success=False, message="Internal server error", status_code=500)

    # Create tables and seed data
    with app.app_context():
        db.create_all()
        ensure_schema_updates()
        seed_plans()

    @app.after_request
    def handle_cors(response):
        origin = request.headers.get('Origin')
        if origin and (origin in Config.CORS_ORIGINS or '*' in Config.CORS_ORIGINS):
            response.headers.set('Access-Control-Allow-Origin', origin)
            response.headers.set('Access-Control-Allow-Credentials', 'true')
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        
        # Ensure OPTIONS always returns 200
        if request.method == 'OPTIONS':
            response.status_code = 200
        return response

    return app

def seed_plans():
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
    
    task_columns = {column["name"] for column in inspector.get_columns("tasks")} if "tasks" in tables else set()
    project_columns = {column["name"] for column in inspector.get_columns("projects")} if "projects" in tables else set()
    
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
