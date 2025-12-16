-- =====================================================
-- AI RESPONSE CACHE SYSTEM
-- =====================================================
-- Reduces Gemini API calls by caching responses
-- =====================================================

-- Create ai_cache table
CREATE TABLE IF NOT EXISTS public.ai_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL UNIQUE, -- Hash of query parameters
  endpoint TEXT NOT NULL, -- 'ai-chat', 'ai-analyze-course', 'research', 'syllabus-parse'
  model_used TEXT NOT NULL, -- e.g., 'models/gemini-2.5-flash'
  request_params JSONB NOT NULL, -- Store original request for debugging
  response_data JSONB NOT NULL, -- Cached AI response
  hit_count INTEGER DEFAULT 0 NOT NULL, -- Track how many times cache was used
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL, -- TTL-based expiration
  last_accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role to manage cache (backend only)
-- Regular users should not directly access cache table
CREATE POLICY "Service role can manage ai_cache"
  ON public.ai_cache
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Indexes for performance
CREATE INDEX idx_ai_cache_cache_key ON public.ai_cache(cache_key);
CREATE INDEX idx_ai_cache_endpoint ON public.ai_cache(endpoint);
CREATE INDEX idx_ai_cache_expires_at ON public.ai_cache(expires_at);
CREATE INDEX idx_ai_cache_created_at ON public.ai_cache(created_at DESC);

-- =====================================================
-- CACHE STATISTICS VIEW
-- For admin dashboard analytics
-- =====================================================
CREATE OR REPLACE VIEW public.ai_cache_stats AS
SELECT
  endpoint,
  COUNT(*) as total_cached_entries,
  SUM(hit_count) as total_cache_hits,
  AVG(hit_count) as avg_hits_per_entry,
  MAX(created_at) as latest_cache_entry,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_entries,
  COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_entries
FROM public.ai_cache
GROUP BY endpoint;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ai_cache
  WHERE expires_at <= NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update cache hit count and last accessed time
CREATE OR REPLACE FUNCTION increment_cache_hit(p_cache_key TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ai_cache
  SET 
    hit_count = hit_count + 1,
    last_accessed_at = NOW()
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup job (requires pg_cron extension)
-- Run every 6 hours to clean expired entries
-- Note: Enable pg_cron in Supabase dashboard first
-- SELECT cron.schedule('cleanup-ai-cache', '0 */6 * * *', 'SELECT cleanup_expired_cache();');

-- =====================================================
-- COMPLETED
-- =====================================================
