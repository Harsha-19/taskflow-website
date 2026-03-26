from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from ...extensions import db
from ...models import Project, Task
from ...utils import api_response
from ...schemas.tasks import TaskSchema, TaskUpdateSchema

tasks_bp = Blueprint("tasks", __name__)

task_schema = TaskSchema()
task_update_schema = TaskUpdateSchema()

def _get_owned_project(project_id: int, user_id: int) -> Project | None:
    return Project.query.filter_by(id=project_id, user_id=user_id).first()

@tasks_bp.post("/")
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    
    try:
        data = task_schema.load(payload)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", data=err.messages, status_code=400)

    project = _get_owned_project(data["project_id"], user_id)
    if not project:
        return api_response(success=False, message="Project not found", status_code=404)

    task = Task(
        title=data["title"],
        project_id=project.id,
        due_date=data.get("due_date"),
        priority=data.get("priority", "medium"),
        notes=data.get("notes"),
    )
    db.session.add(task)
    db.session.commit()

    return api_response(
        message="Task created successfully",
        data={"task": task.to_dict()}, 
        status_code=201
    )

@tasks_bp.get("/project/<int:project_id>")
@jwt_required()
def list_tasks(project_id: int):
    user_id = int(get_jwt_identity())
    project = _get_owned_project(project_id, user_id)
    if not project:
        return api_response(success=False, message="Project not found", status_code=404)

    tasks = Task.query.filter_by(project_id=project.id).order_by(Task.created_at.desc()).all()
    return api_response(data={"tasks": [task.to_dict() for task in tasks]})

@tasks_bp.put("/<int:task_id>")
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
        return api_response(success=False, message="Task not found", status_code=404)

    try:
        data = task_update_schema.load(payload)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", data=err.messages, status_code=400)

    for key, value in data.items():
        setattr(task, key, value)

    db.session.commit()

    return api_response(
        message="Task updated successfully",
        data={"task": task.to_dict()}
    )

@tasks_bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id: int):
    user_id = int(get_jwt_identity())

    task = (
        Task.query.join(Project, Task.project_id == Project.id)
        .filter(Task.id == task_id, Project.user_id == user_id)
        .first()
    )
    if not task:
        return api_response(success=False, message="Task not found", status_code=404)

    db.session.delete(task)
    db.session.commit()
    return api_response(message="Task deleted successfully")
