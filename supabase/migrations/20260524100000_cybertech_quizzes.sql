-- Create quizzes table
create table if not exists public.ct_quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  time_limit integer not null,
  created_at timestamptz default now()
);

-- Create questions table
create table if not exists public.ct_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.ct_quizzes(id) on delete cascade not null,
  question_text text not null,
  options text[] not null,
  correct_option integer not null,
  explanation text not null,
  created_at timestamptz default now()
);

-- Create user progress table for Google Auth cloud syncing
create table if not exists public.ct_user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  completed_quizzes jsonb default '{}'::jsonb not null,
  unlocked_lessons text[] default array[]::text[] not null,
  book_bookmarks jsonb default '{}'::jsonb not null,
  unlocked_badges text[] default array[]::text[] not null,
  student_name text,
  leaderboard_points integer default 0 not null,
  updated_at timestamptz default now()
);

-- Create leaderboard viewable rankings
create table if not exists public.ct_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  student_name text not null,
  avatar_url text,
  points integer default 0 not null,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.ct_quizzes enable row level security;
alter table public.ct_questions enable row level security;
alter table public.ct_user_progress enable row level security;
alter table public.ct_leaderboard enable row level security;

-- Drop existing policies if any
drop policy if exists "Allow public read ct_quizzes" on public.ct_quizzes;
drop policy if exists "Allow admin full access ct_quizzes" on public.ct_quizzes;
drop policy if exists "Allow public read ct_questions" on public.ct_questions;
drop policy if exists "Allow admin full access ct_questions" on public.ct_questions;
drop policy if exists "Allow users select progress" on public.ct_user_progress;
drop policy if exists "Allow users insert/update progress" on public.ct_user_progress;
drop policy if exists "Allow public read ct_leaderboard" on public.ct_leaderboard;
drop policy if exists "Allow users upsert ct_leaderboard" on public.ct_leaderboard;

-- RLS Policies for Quizzes
create policy "Allow public read ct_quizzes" on public.ct_quizzes 
  for select using (true);

create policy "Allow admin full access ct_quizzes" on public.ct_quizzes 
  for all using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- RLS Policies for Questions
create policy "Allow public read ct_questions" on public.ct_questions 
  for select using (true);

create policy "Allow admin full access ct_questions" on public.ct_questions 
  for all using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- RLS Policies for User Progress
create policy "Allow users select progress" on public.ct_user_progress 
  for select using (auth.uid() = user_id);

create policy "Allow users insert/update progress" on public.ct_user_progress 
  for all using (auth.uid() = user_id);

-- RLS Policies for Leaderboard
create policy "Allow public read ct_leaderboard" on public.ct_leaderboard 
  for select using (true);

create policy "Allow users upsert ct_leaderboard" on public.ct_leaderboard 
  for all using (auth.uid() = user_id);
