import logging
from typing import Optional, Tuple
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """Returns the singleton Supabase client, or None if not configured."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.is_supabase_configured:
        try:
            logger.info("Connecting to Supabase at %s", settings.supabase_url)
            _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
            return _supabase_client
        except Exception as exc:
            logger.error("Failed to initialize Supabase client: %s", exc)
            return None

    return None


def reset_supabase_client() -> None:
    """Reset cached client (useful during testing or runtime config reload)."""
    global _supabase_client
    _supabase_client = None


def check_database_connection() -> Tuple[bool, str]:
    """
    Checks the status of the Supabase PostgreSQL connection.
    Returns (is_connected: bool, message: str).
    """
    if not settings.is_supabase_configured:
        return False, "Supabase credentials not configured. Using local persistence fallback."

    client = get_supabase_client()
    if not client:
        return False, "Failed to initialize Supabase client."

    try:
        # Perform a minimal ping against the 'tasks' table
        response = client.table("tasks").select("id").limit(1).execute()
        return True, "Connected to Supabase Postgres (table: tasks)"
    except Exception as exc:
        err_msg = str(exc)
        if "relation \"public.tasks\" does not exist" in err_msg.lower() or "42p01" in err_msg.lower():
            return False, "Supabase connected, but 'tasks' table does not exist. Please run schema.sql in Supabase SQL editor."
        logger.warning("Supabase connection check warning: %s", err_msg)
        return False, f"Supabase connection error: {err_msg}"
