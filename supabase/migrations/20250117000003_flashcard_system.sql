-- =====================================================
-- FLASHCARD & SPACED REPETITION SYSTEM
-- =====================================================
-- Implements SM-2 algorithm for optimal learning retention
-- =====================================================

-- =====================================================
-- TABLE: flashcard_decks
-- Organizational containers for flashcard sets
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Deck configuration
  settings JSONB DEFAULT '{
    "newCardsPerDay": 20,
    "reviewsPerDay": 100,
    "intervalModifier": 1.0,
    "easyBonus": 1.3,
    "hardInterval": 1.2
  }'::jsonb,
  
  -- Metadata
  color TEXT DEFAULT '#3b82f6', -- For UI display
  icon TEXT, -- Emoji or icon identifier
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT deck_name_not_empty CHECK (char_length(name) > 0)
);

-- =====================================================
-- TABLE: flashcards
-- Individual flashcard items within decks
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  
  -- Card content
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  front_media_url TEXT, -- Image/audio URL from Supabase storage
  back_media_url TEXT,
  
  -- Organization
  tags TEXT[] DEFAULT '{}',
  
  -- Difficulty tracking (for statistics)
  difficulty_rating DECIMAL(3,2) DEFAULT 2.5, -- Average ease factor
  
  -- SM-2 algorithm state
  interval INTEGER DEFAULT 0, -- Days until next review
  ease_factor DECIMAL(3,2) DEFAULT 2.5, -- SM-2 ease factor (starts at 2.5)
  repetitions INTEGER DEFAULT 0, -- Count of successful reviews
  next_review_date TIMESTAMPTZ, -- When card is due
  
  -- Card state
  card_state TEXT DEFAULT 'new' CHECK (card_state IN ('new', 'learning', 'reviewing', 'relearning')),
  
  -- Metadata
  times_reviewed INTEGER DEFAULT 0,
  times_failed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT card_front_not_empty CHECK (char_length(front) > 0),
  CONSTRAINT card_back_not_empty CHECK (char_length(back) > 0)
);

-- =====================================================
-- TABLE: review_sessions
-- Tracks individual study sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  
  -- Session metrics
  cards_reviewed INTEGER DEFAULT 0,
  cards_correct INTEGER DEFAULT 0, -- Rated Good or Easy
  cards_failed INTEGER DEFAULT 0, -- Rated Again
  session_duration INTEGER DEFAULT 0, -- Seconds
  
  -- Session state
  completion_status TEXT DEFAULT 'active' CHECK (completion_status IN ('active', 'completed', 'paused', 'abandoned')),
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT positive_cards_reviewed CHECK (cards_reviewed >= 0)
);

-- =====================================================
-- TABLE: card_review_history
-- Individual card review records for SM-2 algorithm
-- =====================================================
CREATE TABLE IF NOT EXISTS public.card_review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.review_sessions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Review outcome
  rating INTEGER NOT NULL CHECK (rating IN (1, 2, 3, 4)), -- 1=Again, 2=Hard, 3=Good, 4=Easy
  time_taken INTEGER, -- Seconds to answer
  
  -- SM-2 state at time of review
  interval_before INTEGER,
  ease_factor_before DECIMAL(3,2),
  interval_after INTEGER NOT NULL,
  ease_factor_after DECIMAL(3,2) NOT NULL,
  next_review_date TIMESTAMPTZ NOT NULL,
  
  -- Timestamp
  reviewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 4)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Flashcard decks
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON public.flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_created_at ON public.flashcard_decks(created_at DESC);

-- Flashcards
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review_date ON public.flashcards(next_review_date) WHERE next_review_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flashcards_card_state ON public.flashcards(card_state);
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON public.flashcards USING GIN(tags);

