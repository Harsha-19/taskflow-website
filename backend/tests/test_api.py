import pytest
import json

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json["data"]["status"] == "ok"

def test_auth_register(client):
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json["data"]["user"]["username"] == "testuser"

def test_auth_login(client):
    # Register first
    client.post("/api/v1/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    
    # Login
    payload = {
        "username_or_email": "testuser",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    assert "access_token" in response.json["data"]

def test_auth_me(client):
    # Register and login
    client.post("/api/v1/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "username_or_email": "testuser",
        "password": "password123"
    })
    token = login_resp.json["data"]["access_token"]
    
    # Get Profile
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json["data"]["user"]["username"] == "testuser"

def test_plans_list(client):
    response = client.get("/api/v1/plans/")
    assert response.status_code == 200
    assert len(response.json["data"]["plans"]) == 3
