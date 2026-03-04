-- Campaign Builder — Initial Database Schema
-- Run this in the Supabase SQL Editor to set up all tables, RLS policies, and triggers.

-- =============================================================================
-- PROFILES
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Helper function to check admin role without triggering RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Auto-create profile on signup (works for email/password AND OAuth providers)
-- Google OAuth populates raw_user_meta_data with full_name, avatar_url, email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- CAMPAIGNS
-- =============================================================================

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'launching', 'active', 'paused', 'error')),
  objective_type text not null,
  objective_label text,
  config jsonb not null default '{}'::jsonb,
  meta_campaign_id text,
  meta_adset_id text,
  meta_ad_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  launched_at timestamptz
);

alter table public.campaigns enable row level security;

create policy "Users can read own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can insert own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

create policy "Admins can read all campaigns"
  on public.campaigns for select
  using (public.is_admin());

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.update_updated_at();

-- =============================================================================
-- CAMPAIGN LAUNCHES
-- =============================================================================

create table if not exists public.campaign_launches (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('success', 'error')),
  meta_response jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.campaign_launches enable row level security;

create policy "Users can read own launches"
  on public.campaign_launches for select
  using (auth.uid() = user_id);

create policy "Users can insert own launches"
  on public.campaign_launches for insert
  with check (auth.uid() = user_id);

create policy "Admins can read all launches"
  on public.campaign_launches for select
  using (public.is_admin());

-- =============================================================================
-- CREATIVES
-- =============================================================================

create table if not exists public.creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  prompt text,
  source text not null default 'ai' check (source in ('ai', 'upload')),
  selected boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.creatives enable row level security;

create policy "Users can read own creatives"
  on public.creatives for select
  using (auth.uid() = user_id);

create policy "Users can insert own creatives"
  on public.creatives for insert
  with check (auth.uid() = user_id);

create policy "Users can update own creatives"
  on public.creatives for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own creatives"
  on public.creatives for delete
  using (auth.uid() = user_id);

create policy "Admins can read all creatives"
  on public.creatives for select
  using (public.is_admin());

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists idx_campaigns_user_id on public.campaigns(user_id);
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaign_launches_campaign_id on public.campaign_launches(campaign_id);
create index if not exists idx_creatives_campaign_id on public.creatives(campaign_id);
create index if not exists idx_creatives_user_id on public.creatives(user_id);