-- Review sessions
CREATE INDEX IF NOT EXISTS idx_review_sessions_user_id ON public.review_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_deck_id ON public.review_sessions(deck_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_started_at ON public.review_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_sessions_status ON public.review_sessions(completion_status);

-- Card review history
CREATE INDEX IF NOT EXISTS idx_card_review_history_flashcard_id ON public.card_review_history(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_card_review_history_session_id ON public.card_review_history(session_id);
CREATE INDEX IF NOT EXISTS idx_card_review_history_user_id ON public.card_review_history(user_id);
CREATE INDEX IF NOT EXISTS idx_card_review_history_reviewed_at ON public.card_review_history(reviewed_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_review_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own decks" ON public.flashcard_decks;
DROP POLICY IF EXISTS "Users can create their own decks" ON public.flashcard_decks;
DROP POLICY IF EXISTS "Users can update their own decks" ON public.flashcard_decks;
DROP POLICY IF EXISTS "Users can delete their own decks" ON public.flashcard_decks;

-- Flashcard decks policies
CREATE POLICY "Users can view their own decks"
  ON public.flashcard_decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks"
  ON public.flashcard_decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON public.flashcard_decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON public.flashcard_decks FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing flashcard policies
DROP POLICY IF EXISTS "Users can view cards in their decks" ON public.flashcards;
DROP POLICY IF EXISTS "Users can create cards in their decks" ON public.flashcards;
DROP POLICY IF EXISTS "Users can update cards in their decks" ON public.flashcards;
DROP POLICY IF EXISTS "Users can delete cards in their decks" ON public.flashcards;

-- Flashcards policies (access via deck ownership)
CREATE POLICY "Users can view cards in their decks"
  ON public.flashcards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks
      WHERE id = flashcards.deck_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cards in their decks"
  ON public.flashcards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks
      WHERE id = deck_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their decks"
  ON public.flashcards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks
      WHERE id = flashcards.deck_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards in their decks"
  ON public.flashcards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks
      WHERE id = flashcards.deck_id AND user_id = auth.uid()
    )
  );

-- Drop existing review session policies
DROP POLICY IF EXISTS "Users can view their own review sessions" ON public.review_sessions;
DROP POLICY IF EXISTS "Users can create their own review sessions" ON public.review_sessions;
DROP POLICY IF EXISTS "Users can update their own review sessions" ON public.review_sessions;
DROP POLICY IF EXISTS "Users can delete their own review sessions" ON public.review_sessions;

-- Review sessions policies
CREATE POLICY "Users can view their own review sessions"
  ON public.review_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own review sessions"
  ON public.review_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review sessions"
  ON public.review_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review sessions"
  ON public.review_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing card review history policies
DROP POLICY IF EXISTS "Users can view their own review history" ON public.card_review_history;
DROP POLICY IF EXISTS "Users can create their own review history" ON public.card_review_history;

-- Card review history policies
CREATE POLICY "Users can view their own review history"
  ON public.card_review_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own review history"
  ON public.card_review_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS FOR SM-2 ALGORITHM
-- =====================================================

-- Function to calculate next review using SM-2 algorithm
CREATE OR REPLACE FUNCTION calculate_sm2_next_review(
  p_rating INTEGER,
  p_current_interval INTEGER,
  p_current_ease_factor DECIMAL,
  p_repetitions INTEGER
)
RETURNS TABLE (
  new_interval INTEGER,
  new_ease_factor DECIMAL,
  new_repetitions INTEGER,
  next_review_date TIMESTAMPTZ
) AS $$
DECLARE
  v_ease_factor DECIMAL;
  v_interval INTEGER;
  v_reps INTEGER;
BEGIN
  v_ease_factor := p_current_ease_factor;
  v_reps := p_repetitions;
  
  -- Update ease factor based on rating
  IF p_rating >= 3 THEN
    -- Good or Easy: increase ease factor
    v_ease_factor := v_ease_factor + (0.1 - (4 - p_rating) * (0.08 + (4 - p_rating) * 0.02));
  ELSE
    -- Again or Hard: decrease ease factor
    v_ease_factor := GREATEST(1.3, v_ease_factor - 0.2);
  END IF;
  
  -- Ensure ease factor is at least 1.3
  v_ease_factor := GREATEST(1.3, v_ease_factor);
  
  -- Calculate new interval
  IF p_rating = 1 THEN
    -- Again: reset to 1 day
    v_interval := 1;
    v_reps := 0;
  ELSIF p_rating = 2 THEN
    -- Hard: slight increase
    v_interval := GREATEST(1, ROUND(p_current_interval * 1.2)::INTEGER);
    v_reps := v_reps + 1;
  ELSIF p_rating = 3 THEN
    -- Good: standard SM-2 calculation
    IF v_reps = 0 THEN
      v_interval := 1;
    ELSIF v_reps = 1 THEN
      v_interval := 6;
    ELSE
      v_interval := ROUND(p_current_interval * v_ease_factor)::INTEGER;
    END IF;
    v_reps := v_reps + 1;
  ELSE
    -- Easy: bonus multiplier
    IF v_reps = 0 THEN
      v_interval := 4;
    ELSE
      v_interval := ROUND(p_current_interval * v_ease_factor * 1.3)::INTEGER;
    END IF;
    v_reps := v_reps + 1;
  END IF;
  
  -- Return results
  RETURN QUERY SELECT
    v_interval,
    v_ease_factor,
    v_reps,
    (NOW() + (v_interval || ' days')::INTERVAL)::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp for decks
CREATE TRIGGER update_flashcard_decks_updated_at
  BEFORE UPDATE ON public.flashcard_decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for flashcards
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View for deck statistics
CREATE OR REPLACE VIEW public.deck_statistics AS
SELECT
  d.id as deck_id,
  d.user_id,
  d.name as deck_name,
  COUNT(f.id) as total_cards,
  COUNT(f.id) FILTER (WHERE f.card_state = 'new') as new_cards,
  COUNT(f.id) FILTER (WHERE f.next_review_date <= NOW()) as due_cards,
  COUNT(f.id) FILTER (WHERE f.card_state = 'reviewing') as mature_cards,
  COALESCE(AVG(f.ease_factor), 0) as avg_ease_factor,
  COALESCE(
    (COUNT(DISTINCT crh.id) FILTER (WHERE crh.rating >= 3)::DECIMAL / 
     NULLIF(COUNT(DISTINCT crh.id), 0) * 100),
    0
  ) as retention_rate
FROM public.flashcard_decks d
LEFT JOIN public.flashcards f ON f.deck_id = d.id
LEFT JOIN public.card_review_history crh ON crh.flashcard_id = f.id
  AND crh.reviewed_at >= NOW() - INTERVAL '30 days'
GROUP BY d.id, d.user_id, d.name;

-- =====================================================
-- COMPLETED
-- =====================================================
