from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from .extensions import db
from .models import Project
from .utils import api_response

projects_bp = Blueprint("projects_api", __name__)
VALID_PROJECT_STATUSES = {"active", "completed"}


def _get_owned_project(project_id: int, user_id: int) -> Project | None:
    return Project.query.filter_by(id=project_id, user_id=user_id).first()


@projects_bp.post("/api/projects")
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    description = (payload.get("description") or "").strip() or None
    status = (payload.get("status") or "active").strip().lower()

    if not name:
        return api_response(success=False, error="name is required", status_code=400)
    if status not in VALID_PROJECT_STATUSES:
        return api_response(success=False, error="invalid status", status_code=400)

    project = Project(name=name, description=description, status=status, user_id=user_id)
    db.session.add(project)
    db.session.commit()

    return api_response(data={"project": project.to_dict()}, status_code=201)


@projects_bp.get("/api/projects")
@jwt_required()
def list_projects():
    user_id = int(get_jwt_identity())
    projects = Project.query.filter_by(user_id=user_id).order_by(Project.created_at.desc()).all()
    return api_response(data={"projects": [project.to_dict() for project in projects]})


@projects_bp.put("/api/projects/<int:project_id>")
@jwt_required()
def update_project(project_id: int):
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    project = _get_owned_project(project_id, user_id)
    if not project:
        return api_response(success=False, error="Project not found", status_code=404)

    if "name" in payload:
        name = (payload.get("name") or "").strip()
        if not name:
            return api_response(success=False, error="name cannot be empty", status_code=400)
        project.name = name

    if "description" in payload:
        project.description = (payload.get("description") or "").strip() or None

    if "status" in payload:
        status = (payload.get("status") or "").strip().lower()
        if status not in VALID_PROJECT_STATUSES:
            return api_response(success=False, error="invalid status", status_code=400)
        project.status = status

    db.session.commit()
    return api_response(data={"project": project.to_dict()})


@projects_bp.delete("/api/projects/<int:project_id>")
@jwt_required()
def delete_project(project_id: int):
    user_id = int(get_jwt_identity())
    project = _get_owned_project(project_id, user_id)
    if not project:
        return api_response(success=False, error="Project not found", status_code=404)

    db.session.delete(project)
    db.session.commit()
    return api_response(data={"deleted": True})
