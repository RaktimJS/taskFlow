-- ==========================================================
-- TaskFlow Database Schema (Supabase PostgreSQL)
-- ==========================================================
-- Run this script in the Supabase Dashboard SQL Editor
-- (Project Dashboard -> SQL Editor -> New Query -> Paste & Run)

-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create index for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON public.tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_tasks_updated ON public.tasks;
CREATE TRIGGER on_tasks_updated
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Set up RLS Policies (Allow read/insert/update/delete for anonymous & authenticated clients)
DROP POLICY IF EXISTS "Allow public read access" ON public.tasks;
CREATE POLICY "Allow public read access"
    ON public.tasks
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.tasks;
CREATE POLICY "Allow public insert access"
    ON public.tasks
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.tasks;
CREATE POLICY "Allow public update access"
    ON public.tasks
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access" ON public.tasks;
CREATE POLICY "Allow public delete access"
    ON public.tasks
    FOR DELETE
    USING (true);
