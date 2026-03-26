import pytest
from app import create_app
from app.extensions import db
from app.models import Plan

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret"
    })

    with app.app_context():
        db.create_all()
        # Seed plans for tests
        plans = [
            Plan(name="Starter", price=9, description="Basic", features=[]),
            Plan(name="Pro", price=29, description="Most popular", features=[]),
            Plan(name="Enterprise", price=99, description="Advanced", features=[]),
        ]
        db.session.add_all(plans)
        db.session.commit()
        yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()
