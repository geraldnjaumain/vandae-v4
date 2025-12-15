-- =====================================================
-- FIX: Community Interaction Permissions
-- =====================================================

-- 1. DROP EXISTING FUNCTIONS AND TRIGGERS
-- We need to recreate them with SECURITY DEFINER
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON public.post_likes;
DROP FUNCTION IF EXISTS public.update_post_likes_count();

DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.post_comments;
DROP FUNCTION IF EXISTS public.update_post_comments_count();

-- 2. RECREATE FUNCTIONS WITH SECURITY DEFINER
-- This allows the function to bypass RLS on the 'posts' table when updating counts

CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- <--- ADDED SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = comments_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- <--- ADDED SECURITY DEFINER

-- 3. RECREATE TRIGGERS
CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER update_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- 4. FIX POST_LIKES VISIBILITY POLICY
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view likes on posts they can see" ON public.post_likes;

-- Create correct policy including public communities
CREATE POLICY "Users can view likes on posts they can see"
  ON public.post_likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.community_members cm ON p.community_id = cm.community_id
      WHERE p.id = post_likes.post_id AND cm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.communities c ON p.community_id = c.id
      WHERE p.id = post_likes.post_id AND c.is_private = false
    )
  );
