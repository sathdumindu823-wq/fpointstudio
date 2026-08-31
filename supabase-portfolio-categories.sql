-- Run this once in Supabase: SQL Editor > New query > Run.
-- Replace YOUR_ADMIN_EMAIL with the email you use to log in at /admin.

create table if not exists public.portfolio_categories (
  slug text primary key,
  name text not null,
  image_url text not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_categories enable row level security;

drop policy if exists "Anyone can read portfolio category covers" on public.portfolio_categories;
create policy "Anyone can read portfolio category covers"
on public.portfolio_categories for select using (true);

drop policy if exists "Only the studio admin can edit portfolio category covers" on public.portfolio_categories;
create policy "Only the studio admin can edit portfolio category covers"
on public.portfolio_categories for all
to authenticated
using ((select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL')
with check ((select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL');

insert into public.portfolio_categories (slug, name, image_url)
values
  ('wedding', 'Weddings', 'https://images.unsplash.com/photo-1519741497674-611481863552'),
  ('portraits', 'Portraits', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b'),
  ('events', 'Events', 'https://images.unsplash.com/photo-1504150558240-0b4fd8946624'),
  ('fashion', 'Fashion', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b'),
  ('commercial', 'Commercial', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2'),
  ('drone', 'Drone', 'https://images.unsplash.com/photo-1473968512647-3e447244af8f')
on conflict (slug) do nothing;
