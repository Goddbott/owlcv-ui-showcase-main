-- Create a table for resumes
create table public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.resumes enable row level security;

create policy "Users can view their own resumes"
  on public.resumes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own resumes"
  on public.resumes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own resumes"
  on public.resumes for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own resumes"
  on public.resumes for delete
  using ( auth.uid() = user_id );
