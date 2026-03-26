from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from ...extensions import db
from ...models import Project
from ...utils import api_response
from ...schemas.projects import ProjectSchema, ProjectUpdateSchema

projects_bp = Blueprint("projects", __name__)

project_schema = ProjectSchema()
project_update_schema = ProjectUpdateSchema()

@projects_bp.post("/")
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    
    try:
        data = project_schema.load(payload)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", data=err.messages, status_code=400)

    project = Project(
        name=data["name"],
        description=data.get("description"),
        status=data.get("status", "active"),
        user_id=user_id
    )
    db.session.add(project)
    db.session.commit()

    return api_response(
        message="Project created successfully",
        data={"project": project.to_dict()}, 
        status_code=201
    )

@projects_bp.get("/")
@jwt_required()
def list_projects():
    user_id = int(get_jwt_identity())
    projects = Project.query.filter_by(user_id=user_id).order_by(Project.created_at.desc()).all()
    return api_response(data={"projects": [p.to_dict() for p in projects]})

@projects_bp.put("/<int:project_id>")
@jwt_required()
def update_project(project_id: int):
    user_id = int(get_jwt_identity())
    payload = request.get_json(silent=True) or {}
    
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return api_response(success=False, message="Project not found", status_code=404)

    try:
        data = project_update_schema.load(payload)
    except ValidationError as err:
        return api_response(success=False, message="Validation error", data=err.messages, status_code=400)

    for key, value in data.items():
        setattr(project, key, value)

    db.session.commit()
    return api_response(
        message="Project updated successfully",
        data={"project": project.to_dict()}
    )

@projects_bp.delete("/<int:project_id>")
@jwt_required()
def delete_project(project_id: int):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return api_response(success=False, message="Project not found", status_code=404)

    db.session.delete(project)
    db.session.commit()
    return api_response(message="Project deleted successfully")
