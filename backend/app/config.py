from __future__ import annotations

import os


class Config:
    """
    Central configuration object.

    This reads values from environment variables (loaded via python-dotenv in `run.py`).
    Keeping config in one place makes it easy to add:
    - DB connection strings
    - auth settings (JWT, session cookies)
    - logging config
    - third-party API keys
    """

    SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key")
    PORT = int(os.getenv("PORT", "5000"))

    # Database
    # Example: sqlite:///app.db (relative to backend/ working directory)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    # Keep this secret in production (use a strong random value)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

    # Frontend origins allowed to call this backend.
    # Comma-separated list supported, e.g. "http://localhost:5173,https://yourdomain.com"
    _cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    CORS_ORIGINS = [o.strip() for o in _cors_raw.split(",") if o.strip()]
