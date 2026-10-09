# TaskFlow

**TaskFlow** is a modern task manager application. This repository contains the backend API and frontend client.

> **Status:** Backend implementation complete. Frontend pending.

---

## Architecture Overview

- **Backend:** Python + FastAPI REST API (`backend/`)
- **Database:** Supabase (PostgreSQL)
- **Frontend:** React + Vite (`frontend/`)

---

## Backend Quick Start

### 1. Requirements
- Python 3.12+ (or `uv`)
- A Supabase project (PostgreSQL)

### 2. Setup & Installation
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# or: source .venv/bin/activate  # macOS / Linux
pip install -r requirements.txt
```

### 3. Database Initialization
1. In your Supabase dashboard, open the **SQL Editor**.
2. Run the script found in [`backend/schema.sql`](backend/schema.sql).
3. Copy your project credentials from **Settings -> API**.

### 4. Configuration
Create a `.env` file in `backend/` (or copy from `.env.example`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

### 5. Run the Server
```bash
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive API Docs: `http://localhost:8000/docs`

### 6. Run Tests
```bash
pytest backend/tests -v
```

---

## API Summary

- `POST /api/tasks` - Create a task
- `GET /api/tasks` - List tasks with status (`all`, `open`, `done`), priority, and search filters
- `GET /api/tasks/{id}` - Get a single task
- `PATCH /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/toggle` - Mark task as done or open
- `DELETE /api/tasks/{id}` - Delete task
- `GET /health` - Service health & Supabase connectivity check
