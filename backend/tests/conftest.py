import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services.task_service import TaskService


@pytest.fixture(autouse=True)
def clean_database():
    """Clear in-memory store before and after each test."""
    TaskService.clear_local_store()
    yield
    TaskService.clear_local_store()


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client
