-- =====================================================
-- ADMIN DASHBOARD SYSTEM
-- =====================================================
-- Admin authentication and configuration management
-- =====================================================

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- TABLE: admin_users
-- Tracks which users have admin privileges
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin', -- 'super_admin' | 'admin'
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_admin_role CHECK (role IN ('super_admin', 'admin'))
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view admin_users
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Only super_admins can create/update/delete admins
CREATE POLICY "Super admins can manage admin_users"
  ON public.admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Indexes
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);

-- =====================================================
-- TABLE: app_settings
-- Stores environment configuration (API keys, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE, -- e.g., 'GEMINI_API_KEY', 'SUPABASE_URL'
  value TEXT, -- Encrypted for secrets
  description TEXT,
  category TEXT DEFAULT 'general', -- 'api_keys' | 'database' | 'features' | 'general'
  is_secret BOOLEAN DEFAULT FALSE NOT NULL, -- If true, value is encrypted
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can read settings
CREATE POLICY "Admins can view app_settings"
  ON public.app_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Only super_admins can modify settings
CREATE POLICY "Super admins can modify app_settings"
  ON public.app_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Indexes
CREATE INDEX idx_app_settings_key ON public.app_settings(key);
CREATE INDEX idx_app_settings_category ON public.app_settings(category);

-- =====================================================
-- TABLE: audit_logs
-- Track all admin actions for accountability
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'user_suspended', 'community_deleted', 'setting_updated', etc.
  target_type TEXT, -- 'user', 'community', 'setting', etc.
  target_id TEXT, -- ID of affected resource
  changes JSONB, -- Store before/after values
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit logs (read-only)
CREATE POLICY "Admins can view audit_logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Indexes for fast querying
CREATE INDEX idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_target_type ON public.audit_logs(target_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to log admin actions automatically
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, changes)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_changes)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to encrypt setting values
CREATE OR REPLACE FUNCTION encrypt_setting_value(p_value TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use pgcrypto's encrypt function with a key from environment
  -- In production, use a proper encryption key management system
  RETURN encode(
    encrypt(
      p_value::bytea,
      current_setting('app.encryption_key', true)::bytea,
      'aes'
    ),
    'base64'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: return unencrypted if encryption fails
    RETURN p_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt setting values
CREATE OR REPLACE FUNCTION decrypt_setting_value(p_encrypted_value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(p_encrypted_value, 'base64'),
      current_setting('app.encryption_key', true)::bytea,
      'aes'
    ),
    'utf8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: return as-is if decryption fails
    RETURN p_encrypted_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = p_user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR ADMIN DASHBOARD
-- =====================================================

-- User statistics view
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7d,
  COUNT(CASE WHEN updated_at >= NOW() - INTERVAL '7 days' THEN 1 END) as active_users_7d,
  COUNT(CASE WHEN is_pro_member THEN 1 END) as pro_members
FROM public.profiles;

-- Community statistics view
CREATE OR REPLACE VIEW public.admin_community_stats AS
SELECT
  COUNT(*) as total_communities,
  COUNT(CASE WHEN is_private THEN 1 END) as private_communities,
  COALESCE(SUM(member_count), 0) as total_memberships,
  COALESCE(AVG(member_count), 0) as avg_members_per_community,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_communities_30d
FROM public.communities;

-- AI usage statistics view (requires ai_cache table)
CREATE OR REPLACE VIEW public.admin_ai_stats AS
SELECT
  endpoint,
  COUNT(*) as total_cached,
  SUM(hit_count) as total_hits,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as cached_today,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_cache_entries
FROM public.ai_cache
GROUP BY endpoint;

-- =====================================================
-- INITIAL DATA: Create first super admin
-- =====================================================
-- IMPORTANT: Replace <YOUR_USER_ID> with actual user ID
-- Run this SQL after creating your first user account:
-- 
-- INSERT INTO public.admin_users (user_id, role)
-- VALUES ('<YOUR_USER_ID>', 'super_admin');
--
-- You can get your user ID by running:
-- SELECT id FROM auth.users WHERE email = 'your@email.com';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETED
-- =====================================================
