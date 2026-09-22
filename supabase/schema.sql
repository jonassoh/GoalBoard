-- Run this in the Supabase SQL editor once for the project.
-- The browser uses the publishable key; row-level security is what protects user data.

create table if not exists public.goalboard_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"version":2,"goals":[],"categories":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goalboard_data enable row level security;

create policy "Users can read their own GoalBoard data"
on public.goalboard_data for select
using ((select auth.uid()) = user_id);

create policy "Users can insert their own GoalBoard data"
on public.goalboard_data for insert
with check ((select auth.uid()) = user_id);

create policy "Users can update their own GoalBoard data"
on public.goalboard_data for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own GoalBoard data"
on public.goalboard_data for delete
using ((select auth.uid()) = user_id);

create index if not exists goalboard_data_updated_at_idx
on public.goalboard_data (updated_at desc);
