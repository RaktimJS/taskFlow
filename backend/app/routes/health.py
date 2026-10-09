from fastapi import APIRouter
from app.config import settings
from app.database import check_database_connection
from app.models import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check the server health and database connectivity status.",
)
@router.get(
    "/api/health",
    response_model=HealthResponse,
    include_in_schema=False,
)
def health_check() -> HealthResponse:
    connected, db_message = check_database_connection()
    status_str = "healthy" if connected or not settings.is_supabase_configured else "degraded"

    return HealthResponse(
        status=status_str,
        database=db_message,
        supabase_configured=settings.is_supabase_configured,
        version=settings.app_version,
    )
