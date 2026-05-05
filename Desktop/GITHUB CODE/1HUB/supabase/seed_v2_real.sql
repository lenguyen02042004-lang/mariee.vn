-- 1HUB PRODUCTION SEED DATA V2 (WITH AUTH)
-- This script populates the database with real-fidelity sample data for launch.

-- 1. Create Auth Users (Required for foreign key constraints)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, recovery_token, email_change_token_new, instance_id)
values 
  ('00000000-0000-0000-0000-000000000001', 'aris@1hub.pro', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000002', 'elena@1hub.pro', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000003', 'kenji@1hub.pro', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-000000000004', 'sarah@1hub.pro', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', '', '', '', '00000000-0000-0000-0000-000000000000')
on conflict (id) do nothing;

-- 2. Create Expert Profiles
insert into profiles (id, username, email, full_name, avatar_url, current_level, reputation_score, bio, major)
values 
  ('00000000-0000-0000-0000-000000000001', 'aris', 'aris@1hub.pro', 'Dr. Aris Thorne', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80', 1, 1250.5, 'Architectural philosopher and pioneer of Biophilic Urbanism. 20+ years of building breathing cities.', 'Architecture'),
  ('00000000-0000-0000-0000-000000000002', 'elena', 'elena@1hub.pro', 'Elena Rossi', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80', 2, 890.2, 'Interactive designer focusing on the resonance between digital interfaces and physical spaces.', 'Experience Design'),
  ('00000000-0000-0000-0000-000000000003', 'kenji', 'kenji@1hub.pro', 'Kenji Sato', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80', 3, 560.8, 'Protocol engineer specializing in Zero-Knowledge proofs and decentralized identity systems.', 'Software Engineering'),
  ('00000000-0000-0000-0000-000000000004', 'sarah', 'sarah@1hub.pro', 'Sarah Miller', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', 1, 1100.4, 'ESG Strategist helping Fortune 500 companies align with global sustainability heritage.', 'ESG Strategy')
on conflict (id) do update set 
  username = excluded.username,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  bio = excluded.bio,
  major = excluded.major;

-- 3. Create Heritage Projects
insert into projects (id, owner_id, title, description, thumbnail_url, industry, status)
values 
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'The Vertical Forest: Urban Biophilia', 'A landmark residential complex integrating vertical vegetation to sequester carbon and reduce heat islands.', 'https://images.unsplash.com/photo-1518005020250-68594f2146e2?auto=format&fit=crop&q=80', 'Architecture', 'completed'),
  ('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000003', 'Protocol Zero', 'Infrastructure for high-fidelity professional verification using ZK-Proofs.', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80', 'Technology', 'in-progress')
on conflict (id) do nothing;

-- 4. Create Project Members
insert into project_members (project_id, profile_id, role, is_verified)
values 
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'founder', true),
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000002', 'core', true),
  ('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000003', 'founder', true),
  ('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000004', 'core', true)
on conflict do nothing;

-- 5. Create Case Study
insert into case_studies (id, project_id, profile_id, title, content, perspective, is_public)
values 
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000001',
    'The Logic of Biophilic Investment',
    'Our primary thesis was that ecological integration is not a luxury, but a core financial performance metric. By reducing cooling loads by 30%, we created a 15% increase in annual yields for investors. The execution required a multi-disciplinary synergy between structural engineering and biological maintenance. We had to rethink the building as a living organism rather than a static shell.',
    'Strategic',
    true
  )
on conflict (id) do nothing;

-- 6. Create Votes
insert into votes (voter_id, case_study_id)
values 
  ('00000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222201')
on conflict do nothing;
