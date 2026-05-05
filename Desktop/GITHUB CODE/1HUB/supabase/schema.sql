-- 1HUB - DATABASE SCHEMA (SQL)
-- Source of Truth for Supabase/PostgreSQL

-- 1. EXTENSIONS & SETUP
create extension if not exists "uuid-ossp";

-- Create custom types
create type project_status as enum ('in-progress', 'completed', 'disputed');
create type project_role as enum ('founder', 'core', 'rescuer', 'contributor');

-- 2. TABLES

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  email text unique not null,
  full_name text,
  avatar_url text,
  current_level int default 7 check (current_level >= 1 and current_level <= 7),
  reputation_score float default 0,
  bio text,
  major text,
  minor text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own basic info." on profiles
  for update using (auth.uid() = id)
  with check (
    -- Prevent users from manually elevating their level or score
    (auth.uid() = id)
  );

-- 4. SECURITY TRIGGERS (PROTECTING THE HIERARCHY)
create or replace function fn_protect_profile_integrity()
returns trigger as $$
begin
  -- Prevent manual level/reputation updates
  if (new.current_level <> old.current_level) or (new.reputation_score <> old.reputation_score) then
    -- Only allow the system (via security definer functions) to change these
    -- If the current user is not a service role or the update isn't from our sync function
    if current_setting('role') <> 'service_role' then
      new.current_level := old.current_level;
      new.reputation_score := old.reputation_score;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_protect_hierarchy
before update on profiles
for each row execute function fn_protect_profile_integrity();

-- Projects
create table projects (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  title text not null,
  description text,
  thumbnail_url text,
  industry text,
  status project_status default 'in-progress',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table projects enable row level security;

create policy "Projects are viewable by everyone." on projects
  for select using (true);

create policy "Authenticated users can create projects." on projects
  for insert to authenticated with check (auth.uid() = owner_id);

create policy "Owners can update their own projects." on projects
  for update using (auth.uid() = owner_id);

-- Project Members
create table project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  role project_role default 'core',
  is_verified boolean default false,
  contribution_timeline jsonb, -- Stores milestones/dates
  dispute_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(project_id, profile_id)
);

alter table project_members enable row level security;

create policy "Members are viewable by everyone." on project_members
  for select using (true);

create policy "Owners can manage members." on project_members
  for all using (
    exists (
      select 1 from projects 
      where projects.id = project_id and projects.owner_id = auth.uid()
    )
  );

create policy "Users can update their own member status/notes." on project_members
  for update using (auth.uid() = profile_id);

-- Case Studies
create table case_studies (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  title text,
  content text not null check (length(content) >= 300),
  perspective text, -- Strategic, Technical, Aesthetic
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(project_id, profile_id, perspective)
);

alter table case_studies enable row level security;

create policy "Public case studies are viewable by everyone." on case_studies
  for select using (is_public = true);

create policy "Members can view their own private case studies." on case_studies
  for select using (auth.uid() = profile_id);

create policy "Verified members can create case studies." on case_studies
  for insert with check (
    exists (
      select 1 from project_members 
      where project_members.project_id = project_id 
      and project_members.profile_id = auth.uid()
      and project_members.is_verified = true
    )
  );

-- Votes
create table votes (
  id uuid default uuid_generate_v4() primary key,
  voter_id uuid references profiles(id) not null,
  case_study_id uuid references case_studies(id) on delete cascade not null,
  voter_level int, -- Populated via trigger
  weight int,      -- Populated via trigger
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(voter_id, case_study_id)
);

alter table votes enable row level security;

create policy "Votes are viewable by everyone." on votes
  for select using (true);

create policy "Authenticated users can vote." on votes
  for insert to authenticated with check (auth.uid() = voter_id);

-- 3. INDEXES
create index idx_profiles_current_level on profiles(current_level);
create index idx_projects_owner_id on projects(owner_id);
create index idx_project_members_project_id on project_members(project_id);
create index idx_project_members_profile_id on project_members(profile_id);
create index idx_case_studies_project_id on case_studies(project_id);
create index idx_case_studies_profile_id on case_studies(profile_id);
create index idx_votes_case_study_id on votes(case_study_id);
create index idx_votes_voter_id on votes(voter_id);

-- 4. AUTOMATION & TRIGGERS

-- 4. AUTOMATION & TRIGGERS

create or replace function fn_prepare_vote()
returns trigger as $$
declare
  v_level int;
begin
  -- Force the voter_id to be the authenticated user
  -- Set voter_id from auth.uid() if it exists (interactive use)
  -- Otherwise keep the provided voter_id (seeding/admin use)
  if auth.uid() is not null then
    new.voter_id := auth.uid();
  end if;
  
  -- Fetch the actual level of the voter
  select current_level into v_level from profiles where id = new.voter_id;
  
  new.voter_level := v_level;
  -- Calculate weight: L1=10, L2=5, L3=3, L4=2, others=1
  new.weight := case 
    when v_level = 1 then 10
    when v_level = 2 then 5
    when v_level = 3 then 3
    when v_level = 4 then 2
    else 1
  end;
  
  return new;
end;
$$ language plpgsql security definer;

create or replace function fn_sync_user_reputation()
returns trigger as $$
declare
  v_profile_id uuid;
  v_new_score float;
  v_new_level int;
begin
  select profile_id into v_profile_id 
  from case_studies 
  where id = new.case_study_id;

  -- Re-calculate reputation based on all votes
  -- Formula: Sum of (voter_weight * role_multiplier)
  select coalesce(sum(v.weight * (case when pm.role = 'rescuer' then 2 else 1 end)), 0)
  into v_new_score
  from votes v
  join case_studies cs on v.case_study_id = cs.id
  join project_members pm on (cs.project_id = pm.project_id and cs.profile_id = pm.profile_id)
  where cs.profile_id = v_profile_id;

  -- Multidisciplinary Bonus (if user has > 3 projects in different industries)
  if (select count(distinct project_id) from case_studies where profile_id = v_profile_id) > 3 then
    v_new_score := v_new_score * 1.2;
  end if;

  -- Level Assignment
  if v_new_score >= 1000 then v_new_level := 1;
  elsif v_new_score >= 500 then v_new_level := 2;
  elsif v_new_score >= 250 then v_new_level := 3;
  elsif v_new_score >= 100 then v_new_level := 4;
  elsif v_new_score >= 50 then v_new_level := 5;
  elsif v_new_score >= 10 then v_new_level := 6;
  else v_new_level := 7;
  end if;

  update profiles 
  set 
    reputation_score = v_new_score,
    current_level = v_new_level,
    updated_at = now()
  where id = v_profile_id;

  return new;
end;
$$ language plpgsql security definer;

-- Notifications
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  type text not null, -- synergy_proposal, heritage_endorsement, etc.
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notifications enable row level security;

create policy "Users can view their own notifications." on notifications
  for select using (auth.uid() = profile_id);

create policy "System/Users can insert notifications." on notifications
  for insert with check (true);

create policy "Users can update their own notifications (mark as read)." on notifications
  for update using (auth.uid() = profile_id);

create trigger tr_before_vote
before insert on votes
for each row execute function fn_prepare_vote();

create trigger tr_on_vote_cast
after insert on votes
for each row execute function fn_sync_user_reputation();
