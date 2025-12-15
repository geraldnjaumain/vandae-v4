-- =================================================================
-- FIX for Infinite Recursion (Error 42P17)
-- This script replaces recursive RLS policies with Security Definer functions
-- =================================================================

-- 1. Create a secure function to check community membership
-- This runs with elevated privileges (SECURITY DEFINER) to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.is_member_of(_community_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = _community_id
    AND user_id = _user_id
  );
END;
$$;

-- 2. Create a secure function to check if a community is public
-- This bypasses RLS on the communities table to avoid cross-recursion
CREATE OR REPLACE FUNCTION public.is_community_public(_community_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.communities
    WHERE id = _community_id
    AND is_private = false
  );
END;
$$;

-- 3. Drop the old problematic policies
DROP POLICY IF EXISTS "Users can view public communities" ON public.communities;
DROP POLICY IF EXISTS "Users can view members of communities they belong to" ON public.community_members;
DROP POLICY IF EXISTS "Users can view posts in communities they belong to" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts in communities they belong to" ON public.posts;

-- 4. Create new, optimized policies using the helper functions

-- COMMUNITIES: Visible if public OR user is a member
CREATE POLICY "Users can view public or joined communities"
ON public.communities
FOR SELECT
USING (
  is_private = false
  OR
  is_member_of(id, auth.uid())
);

-- COMMUNITY MEMBERS: Visible if:
-- 1. It is my own membership (I want to see what I joined)
-- 2. I am a member of that community (I want to see who else is there)
-- 3. It is a public community (I want to see who is in a public group)
CREATE POLICY "Users can view relevant community members"
ON public.community_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  is_member_of(community_id, auth.uid())
  OR
  is_community_public(community_id)
);

-- POSTS: Visible if member OR public community
CREATE POLICY "Users can view relevant posts"
ON public.posts
FOR SELECT
USING (
  is_member_of(community_id, auth.uid())
  OR
  is_community_public(community_id)
);

-- POSTS Creation: Must be member
CREATE POLICY "Users can create posts in communities they belong to"
ON public.posts
FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND
  is_member_of(community_id, auth.uid())
);
