import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi import HTTPException, status

from app.database import get_supabase_client
from app.models import (
    PriorityEnum,
    StatusFilter,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)

logger = logging.getLogger(__name__)

# Fallback store for local development or testing when Supabase keys are not set
_local_store: Dict[str, dict] = {}


def _get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _row_to_task_response(row: dict) -> TaskResponse:
    """Helper to convert a database row dict to TaskResponse."""
    return TaskResponse(
        id=str(row.get("id")),
        title=row.get("title", ""),
        description=row.get("description", "") or "",
        is_completed=bool(row.get("is_completed", False)),
        priority=row.get("priority", "medium"),
        due_date=row.get("due_date"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


class TaskService:
    """Handles CRUD and business logic for tasks using Supabase Postgres."""

    @staticmethod
    def create_task(task_in: TaskCreate) -> TaskResponse:
        client = get_supabase_client()
        now = _get_utc_now()

        if client is not None:
            payload = {
                "title": task_in.title,
                "description": task_in.description or "",
                "is_completed": task_in.is_completed,
                "priority": task_in.priority.value,
                "due_date": task_in.due_date.isoformat() if task_in.due_date else None,
            }
            try:
                response = client.table("tasks").insert(payload).execute()
                if response.data and len(response.data) > 0:
                    return _row_to_task_response(response.data[0])
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database failed to return created task.",
                )
            except HTTPException:
                raise
            except Exception as exc:
                logger.error("Supabase insert error: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error creating task: {str(exc)}",
                )

        # Fallback local in-memory store
        task_id = str(uuid.uuid4())
        record = {
            "id": task_id,
            "title": task_in.title,
            "description": task_in.description or "",
            "is_completed": task_in.is_completed,
            "priority": task_in.priority.value,
            "due_date": task_in.due_date,
            "created_at": now,
            "updated_at": now,
        }
        _local_store[task_id] = record
        return _row_to_task_response(record)

    @staticmethod
    def get_tasks(
        status_filter: StatusFilter = StatusFilter.ALL,
        priority: Optional[PriorityEnum] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        order: str = "desc",
    ) -> List[TaskResponse]:
        client = get_supabase_client()

        if client is not None:
            try:
                query = client.table("tasks").select("*")

                if status_filter == StatusFilter.OPEN:
                    query = query.eq("is_completed", False)
                elif status_filter == StatusFilter.DONE:
                    query = query.eq("is_completed", True)

                if priority is not None:
                    query = query.eq("priority", priority.value)

                if search:
                    # PostgREST ilike or condition for title and description
                    clean_search = search.strip()
                    query = query.or_(f"title.ilike.%{clean_search}%,description.ilike.%{clean_search}%")

                valid_sort_fields = {"created_at", "updated_at", "due_date", "title", "priority"}
                field_to_sort = sort_by if sort_by in valid_sort_fields else "created_at"
                query = query.order(field_to_sort, desc=(order.lower() == "desc"))

                response = query.execute()
                return [_row_to_task_response(item) for item in (response.data or [])]
            except Exception as exc:
                logger.error("Supabase fetch error: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error fetching tasks: {str(exc)}",
                )

        # Local fallback store
        items = list(_local_store.values())

        if status_filter == StatusFilter.OPEN:
            items = [t for t in items if not t["is_completed"]]
        elif status_filter == StatusFilter.DONE:
            items = [t for t in items if t["is_completed"]]

        if priority is not None:
            items = [t for t in items if t["priority"] == priority.value]

        if search:
            search_lower = search.strip().lower()
            items = [
                t for t in items
                if search_lower in t["title"].lower() or search_lower in (t.get("description") or "").lower()
            ]

        reverse = (order.lower() == "desc")
        if sort_by in ("created_at", "updated_at", "due_date"):
            items.sort(key=lambda x: (x.get(sort_by) is not None, x.get(sort_by)), reverse=reverse)
        elif sort_by == "title":
            items.sort(key=lambda x: x.get("title", "").lower(), reverse=reverse)
        else:
            items.sort(key=lambda x: str(x.get("created_at", "")), reverse=reverse)

        return [_row_to_task_response(item) for item in items]

    @staticmethod
    def get_task_by_id(task_id: str) -> Optional[TaskResponse]:
        client = get_supabase_client()

        if client is not None:
            try:
                response = client.table("tasks").select("*").eq("id", task_id).execute()
                if response.data and len(response.data) > 0:
                    return _row_to_task_response(response.data[0])
                return None
            except Exception as exc:
                logger.error("Supabase get by id error: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error fetching task {task_id}: {str(exc)}",
                )

        if task_id in _local_store:
            return _row_to_task_response(_local_store[task_id])
        return None

    @staticmethod
    def update_task(task_id: str, task_update: TaskUpdate) -> Optional[TaskResponse]:
        client = get_supabase_client()
        now = _get_utc_now()

        # Build payload with only provided fields
        fields_to_update = {}
        if task_update.title is not None:
            fields_to_update["title"] = task_update.title
        if task_update.description is not None:
            fields_to_update["description"] = task_update.description
        if task_update.is_completed is not None:
            fields_to_update["is_completed"] = task_update.is_completed
        if task_update.priority is not None:
            fields_to_update["priority"] = task_update.priority.value
        if task_update.due_date is not None:
            fields_to_update["due_date"] = task_update.due_date.isoformat() if task_update.due_date else None

        if not fields_to_update:
            return TaskService.get_task_by_id(task_id)

        if client is not None:
            fields_to_update["updated_at"] = now.isoformat()
            try:
                response = client.table("tasks").update(fields_to_update).eq("id", task_id).execute()
                if response.data and len(response.data) > 0:
                    return _row_to_task_response(response.data[0])
                return None
            except Exception as exc:
                logger.error("Supabase update error: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error updating task {task_id}: {str(exc)}",
                )

        if task_id in _local_store:
            record = _local_store[task_id]
            for k, v in fields_to_update.items():
                if k == "due_date" and isinstance(v, str):
                    record[k] = task_update.due_date
                else:
                    record[k] = v
            record["updated_at"] = now
            return _row_to_task_response(record)

        return None

    @staticmethod
    def toggle_task(task_id: str, explicit_status: Optional[bool] = None) -> Optional[TaskResponse]:
        current = TaskService.get_task_by_id(task_id)
        if not current:
            return None

        new_status = not current.is_completed if explicit_status is None else explicit_status
        return TaskService.update_task(task_id, TaskUpdate(is_completed=new_status))

    @staticmethod
    def delete_task(task_id: str) -> bool:
        client = get_supabase_client()

        if client is not None:
            try:
                response = client.table("tasks").delete().eq("id", task_id).execute()
                # PostgREST returns deleted records in data
                if response.data and len(response.data) > 0:
                    return True
                # Check if it existed before delete or not found
                return False
            except Exception as exc:
                logger.error("Supabase delete error: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error deleting task {task_id}: {str(exc)}",
                )

        if task_id in _local_store:
            del _local_store[task_id]
            return True
        return False

    @staticmethod
    def clear_local_store() -> None:
        """Helper for test suites to reset memory store."""
        _local_store.clear()
