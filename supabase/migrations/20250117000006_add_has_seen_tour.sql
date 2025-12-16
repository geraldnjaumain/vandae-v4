-- Add has_seen_tour column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_tour BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_has_seen_tour ON public.profiles(has_seen_tour) WHERE has_seen_tour = FALSE;
