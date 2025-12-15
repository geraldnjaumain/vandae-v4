-- =================================================================
-- STORAGE SETUP for Vault
-- This script configures the Supabase Storage bucket
-- =================================================================

-- 1. Create the 'vault' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (if not already enabled, usually is by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for the 'vault' bucket

-- Allow users to upload files to their own folder: vault/{user_id}/*
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vault' 
  AND auth.uid() = owner
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view/download their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vault'
  AND (
    auth.uid() = owner
    OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vault'
  AND (
    auth.uid() = owner
    OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);
