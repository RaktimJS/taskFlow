import pytest


def test_root_endpoint(client):
    """Test the API root welcome endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "/docs" in data["documentation"]


def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "supabase_configured" in data


def test_create_task_must_have(client):
    """Must have: 1. Add a new task with a title."""
    payload = {
        "title": "Complete TaskFlow backend",
        "description": "Follow requirements and implement clean API",
        "priority": "high",
    }
    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Complete TaskFlow backend"
    assert data["description"] == "Follow requirements and implement clean API"
    assert data["is_completed"] is False
    assert data["priority"] == "high"
    assert "id" in data
    assert data["created_at"] is not None


def test_create_task_empty_title_fails(client):
    """Validation: Title cannot be empty or whitespace."""
    response = client.post("/api/tasks", json={"title": "   "})
    assert response.status_code == 422


def test_list_all_tasks_must_have(client):
    """Must have: 2. See a list of all tasks."""
    client.post("/api/tasks", json={"title": "Task 1"})
    client.post("/api/tasks", json={"title": "Task 2"})
    client.post("/api/tasks", json={"title": "Task 3"})

    response = client.get("/api/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 3
    titles = [t["title"] for t in tasks]
    assert "Task 1" in titles
    assert "Task 2" in titles
    assert "Task 3" in titles


def test_mark_task_as_done_and_open_again_must_have(client):
    """Must have: 3. Mark a task as done (and mark it open again)."""
    # Create task
    create_res = client.post("/api/tasks", json={"title": "Review PR"})
    task_id = create_res.json()["id"]
    assert create_res.json()["is_completed"] is False

    # Mark as done via toggle
    toggle_res = client.patch(f"/api/tasks/{task_id}/toggle")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

    # Mark as open again via toggle
    toggle_res_2 = client.patch(f"/api/tasks/{task_id}/toggle")
    assert toggle_res_2.status_code == 200
    assert toggle_res_2.json()["is_completed"] is False

    # Also test explicit update via PATCH /api/tasks/{id}
    patch_res = client.patch(f"/api/tasks/{task_id}", json={"is_completed": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["is_completed"] is True


def test_delete_task_must_have(client):
    """Must have: 4. Delete a task."""
    create_res = client.post("/api/tasks", json={"title": "Task to delete"})
    task_id = create_res.json()["id"]

    # Delete task
    del_res = client.delete(f"/api/tasks/{task_id}")
    assert del_res.status_code == 200
    assert del_res.json()["id"] == task_id

    # Verify task is deleted
    get_res = client.get(f"/api/tasks/{task_id}")
    assert get_res.status_code == 404

    # Second delete returns 404
    del_again = client.delete(f"/api/tasks/{task_id}")
    assert del_again.status_code == 404


def test_filter_tasks_by_status_should_have(client):
    """Should have: 5. Filter the list by status: All, Open, or Done."""
    # Create 2 open tasks and 1 completed task
    t1 = client.post("/api/tasks", json={"title": "Open Task A", "is_completed": False}).json()
    t2 = client.post("/api/tasks", json={"title": "Open Task B", "is_completed": False}).json()
    t3 = client.post("/api/tasks", json={"title": "Done Task C", "is_completed": True}).json()

    # Filter All
    res_all = client.get("/api/tasks?status=all")
    assert res_all.status_code == 200
    assert len(res_all.json()) == 3

    # Filter Open
    res_open = client.get("/api/tasks?status=open")
    assert res_open.status_code == 200
    open_tasks = res_open.json()
    assert len(open_tasks) == 2
    for task in open_tasks:
        assert task["is_completed"] is False

    # Filter Done
    res_done = client.get("/api/tasks?status=done")
    assert res_done.status_code == 200
    done_tasks = res_done.json()
    assert len(done_tasks) == 1
    assert done_tasks[0]["id"] == t3["id"]
    assert done_tasks[0]["is_completed"] is True


def test_due_date_and_priority_could_have(client):
    """Could have: 6. A due date or a priority label (High, Medium, Low)."""
    # Create task with high priority and due date
    payload = {
        "title": "Tax submission",
        "priority": "high",
        "due_date": "2026-12-31T23:59:59Z",
    }
    res = client.post("/api/tasks", json=payload)
    assert res.status_code == 201
    task = res.json()
    assert task["priority"] == "high"
    assert "2026-12-31" in task["due_date"]

    # Filter by priority
    client.post("/api/tasks", json={"title": "Casual task", "priority": "low"})
    high_tasks = client.get("/api/tasks?priority=high").json()
    assert len(high_tasks) == 1
    assert high_tasks[0]["title"] == "Tax submission"

    low_tasks = client.get("/api/tasks?priority=low").json()
    assert len(low_tasks) == 1
    assert low_tasks[0]["title"] == "Casual task"


def test_update_task_fields(client):
    """Test updating multiple fields on an existing task."""
    create_res = client.post("/api/tasks", json={"title": "Initial Title", "priority": "low"})
    task_id = create_res.json()["id"]

    update_payload = {
        "title": "Updated Title",
        "description": "Added new details",
        "priority": "high",
        "due_date": "2026-11-20T10:00:00Z",
    }
    update_res = client.patch(f"/api/tasks/{task_id}", json=update_payload)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["title"] == "Updated Title"
    assert updated["description"] == "Added new details"
    assert updated["priority"] == "high"
    assert "2026-11-20" in updated["due_date"]


def test_search_tasks(client):
    """Test searching tasks by title and description substring."""
    client.post("/api/tasks", json={"title": "Buy groceries", "description": "Milk and bread"})
    client.post("/api/tasks", json={"title": "Gym workout", "description": "Leg day"})

    res = client.get("/api/tasks?search=milk")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["title"] == "Buy groceries"


def test_task_summary_endpoint(client):
    """Test summary statistics endpoint."""
    client.post("/api/tasks", json={"title": "Task A", "is_completed": False})
    client.post("/api/tasks", json={"title": "Task B", "is_completed": True})
    client.post("/api/tasks", json={"title": "Task C", "is_completed": True})

    res = client.get("/api/tasks/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["total"] == 3
    assert summary["open_count"] == 1
    assert summary["done_count"] == 2
