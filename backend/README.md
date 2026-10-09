# TaskFlow Backend

TaskFlow Backend is a RESTful API built with **Python**, **FastAPI**, and **Supabase (PostgreSQL)** for task management.

---

## Features

- **Must-Have Core CRUD:**
  - Create a new task with title and optional details (`POST /api/tasks`).
  - View all tasks (`GET /api/tasks`).
  - Mark a task as done or open again (`PATCH /api/tasks/{task_id}/toggle`).
  - Delete a task (`DELETE /api/tasks/{task_id}`).
- **Filtering & Organization:**
  - Filter by status (`all`, `open`, `done`) via query parameter `?status=open`.
  - Filter by priority (`low`, `medium`, `high`) via query parameter `?priority=high`.
  - Search by keyword across title and description `?search=keyword`.
  - Sort by date, title, or priority `?sort_by=created_at&order=desc`.
- **Database Persistence:**
  - Direct integration with Supabase (PostgreSQL).
  - Schema with Row Level Security (RLS) policies and automatic `updated_at` triggers.
- **Graceful Developer Experience:**
  - Interactive OpenAPI Swagger documentation at `/docs`.
  - Comprehensive Pytest test suite with 100% endpoint coverage.
  - Local in-memory persistence fallback for offline development & testing.

---

## Tech Stack

- **Framework:** FastAPI (0.115+)
- **Server:** Uvicorn (ASGI)
- **Data Validation:** Pydantic v2
- **Database:** Supabase (PostgreSQL via official `supabase-py` client)
- **Environment Management:** `python-dotenv`, `pydantic-settings`
- **Testing:** Pytest, HTTPX

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and root summary |
| `GET` | `/health` | Health check & Supabase connection status |
| `GET` | `/api/tasks` | List tasks (supports `status`, `priority`, `search`, `sort_by`, `order`) |
| `GET` | `/api/tasks/summary` | Get tasks with total, open, and done statistics |
| `GET` | `/api/tasks/{task_id}` | Fetch a single task by UUID |
| `POST` | `/api/tasks` | Create a new task |
| `PATCH` | `/api/tasks/{task_id}` | Partial update of task attributes |
| `PUT` | `/api/tasks/{task_id}` | Update task attributes |
| `PATCH` | `/api/tasks/{task_id}/toggle` | Quick toggle of task completion status |
| `DELETE` | `/api/tasks/{task_id}` | Delete a task |

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL (`https://<project-ref>.supabase.co`) | *Required for Postgres* |
| `SUPABASE_KEY` | Supabase anon key or service role key | *Required for Postgres* |
| `PORT` | Port number to run the FastAPI server | `8000` |
| `HOST` | Host address to bind | `0.0.0.0` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:5173,http://localhost:3000` |

> **Security Note:** Never commit `.env` to git. Ensure it remains listed in `.gitignore`.

---

## Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to your project dashboard -> **SQL Editor** -> **New Query**.
3. Open [`schema.sql`](./schema.sql), paste its contents, and click **Run**.
4. Retrieve your **Project URL** and **anon/public API key** from **Project Settings -> API**.
5. Add them to your `.env` file:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ```

---

## Getting Started

### 1. Prerequisites
- Python 3.12+ (or `uv`)

### 2. Install Dependencies
```bash
# Using standard venv & pip
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Or using uv (recommended for ultra-fast installs)
uv pip install -r requirements.txt
```

### 3. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
The server will be accessible at:
- **API URL:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 4. Run the Test Suite
```bash
pytest tests -v
```
