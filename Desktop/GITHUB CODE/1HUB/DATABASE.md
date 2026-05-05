# 1HUB - DATABASE SCHEMA (SQL)
**Source of Truth for Supabase/PostgreSQL**

---

## 1. EXTENSIONS & SETUP
```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type project_status as enum ('in-progress', 'completed', 'disputed');
create type project_role as enum ('founder', 'core', 'rescuer', 'contributor');
```

---

## 2. TABLES

### Profiles
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  current_level int default 7 check (current_level >= 1 and current_level <= 7),
  reputation_score float default 0,
  bio text,
  major text,
  minor text,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);
```

### Projects
```sql
create table projects (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  title text not null,
  description text,
  thumbnail_url text,
  status project_status default 'in-progress',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Projects
alter table projects enable row level security;

create policy "Projects are viewable by everyone." on projects
  for select using (true);

create policy "Authenticated users can create projects." on projects
  for insert to authenticated with check (auth.uid() = owner_id);

create policy "Owners can update their own projects." on projects
  for update using (auth.uid() = owner_id);
```

### Project Members
```sql
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

-- RLS for Project Members
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
```

### Case Studies
```sql
create table case_studies (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) not null,
  title text not null,
  content text not null,
  blocks jsonb default '[]'::jsonb,
  industry_context text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(project_id, profile_id)
);

-- RLS for Case Studies
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
```

### Votes
```sql
create table votes (
  id uuid default uuid_generate_v4() primary key,
  voter_id uuid references profiles(id) not null,
  case_study_id uuid references case_studies(id) on delete cascade not null,
  voter_level int not null, -- Captured at time of vote
  weight int not null,      -- Calculated based on voter_level
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(voter_id, case_study_id)
);

-- RLS for Votes
alter table votes enable row level security;

create policy "Votes are viewable by everyone." on votes
  for select using (true);

create policy "Authenticated users can vote." on votes
  for insert to authenticated with check (
    auth.uid() = voter_id and
    exists (
      select 1 from profiles
      where id = auth.uid() and current_level <= 3
    )
  );

---

### Notifications
```sql
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  sender_id uuid references profiles(id),
  type text not null, -- 'synergy_proposal', 'vote', 'handshake_accepted'
  title text not null,
  message text,
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
```

### Synergy Handshakes
```sql
create type handshake_status as enum ('pending', 'accepted', 'declined');

create table synergy_handshakes (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) not null,
  receiver_id uuid references profiles(id) not null,
  message text,
  status handshake_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table synergy_handshakes enable row level security;

create policy "Users can see handshakes they are involved in." on synergy_handshakes
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can initiate handshakes." on synergy_handshakes
  for insert to authenticated with check (auth.uid() = sender_id);

create policy "Receivers can respond to handshakes." on synergy_handshakes
  for update using (auth.uid() = receiver_id);
```

```

---

## 3. INDEXES (Performance & RLS)
```sql
create index idx_profiles_current_level on profiles(current_level);
create index idx_projects_owner_id on projects(owner_id);
create index idx_project_members_project_id on project_members(project_id);
create index idx_project_members_profile_id on project_members(profile_id);
create index idx_case_studies_project_id on case_studies(project_id);
create index idx_case_studies_profile_id on case_studies(profile_id);
create index idx_votes_case_study_id on votes(case_study_id);
create index idx_votes_voter_id on votes(voter_id);

---

## 4. AUTOMATION & TRIGGERS

### Automatic Reputation Sync
This trigger ensures that every time a new vote is cast, the recipient's score and level are recalculated.
*Note: For production efficiency, this uses a dedicated function.*

```sql
create or replace function fn_sync_user_reputation()
returns trigger as $$
declare
  v_profile_id uuid;
  v_new_score float;
  v_new_level int;
begin
  -- 1. Identify the profile being voted on
  select profile_id into v_profile_id 
  from case_studies 
  where id = new.case_study_id;

  -- 2. Calculate sum(V * W * M)
  -- Weight W = 11 - voter_level
  -- Multiplier M = 2 for rescuers, 1 for others
  select coalesce(sum(1 * (11 - v.voter_level) * (case when pm.role = 'rescuer' then 2 else 1 end)), 0)
  into v_new_score
  from votes v
  join case_studies cs on v.case_study_id = cs.id
  join project_members pm on (cs.project_id = pm.project_id and cs.profile_id = pm.profile_id)
  where cs.profile_id = v_profile_id;

  -- 3. Apply Consistency Multiplier (C)
  -- C = 1.2 if unique project count > 3
  if (select count(distinct project_id) from case_studies where profile_id = v_profile_id) > 3 then
    v_new_score := v_new_score * 1.2;
  end if;

  -- 4. Determine Level
  if v_new_score >= 1000 then v_new_level := 1;
  elsif v_new_score >= 500 then v_new_level := 2;
  elsif v_new_score >= 250 then v_new_level := 3;
  elsif v_new_score >= 100 then v_new_level := 4;
  elsif v_new_score >= 50 then v_new_level := 5;
  elsif v_new_score >= 10 then v_new_level := 6;
  else v_new_level := 7;
  end if;

  -- 5. Update Profile
  update profiles 
  set 
    reputation_score = v_new_score,
    current_level = v_new_level,
    updated_at = now()
  where id = v_profile_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger tr_on_vote_cast
after insert on votes
for each row execute function fn_sync_user_reputation();
```
```
