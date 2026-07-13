from fastapi.testclient import TestClient

from app.main import app


def test_demo_login_succeeds():
    client = TestClient(app)
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@citeiq.test", "password": "password"},
    )

    assert response.status_code == 200
    assert response.json()["user"]["email"] == "admin@citeiq.test"


def test_signup_then_login_succeeds():
    client = TestClient(app)
    email = "new.user@citeiq.test"
    password = "password123"

    signup_response = client.post(
        "/api/auth/signup",
        json={
            "name": "New User",
            "email": email,
            "password": password,
            "organisation": "CiteIQ Workspace",
        },
    )

    assert signup_response.status_code == 200
    assert signup_response.json()["user"]["email"] == email

    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )

    assert login_response.status_code == 200
    assert login_response.json()["user"]["name"] == "New User"

