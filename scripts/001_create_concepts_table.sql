-- Create concepts table for tracking micro concepts
create table if not exists public.concepts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid not null references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.concepts enable row level security;

-- Create RLS policies
create policy "concepts_select_own"
  on public.concepts for select
  using (auth.uid() = user_id);

create policy "concepts_insert_own"
  on public.concepts for insert
  with check (auth.uid() = user_id);

create policy "concepts_update_own"
  on public.concepts for update
  using (auth.uid() = user_id);

create policy "concepts_delete_own"
  on public.concepts for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists concepts_user_id_idx on public.concepts(user_id);
create index if not exists concepts_status_idx on public.concepts(status);
create index if not exists concepts_created_at_idx on public.concepts(created_at desc);
