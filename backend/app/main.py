import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import check_database_connection
from app.routes import health, tasks

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("taskflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events: runs on startup and shutdown."""
    logger.info("Starting %s v%s...", settings.app_name, settings.app_version)
    if settings.is_supabase_configured:
        logger.info("Supabase configured at: %s", settings.supabase_url)
        connected, msg = check_database_connection()
        if connected:
            logger.info("Database: %s", msg)
        else:
            logger.warning("Database warning: %s", msg)
    else:
        logger.warning(
            "SUPABASE_URL and SUPABASE_KEY are not configured in .env. "
            "Running with in-memory persistence fallback. "
            "Please configure Supabase for persistent PostgreSQL storage."
        )
    yield
    logger.info("Shutting down %s...", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    description=(
        "TaskFlow API is a modern, high-performance task management backend "
        "built with FastAPI and Supabase (PostgreSQL)."
    ),
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
cors_origins = settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router)
app.include_router(tasks.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "tasks": "/api/tasks",
            "health": "/health",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
