-- Enable 'resources' Storage Bucket
insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do nothing;

-- Policy: Anyone can view (it's public)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'resources' );

-- Policy: Authenticated users can upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'resources'
    and auth.role() = 'authenticated'
  );

-- Policy: Users can update/delete their own files (assuming structure: user_id/filename)
create policy "Users can manage own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'resources'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Repeat for 'avatars' if missing
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public Access Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );
