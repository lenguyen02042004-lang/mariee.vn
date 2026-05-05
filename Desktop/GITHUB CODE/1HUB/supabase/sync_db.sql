-- 1HUB DATABASE SYNC SCRIPT
-- Resets and recreates the database schema to match the repository source of truth.

-- 1. CLEANUP
drop trigger if exists tr_on_vote_cast on votes;
drop trigger if exists tr_before_vote on votes;
drop trigger if exists tr_protect_hierarchy on profiles;

drop function if exists fn_sync_user_reputation();
drop function if exists fn_prepare_vote();
drop function if exists fn_protect_profile_integrity();

drop table if exists notifications;
drop table if exists votes;
drop table if exists case_studies;
drop table if exists project_members;
drop table if exists projects;
drop table if exists profiles;

drop type if exists project_role;
drop type if exists project_status;

-- 2. APPLY SCHEMA
\i supabase/schema.sql

-- 3. APPLY SEED
\i supabase/seed_v2_real.sql
