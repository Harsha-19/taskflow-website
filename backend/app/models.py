from __future__ import annotations

"""
Database models.

For now we use SQLite for development via Flask-SQLAlchemy.
This is structured to be ready for future upgrades:
- migrations (Flask-Migrate/Alembic)
- more models/relationships
- user roles/permissions
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, cast

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


class User(db.Model):
    """
    User account model.

    Notes:
    - Store only hashed passwords.
    - Use unique constraints for username/email.
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    subscriptions = cast(
        list["Subscription"],
        db.relationship("Subscription", backref="user", lazy=True, cascade="all, delete-orphan"),
    )
    projects = cast(
        list["Project"],
        db.relationship("Project", backref="user", lazy=True, cascade="all, delete-orphan"),
    )

    def __init__(self, username: str, email: str, **kwargs) -> None:
        super().__init__(**kwargs)
        self.username = username
        self.email = email

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_public_dict(self) -> dict:
        # Get active subscription if any
        subscriptions = cast(list["Subscription"], self.subscriptions)
        active_sub = next((s for s in subscriptions if s.status == "active"), None)
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "subscription": active_sub.to_dict() if active_sub else None,
        }


class Plan(db.Model):
    """
    Subscription plan model.
    """

    __tablename__ = "plans"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255))
    features = db.Column(db.JSON, nullable=False)  # List of feature strings

    subscriptions = cast(
        list["Subscription"],
        db.relationship("Subscription", backref="plan", lazy=True),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "description": self.description,
            "features": self.features,
        }


class Subscription(db.Model):
    """
    User subscription model.
    """

    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey("plans.id"), nullable=False)
    status = db.Column(db.String(20), default="active")  # active, cancelled, expired
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    if TYPE_CHECKING:
        user: "User"
        plan: "Plan"

    def to_dict(self) -> dict:
        plan = cast("Plan | None", self.plan)
        return {
            "id": self.id,
            "plan": plan.to_dict() if plan else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Project(db.Model):
    """
    User project model.
    """

    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="active")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    tasks = cast(
        list["Task"],
        db.relationship("Task", backref="project", lazy=True, cascade="all, delete-orphan"),
    )

    if TYPE_CHECKING:
        user: "User"

    def to_dict(self) -> dict:
        tasks = cast(list["Task"], self.tasks)
        completed_tasks = sum(1 for task in tasks if task.completed)
        total_tasks = len(tasks)
        progress = int((completed_tasks / total_tasks) * 100) if total_tasks else 0
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "progress": progress,
            "task_count": total_tasks,
            "completed_task_count": completed_tasks,
        }


class Task(db.Model):
    """
    Project task model.
    """

    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    due_date = db.Column(db.DateTime(timezone=True), nullable=True)
    priority = db.Column(db.String(20), nullable=False, default="medium")
    notes = db.Column(db.Text, nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    if TYPE_CHECKING:
        project: "Project"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "completed": self.completed,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "priority": self.priority,
            "notes": self.notes,
            "project_id": self.project_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
