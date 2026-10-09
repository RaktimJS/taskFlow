from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class PriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class StatusFilter(str, Enum):
    ALL = "all"
    OPEN = "open"
    DONE = "done"


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Title of the task")
    description: Optional[str] = Field(default="", description="Detailed description or notes for the task")
    is_completed: bool = Field(default=False, description="Whether the task is marked as done")
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM, description="Task priority (low, medium, high)")
    due_date: Optional[datetime] = Field(default=None, description="Due date and time in ISO format")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Title cannot be empty or blank")
        return trimmed


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255, description="Updated task title")
    description: Optional[str] = Field(default=None, description="Updated description")
    is_completed: Optional[bool] = Field(default=None, description="Updated completion status")
    priority: Optional[PriorityEnum] = Field(default=None, description="Updated priority")
    due_date: Optional[datetime] = Field(default=None, description="Updated due date")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Title cannot be empty or blank")
            return trimmed
        return v


class TaskToggle(BaseModel):
    is_completed: Optional[bool] = Field(
        default=None,
        description="Explicit completion status. If omitted, toggles the current state."
    )


class TaskResponse(BaseModel):
    id: str = Field(..., description="Unique task identifier (UUID)")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(default="", description="Task description")
    is_completed: bool = Field(..., description="Completion status")
    priority: str = Field(default="medium", description="Priority level")
    due_date: Optional[datetime] = Field(default=None, description="Task due date")
    created_at: Optional[datetime] = Field(default=None, description="Timestamp when task was created")
    updated_at: Optional[datetime] = Field(default=None, description="Timestamp when task was last updated")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Build TaskFlow backend",
                "description": "FastAPI with Supabase integration",
                "is_completed": False,
                "priority": "high",
                "due_date": "2026-10-15T12:00:00Z",
                "created_at": "2026-10-09T23:50:00Z",
                "updated_at": "2026-10-09T23:50:00Z"
            }
        }
    }


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    open_count: int
    done_count: int


class DeleteResponse(BaseModel):
    message: str = "Task deleted successfully"
    id: str


class HealthResponse(BaseModel):
    status: str
    database: str
    supabase_configured: bool
    version: str
