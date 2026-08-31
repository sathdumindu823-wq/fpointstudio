-- Run this once in Supabase: SQL Editor > New query > Run.
-- Replace YOUR_ADMIN_EMAIL with the email you use to log in at /admin.

create table if not exists public.homepage_content (
  id integer primary key default 1 check (id = 1),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.homepage_content enable row level security;

drop policy if exists "Anyone can read homepage content" on public.homepage_content;
create policy "Anyone can read homepage content"
on public.homepage_content for select using (true);

drop policy if exists "Only the studio admin can edit homepage content" on public.homepage_content;
create policy "Only the studio admin can edit homepage content"
on public.homepage_content for all
to authenticated
using ((select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL')
with check ((select auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL');

insert into public.homepage_content (id, content)
values (
  1,
  '{
    "heroEyebrow": "Photography · Videography · Aerial",
    "heroTitle": "Moments\\nMade Timeless",
    "heroDescription": "Professional photography, cinematic videography and aerial productions created for people, brands and unforgettable moments.",
    "heroImageUrl": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    "servicesEyebrow": "What We Do",
    "servicesTitle": "Visual storytelling\\nwith purpose.",
    "servicesDescription": "From intimate moments to commercial productions, we create visuals designed to make an impact.",
    "aboutEyebrow": "About F Point",
    "aboutTitle": "We capture\\nwhat matters.",
    "aboutParagraphOne": "F Point Studio is a photography and videography studio focused on creating timeless visual stories.",
    "aboutParagraphTwo": "From carefully planned productions to genuine candid moments, our goal is to create imagery that feels authentic, cinematic and unforgettable.",
    "aboutImageUrl": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e",
    "contactEyebrow": "Let''s Create",
    "contactTitle": "Have a project\\nin mind?",
    "contactDescription": "Tell us about your project and let''s create something unforgettable.",
    "contactEmail": "hello@fpointstudio.com",
    "contactImageUrl": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4"
  }'::jsonb
)
on conflict (id) do nothing;
