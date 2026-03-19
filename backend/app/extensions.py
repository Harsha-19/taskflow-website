from __future__ import annotations

from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

# Extensions are created without an app here, and initialized in `create_app`.
# This avoids circular imports and supports the app-factory pattern cleanly.
db = SQLAlchemy()
jwt = JWTManager()

