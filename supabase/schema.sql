-- ============================================================================
-- THE BREACH FILES: DATABASE SCHEMA & ROW LEVEL SECURITY
-- ============================================================================
-- Copy and paste this script directly into the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/iqhskbtavksjxrvyyriz/sql/new
-- ============================================================================

-- Ensure pgcrypto extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS:
DROP POLICY IF EXISTS "Public and authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Public and authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own username only" ON public.profiles;
CREATE POLICY "Users can update own username only"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

DROP POLICY IF EXISTS "Deny direct profile insertion" ON public.profiles;
CREATE POLICY "Deny direct profile insertion"
  ON public.profiles FOR INSERT
  WITH CHECK (false);

-- ----------------------------------------------------------------------------
-- 2. USER PROGRESS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_stages INTEGER[] NOT NULL DEFAULT '{}',
  current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage >= 1 AND current_stage <= 5),
  stage_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 500),
  case_concluded BOOLEAN NOT NULL DEFAULT false,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Progress RLS:
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Deny direct client progress insertion" ON public.user_progress;
CREATE POLICY "Deny direct client progress insertion"
  ON public.user_progress FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny direct client progress update" ON public.user_progress;
CREATE POLICY "Deny direct client progress update"
  ON public.user_progress FOR UPDATE
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny direct client progress deletion" ON public.user_progress;
CREATE POLICY "Deny direct client progress deletion"
  ON public.user_progress FOR DELETE
  WITH CHECK (false);

-- ----------------------------------------------------------------------------
-- 3. STAGE SUBMISSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stage_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_id INTEGER NOT NULL CHECK (stage_id >= 1 AND stage_id <= 5),
  payload JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  completion_status BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_stage ON public.stage_submissions(user_id, stage_id);

ALTER TABLE public.stage_submissions ENABLE ROW LEVEL SECURITY;

-- Submissions RLS:
DROP POLICY IF EXISTS "Users can view own submissions" ON public.stage_submissions;
CREATE POLICY "Users can view own submissions"
  ON public.stage_submissions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Deny direct client submission insert" ON public.stage_submissions;
CREATE POLICY "Deny direct client submission insert"
  ON public.stage_submissions FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny direct client submission update" ON public.stage_submissions;
CREATE POLICY "Deny direct client submission update"
  ON public.stage_submissions FOR UPDATE
  WITH CHECK (false);

-- ----------------------------------------------------------------------------
-- 4. SAFE LEADERBOARD VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT
  p.id AS user_id,
  p.username,
  p.role,
  COALESCE(up.total_score, 0) AS total_score,
  COALESCE(cardinality(up.completed_stages), 0) AS stages_completed,
  COALESCE(up.case_concluded, false) AS case_concluded,
  up.last_activity_at
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
WHERE p.role != 'admin'
ORDER BY total_score DESC, stages_completed DESC, up.last_activity_at ASC;

GRANT SELECT ON public.leaderboard_view TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. NEW USER SIGNUP TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_username TEXT;
BEGIN
  assigned_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'investigator_' || substr(new.id::text, 1, 8)
  );

  INSERT INTO public.profiles (id, username, role)
  VALUES (new.id, assigned_username, 'participant')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_progress (user_id, completed_stages, current_stage, total_score)
  VALUES (new.id, '{}', 1, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 6. IMMUTABLE ROLE ENFORCEMENT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_tampering()
RETURNS trigger AS $$
BEGIN
  IF NEW.role != OLD.role AND current_setting('request.jwt.claim.role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Privilege escalation violation: Participants cannot alter user roles.';
  END IF;
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_profile_immutability ON public.profiles;
CREATE TRIGGER enforce_profile_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_tampering();
