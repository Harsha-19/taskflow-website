import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_health():
    print("Testing Plans Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/plans/")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200
        assert response.json()["success"] is True
    except Exception as e:
        print(f"Error: {e}")

def test_auth_and_dashboard():
    print("\nTesting Auth and Dashboard...")
    timestamp = int(time.time())
    user_data = {
        "username": f"testuser_{timestamp}",
        "email": f"test_{timestamp}@example.com",
        "password": "password123"
    }

    # 1. Register
    print("Registering...")
    resp = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    print(f"Register Status: {resp.status_code}")
    assert resp.status_code == 201

    # 2. Login
    print("Logging in...")
    login_data = {
        "username_or_email": user_data["username"],
        "password": user_data["password"]
    }
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login Status: {resp.status_code}")
    assert resp.status_code == 200
    token = resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get Me
    print("Getting User Profile...")
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Me Status: {resp.status_code}")
    assert resp.status_code == 200

    # 4. Subscribe to a plan
    print("Subscribing to Pro plan...")
    # First get plans to find Pro plan id
    plans_resp = requests.get(f"{BASE_URL}/plans/")
    pro_plan = next(p for p in plans_resp.json()["data"]["plans"] if p["name"] == "Pro")
    
    resp = requests.post(f"{BASE_URL}/subscriptions/", json={"plan_id": pro_plan["id"]}, headers=headers)
    print(f"Subscribe Status: {resp.status_code}")
    assert resp.status_code == 201

    # 5. Dashboard
    print("Checking Dashboard...")
    resp = requests.get(f"{BASE_URL}/dashboard/", headers=headers)
    print(f"Dashboard Status: {resp.status_code}")
    print(f"Dashboard Data: {json.dumps(resp.json(), indent=2)}")
    assert resp.status_code == 200
    assert resp.json()["data"]["stats"]["active_plan"] == "Pro"

if __name__ == "__main__":
    # Note: Make sure the server is running before executing this
    try:
        test_health()
        test_auth_and_dashboard()
        print("\nAll tests passed!")
    except Exception as e:
        print(f"\nTests failed: {e}")
