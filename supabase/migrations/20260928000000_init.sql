-- FinalStudio MVP schema: subjects (notebooks) -> uploads -> exercises ->
-- storyboards -> render jobs -> videos. Every row belongs to one student.

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade default auth.uid(),
  name text not null,
  teacher text,
  level text not null default 'prepa',          -- prepa | universidad
  language text not null default 'es-MX',
  exam_date date,
  -- what the subject remembers: teacher's notation, steps asked again, etc.
  memory jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade default auth.uid(),
  subject_id uuid not null references public.subjects on delete cascade,
  storage_path text not null,                   -- bucket "uploads"
  filename text not null,
  mime text not null,
  status text not null default 'pending' check (status in ('pending', 'reading', 'read', 'failed')),
  summary jsonb,                                -- topics and exercises found
  created_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade default auth.uid(),
  subject_id uuid not null references public.subjects on delete cascade,
  upload_id uuid references public.uploads on delete set null,
  topic text,
  statement text not null,                      -- as the student wrote it
  workflow text not null default 'solve-step',
  created_at timestamptz not null default now()
);

create table public.storyboards (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade default auth.uid(),
  exercise_id uuid not null references public.exercises on delete cascade,
  version int not null default 1,
  doc jsonb not null,                           -- storyboard v2 (packages/core/src/storyboard.ts)
  verified boolean not null default false,
  settings jsonb not null default '{}'::jsonb,  -- voice, captions, music, character
  created_at timestamptz not null default now()
);

create table public.render_jobs (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade default auth.uid(),
  storyboard_id uuid not null references public.storyboards on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'voice', 'building', 'rendering', 'done', 'failed')),
  progress real not null default 0,
  error text,
  attempts int not null default 0,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index render_jobs_queue on public.render_jobs (created_at) where status = 'queued';

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade default auth.uid(),
  storyboard_id uuid not null references public.storyboards on delete cascade,
  job_id uuid references public.render_jobs on delete set null,
  storage_path text not null,                   -- bucket "videos"
  duration real not null,
  chapters jsonb not null,                      -- [{label, start, end}]
  voice_provider text not null,
  created_at timestamptz not null default now()
);

-- Row level security: students only see their own rows.
do $$
declare t text;
begin
  foreach t in array array['subjects', 'uploads', 'exercises', 'storyboards', 'render_jobs', 'videos'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows" on public.%I for all using (owner = (select auth.uid())) with check (owner = (select auth.uid()))', t);
  end loop;
end $$;

-- The render worker (service role) claims one job at a time.
create or replace function public.claim_render_job()
returns public.render_jobs
language sql
security definer
set search_path = ''
as $$
  update public.render_jobs j
     set status = 'voice', locked_at = now(), attempts = j.attempts + 1, updated_at = now()
   where j.id = (
     select id from public.render_jobs
      where status = 'queued'
      order by created_at
      for update skip locked
      limit 1)
  returning j.*;
$$;
revoke execute on function public.claim_render_job() from public, anon, authenticated;

alter publication supabase_realtime add table public.render_jobs;

insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false), ('videos', 'videos', false)
on conflict (id) do nothing;

create policy "own files" on storage.objects for all
  using (bucket_id in ('uploads', 'videos') and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id in ('uploads', 'videos') and (storage.foldername(name))[1] = (select auth.uid())::text);
