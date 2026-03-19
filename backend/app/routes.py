from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

api_bp = Blueprint("api", __name__)


@api_bp.get("/")
def healthcheck():
    """
    Basic health endpoint used to verify the backend is reachable.
    """
    return jsonify(message="Backend is running")


@api_bp.get("/api/data")
@jwt_required()
def get_data():
    """
    Sample GET endpoint for frontend integration testing.
    """
    return jsonify(
        data=[
            {"id": 1, "name": "TaskFlow", "status": "active"},
            {"id": 2, "name": "Landing page demo", "status": "ready"},
        ]
    )


@api_bp.post("/api/data")
@jwt_required()
def post_data():
    """
    Echo endpoint.

    Accepts JSON from the frontend and returns it back so you can validate:
    - request body parsing
    - CORS configuration
    - end-to-end connectivity
    """
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify(error="Expected JSON body"), 400
    return jsonify(received=payload)
