from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from datetime import datetime

from .extensions import db
from .models import Project, Task
from .utils import api_response

tasks_bp = Blueprint("tasks_api", __name__)
VALID_PRIORITIES = {"low", "medium", "high"}


def _get_owned_project(project_id: int, user_id: int) -> Project | None:
    return Project.query.filter_by(id=project_id, user_id=user_id).first()


def _parse_due_date(value: str | None) -> datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


@tasks_bp.post("/api/tasks")
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    title = (payload.get("title") or "").strip()
    project_id = payload.get("project_id")
    priority = (payload.get("priority") or "medium").strip().lower()
    notes = (payload.get("notes") or "").strip() or None
    due_date_raw = payload.get("due_date")

    if not title or not project_id:
        return api_response(
            success=False,
            error="title and project_id are required",
            status_code=400,
        )
    if priority not in VALID_PRIORITIES:
        return api_response(success=False, error="invalid priority", status_code=400)

    project = _get_owned_project(int(project_id), user_id)
    if not project:
        return api_response(success=False, error="Project not found", status_code=404)

    try:
        due_date = _parse_due_date(due_date_raw)
    except ValueError:
        return api_response(success=False, error="invalid due_date", status_code=400)

    task = Task(
        title=title,
        project_id=project.id,
        due_date=due_date,
        priority=priority,
        notes=notes,
    )
    db.session.add(task)
    db.session.commit()

    return api_response(data={"task": task.to_dict()}, status_code=201)


@tasks_bp.get("/api/tasks/<int:project_id>")
@jwt_required()
def list_tasks(project_id: int):
    user_id = int(get_jwt_identity())
    project = _get_owned_project(project_id, user_id)
    if not project:
        return api_response(success=False, error="Project not found", status_code=404)

    tasks = Task.query.filter_by(project_id=project.id).order_by(Task.created_at.desc()).all()
    return api_response(data={"tasks": [task.to_dict() for task in tasks]})


@tasks_bp.put("/api/tasks/<int:task_id>")
@jwt_required()
def update_task(task_id: int):
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}

    task = (
        Task.query.join(Project, Task.project_id == Project.id)
        .filter(Task.id == task_id, Project.user_id == user_id)
        .first()
    )
    if not task:
        return api_response(success=False, error="Task not found", status_code=404)

    if "title" in payload:
        title = (payload.get("title") or "").strip()
        if not title:
            return api_response(success=False, error="title cannot be empty", status_code=400)
        task.title = title

    if "completed" in payload:
        task.completed = bool(payload.get("completed"))
    if "priority" in payload:
        priority = (payload.get("priority") or "").strip().lower()
        if priority not in VALID_PRIORITIES:
            return api_response(success=False, error="invalid priority", status_code=400)
        task.priority = priority
    if "notes" in payload:
        task.notes = (payload.get("notes") or "").strip() or None
    if "due_date" in payload:
        try:
            task.due_date = _parse_due_date(payload.get("due_date"))
        except ValueError:
            return api_response(success=False, error="invalid due_date", status_code=400)

    db.session.commit()

    return api_response(data={"task": task.to_dict()})


@tasks_bp.delete("/api/tasks/<int:task_id>")
@jwt_required()
def delete_task(task_id: int):
    user_id = int(get_jwt_identity())

    task = (
        Task.query.join(Project, Task.project_id == Project.id)
        .filter(Task.id == task_id, Project.user_id == user_id)
        .first()
    )
    if not task:
        return api_response(success=False, error="Task not found", status_code=404)

    db.session.delete(task)
    db.session.commit()
    return api_response(data={"deleted": True})
