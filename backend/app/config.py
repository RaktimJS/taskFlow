from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Try to load .env from backend/ or project root
current_dir = Path(__file__).resolve().parent.parent
root_dir = current_dir.parent

load_dotenv(dotenv_path=current_dir / ".env")
load_dotenv(dotenv_path=root_dir / ".env")


class Settings(BaseSettings):
    """Application settings and environment variable parser."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "TaskFlow API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True

    # Supabase credentials
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS settings
    allowed_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> List[str]:
        if not self.allowed_origins:
            return ["*"]
        if self.allowed_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def is_supabase_configured(self) -> bool:
        if not self.supabase_url or not self.supabase_key:
            return False
        # Check against common placeholder values
        url = self.supabase_url.strip()
        key = self.supabase_key.strip()
        if "your-project-id" in url or "your-supabase" in key or not url.startswith("http"):
            return False
        return True


settings = Settings()
