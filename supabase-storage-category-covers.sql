-- Run this in Supabase SQL Editor.
-- Replace YOUR_ADMIN_EMAIL with the email you use to log in to /admin.
-- This keeps the public portfolio bucket readable but restricts writes in category-covers/ to your admin account only.

-- Ensure the bucket exists and is public so the category cover images can display on the public portfolio page.
create bucket if not exists portfolio public;

-- Public reads for all images in the portfolio bucket.
create policy if not exists "Public read access for portfolio images"
on storage.objects for select
using (bucket_id = 'portfolio');

-- Restrict all writes inside category-covers/ to the authenticated admin only.
drop policy if exists "Admin can upload category cover images" on storage.objects;
drop policy if exists "Admin can delete category cover images" on storage.objects;

drop policy if exists "Admin can upload category cover images" on storage.objects;
create policy "Admin can upload category cover images"
on storage.objects for insert
with check (
  bucket_id = 'portfolio'
  and (storage.foldername(name))[1] = 'category-covers'
  and auth.role() = 'authenticated'
  and auth.uid() is not null
  and (select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL'
);

create policy "Admin can delete category cover images"
on storage.objects for delete
using (
  bucket_id = 'portfolio'
  and (storage.foldername(name))[1] = 'category-covers'
  and auth.role() = 'authenticated'
  and auth.uid() is not null
  and (select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL'
);

-- Keep other files in the portfolio bucket from being writable by random users.
create policy "No writes to other portfolio paths without admin"
on storage.objects for insert
with check (
  bucket_id = 'portfolio'
  and (storage.foldername(name))[1] is distinct from 'category-covers'
  and false
);

create policy "No deletes outside category-covers without admin"
on storage.objects for delete
using (
  bucket_id = 'portfolio'
  and (storage.foldername(name))[1] is distinct from 'category-covers'
  and false
);

-- Optional: allow updates for admin-only category-covers paths.
create policy "Admin can update category cover images"
on storage.objects for update
using (
  bucket_id = 'portfolio'
  and (storage.foldername(name))[1] = 'category-covers'
  and auth.role() = 'authenticated'
  and auth.uid() is not null
  and (select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL'
)
with check (
  bucket_id = 'portfolio'
  and (storage.foldername(name))[1] = 'category-covers'
  and auth.role() = 'authenticated'
  and auth.uid() is not null
  and (select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL'
);
