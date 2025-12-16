-- Fix post_comments to profiles relationship
-- The issue is that Supabase doesn't recognize the relationship for nested select queries

-- First, ensure the foreign key exists correctly
-- Drop existing constraint if any
ALTER TABLE public.post_comments 
  DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;

-- Re-add the foreign key constraint with proper naming
ALTER TABLE public.post_comments 
  ADD CONSTRAINT post_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);

-- Refresh the schema cache (this comment is for documentation)
-- You may need to run this in Supabase SQL Editor after migration:
-- NOTIFY pgrst, 'reload schema';
