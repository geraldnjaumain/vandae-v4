-- =====================================================
-- ACADEMIC ANALYTICS SYSTEM
-- =====================================================
-- Comprehensive analytics for tracking student progress,
-- study habits, grades, and performance metrics
-- =====================================================

-- =====================================================
-- TABLE: study_sessions
-- Track study sessions and focus time
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Session details
  activity_type TEXT NOT NULL CHECK (activity_type IN ('flashcard', 'assignment', 'reading', 'research', 'other')),
  duration INTEGER NOT NULL CHECK (duration >= 0), -- seconds
  focus_score DECIMAL(3,2) CHECK (focus_score >= 0 AND focus_score <= 100), -- 0-100 based on activity
  
  -- Reference IDs
  reference_id UUID, -- deck_id, assignment_id, etc.
  reference_type TEXT, -- 'deck', 'assignment', 'resource', etc.
  
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- TABLE: grade_entries
-- Store assignment grades and feedback
-- =====================================================
CREATE TABLE IF NOT EXISTS public.grade_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  
  -- Grade details
  grade DECIMAL(10,2) NOT NULL,
  max_grade DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((grade / max_grade) * 100) STORED,
  
  -- Feedback
  feedback TEXT,
  graded_by UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  graded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_grade CHECK (grade >= 0 AND grade <= max_grade),
  CONSTRAINT valid_max_grade CHECK (max_grade > 0)
);

-- =====================================================
-- TABLE: user_goals
-- Personal goals and milestones
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Goal details
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('study_time', 'grade_average', 'flashcard_retention', 'assignment_completion', 'streak', 'custom')),
  
  -- Target
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT, -- 'hours', 'percentage', 'cards', etc.
  
  -- Timeline
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_target CHECK (target_value > 0),
  CONSTRAINT valid_dates CHECK (target_date IS NULL OR target_date >= start_date)
);

-- =====================================================
-- MATERIALIZED VIEW: user_analytics
-- Pre-calculated user statistics for dashboard
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_analytics AS
SELECT 
  ss.user_id,
  
  -- Study time metrics
  COUNT(DISTINCT DATE(ss.started_at)) as study_days_total,
  COUNT(DISTINCT DATE(ss.started_at)) FILTER (WHERE ss.started_at >= NOW() - INTERVAL '7 days') as study_days_week,
  COUNT(DISTINCT DATE(ss.started_at)) FILTER (WHERE ss.started_at >= NOW() - INTERVAL '30 days') as study_days_month,
  
  SUM(ss.duration) as total_study_time_seconds,
  SUM(ss.duration) FILTER (WHERE ss.started_at >= NOW() - INTERVAL '7 days') as study_time_week_seconds,
  SUM(ss.duration) FILTER (WHERE ss.started_at >= NOW() - INTERVAL '30 days') as study_time_month_seconds,
  
  AVG(ss.focus_score) as avg_focus_score,
  
  -- Activity breakdown
  SUM(ss.duration) FILTER (WHERE ss.activity_type = 'flashcard') as flashcard_time_seconds,
  SUM(ss.duration) FILTER (WHERE ss.activity_type = 'assignment') as assignment_time_seconds,
  SUM(ss.duration) FILTER (WHERE ss.activity_type = 'reading') as reading_time_seconds,
  
  -- Grade metrics
  (SELECT AVG(percentage) FROM public.grade_entries WHERE user_id = ss.user_id) as avg_grade_percentage,
  (SELECT COUNT(*) FROM public.grade_entries WHERE user_id = ss.user_id) as total_grades,
  
  -- Flashcard metrics (from review history)
  (SELECT COUNT(*) FROM public.card_review_history WHERE user_id = ss.user_id AND rating >= 3) as flashcard_correct,
  (SELECT COUNT(*) FROM public.card_review_history WHERE user_id = ss.user_id) as flashcard_total,
  
  -- Last activity
  MAX(ss.started_at) as last_study_session

FROM public.study_sessions ss
GROUP BY ss.user_id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);

-- =====================================================
-- INDEXES
-- =====================================================

-- Study sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_activity_type ON public.study_sessions(activity_type);

-- Grade entries
CREATE INDEX IF NOT EXISTS idx_grade_entries_user_id ON public.grade_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_grade_entries_assignment_id ON public.grade_entries(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grade_entries_graded_at ON public.grade_entries(graded_at DESC);

-- User goals
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON public.user_goals(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;

-- Study sessions policies
CREATE POLICY "Users can view their own study sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
  ON public.study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing grade policies
DROP POLICY IF EXISTS "Users can view their own grades" ON public.grade_entries;
DROP POLICY IF EXISTS "Users can insert grade entries" ON public.grade_entries;
DROP POLICY IF EXISTS "Graders can update grade entries" ON public.grade_entries;

-- Grade entries policies
CREATE POLICY "Users can view their own grades"
  ON public.grade_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert grade entries"
  ON public.grade_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = graded_by);

CREATE POLICY "Graders can update grade entries"
  ON public.grade_entries FOR UPDATE
  USING (auth.uid() = graded_by);

-- Drop existing goals policies
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;

-- User goals policies
CREATE POLICY "Users can view their own goals"
  ON public.user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON public.user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.user_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.user_goals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to refresh user analytics
CREATE OR REPLACE FUNCTION refresh_user_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate study streak
CREATE OR REPLACE FUNCTION get_study_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_session BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.study_sessions
      WHERE user_id = p_user_id
      AND DATE(started_at) = check_date
    ) INTO has_session;
    
    EXIT WHEN NOT has_session;
    
    streak := streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_goals_updated_at ON public.user_goals;
DROP TRIGGER IF EXISTS on_goal_update_check_completion ON public.user_goals;

-- Update updated_at timestamp for user_goals
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-complete goals when target is reached
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_value >= NEW.target_value AND NEW.status = 'active' THEN
    NEW.status := 'completed';
    NEW.completed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_goal_update_check_completion
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION check_goal_completion();

-- =====================================================
-- COMPLETED
-- =====================================================
