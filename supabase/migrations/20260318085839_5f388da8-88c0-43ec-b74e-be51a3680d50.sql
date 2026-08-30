-- Create shared updated_at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Store per-user achievement progress
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_key)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.user_achievements
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements"
ON public.user_achievements
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_key ON public.user_achievements(achievement_key);

DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON public.user_achievements;
CREATE TRIGGER update_user_achievements_updated_at
BEFORE UPDATE ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Store flexible per-feature progress/state so feature tools can persist user data
CREATE TABLE IF NOT EXISTS public.user_feature_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature_key)
);

ALTER TABLE public.user_feature_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feature progress"
ON public.user_feature_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feature progress"
ON public.user_feature_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature progress"
ON public.user_feature_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feature progress"
ON public.user_feature_progress
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_feature_progress_user_id ON public.user_feature_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_progress_feature_key ON public.user_feature_progress(feature_key);

DROP TRIGGER IF EXISTS update_user_feature_progress_updated_at ON public.user_feature_progress;
CREATE TRIGGER update_user_feature_progress_updated_at
BEFORE UPDATE ON public.user_feature_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Store theme preference per user
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Routine planning: weekly/monthly plans
CREATE TABLE IF NOT EXISTS public.routine_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.routine_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routine plans"
ON public.routine_plans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routine plans"
ON public.routine_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routine plans"
ON public.routine_plans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routine plans"
ON public.routine_plans
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_routine_plans_user_id ON public.routine_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_plans_period ON public.routine_plans(period);

DROP TRIGGER IF EXISTS update_routine_plans_updated_at ON public.routine_plans;
CREATE TRIGGER update_routine_plans_updated_at
BEFORE UPDATE ON public.routine_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks within a plan
CREATE TABLE IF NOT EXISTS public.routine_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.routine_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routine tasks"
ON public.routine_tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routine tasks"
ON public.routine_tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routine tasks"
ON public.routine_tasks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routine tasks"
ON public.routine_tasks
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_routine_tasks_user_id ON public.routine_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_tasks_plan_id ON public.routine_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_routine_tasks_sort_order ON public.routine_tasks(sort_order);

DROP TRIGGER IF EXISTS update_routine_tasks_updated_at ON public.routine_tasks;
CREATE TRIGGER update_routine_tasks_updated_at
BEFORE UPDATE ON public.routine_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Daily completion records for each task
CREATE TABLE IF NOT EXISTS public.routine_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.routine_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, checkin_date)
);

ALTER TABLE public.routine_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routine checkins"
ON public.routine_checkins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routine checkins"
ON public.routine_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routine checkins"
ON public.routine_checkins
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routine checkins"
ON public.routine_checkins
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_routine_checkins_user_id ON public.routine_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_checkins_task_id ON public.routine_checkins(task_id);
CREATE INDEX IF NOT EXISTS idx_routine_checkins_date ON public.routine_checkins(checkin_date);

DROP TRIGGER IF EXISTS update_routine_checkins_updated_at ON public.routine_checkins;
CREATE TRIGGER update_routine_checkins_updated_at
BEFORE UPDATE ON public.routine_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();