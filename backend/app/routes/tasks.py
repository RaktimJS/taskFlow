import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.models import (
    DeleteResponse,
    PriorityEnum,
    StatusFilter,
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskToggle,
    TaskUpdate,
)
from app.services.task_service import TaskService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Add a new task with title, optional description, priority, and due date.",
)
def create_task(task: TaskCreate) -> TaskResponse:
    return TaskService.create_task(task)


@router.get(
    "",
    response_model=List[TaskResponse],
    summary="List all tasks",
    description="Retrieve tasks with optional filtering by status (all, open, done), priority, and search keyword.",
)
def list_tasks(
    status: StatusFilter = Query(
        default=StatusFilter.ALL,
        description="Filter tasks by status: 'all', 'open', or 'done'",
    ),
    priority: Optional[PriorityEnum] = Query(
        default=None,
        description="Filter tasks by priority: 'low', 'medium', or 'high'",
    ),
    search: Optional[str] = Query(
        default=None,
        description="Search substring in task title or description",
    ),
    sort_by: str = Query(
        default="created_at",
        description="Sort by field: 'created_at', 'due_date', 'title', 'priority'",
    ),
    order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
        description="Sort order: 'asc' or 'desc'",
    ),
) -> List[TaskResponse]:
    return TaskService.get_tasks(
        status_filter=status,
        priority=priority,
        search=search,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/summary",
    response_model=TaskListResponse,
    summary="Get task list with status summary counts",
    description="Retrieve all tasks along with total, open, and done statistics.",
)
def get_task_summary() -> TaskListResponse:
    all_tasks = TaskService.get_tasks(status_filter=StatusFilter.ALL)
    open_count = sum(1 for t in all_tasks if not t.is_completed)
    done_count = sum(1 for t in all_tasks if t.is_completed)
    return TaskListResponse(
        tasks=all_tasks,
        total=len(all_tasks),
        open_count=open_count,
        done_count=done_count,
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get a task by ID",
    description="Fetch full details of a specific task by its unique UUID.",
)
def get_task(task_id: str) -> TaskResponse:
    task = TaskService.get_task_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found.",
        )
    return task


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    description="Update one or more fields of a task (title, description, is_completed, priority, due_date).",
)
def update_task(task_id: str, task_update: TaskUpdate) -> TaskResponse:
    task = TaskService.update_task(task_id, task_update)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found.",
        )
    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Replace or update a task",
    description="Update a task's fields.",
)
def replace_task(task_id: str, task_update: TaskUpdate) -> TaskResponse:
    task = TaskService.update_task(task_id, task_update)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found.",
        )
    return task


@router.patch(
    "/{task_id}/toggle",
    response_model=TaskResponse,
    summary="Toggle task completion status",
    description="Quickly mark a task as done or open. If body is omitted, toggles the current state.",
)
def toggle_task(task_id: str, body: Optional[TaskToggle] = None) -> TaskResponse:
    explicit_val = body.is_completed if body else None
    task = TaskService.toggle_task(task_id, explicit_val)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found.",
        )
    return task


@router.delete(
    "/{task_id}",
    response_model=DeleteResponse,
    summary="Delete a task",
    description="Permanently delete a task by its UUID.",
)
def delete_task(task_id: str) -> DeleteResponse:
    success = TaskService.delete_task(task_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found.",
        )
    return DeleteResponse(message="Task deleted successfully", id=task_id)
