-- =================================================================
-- FIX STORAGE POLICIES (Run this in Supabase SQL Editor)
-- =================================================================

-- 1. Ensure the 'vault' bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vault', 'vault', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on objects (Just in case)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. DROP ALL existing policies for the vault to avoid conflicts
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1qkm9d_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1qkm9d_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1qkm9d_2" ON storage.objects;

-- 4. Create Correct Policies based on Folder Path

-- INSERT
CREATE POLICY "Allow Upload to Own Folder" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT
CREATE POLICY "Allow View Own Folder" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE
CREATE POLICY "Allow Delete Own Folder" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
