-- 1HUB GENESIS SEED DATA
-- Run this after schema.sql

-- 1. Create Mock Profiles (using placeholder UUIDs)
-- Note: In a real system, these would link to auth.users
insert into profiles (id, email, full_name, avatar_url, current_level, reputation_score, bio, major)
values 
  ('00000000-0000-0000-0000-000000000001', 'aris@1hub.legacy', 'Dr. Aris Thorne', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aris', 1, 12400, 'Philosopher of architectural biophilia and urban resonance.', 'Architecture'),
  ('00000000-0000-0000-0000-000000000002', 'elena@1hub.legacy', 'Elena Rossi', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', 2, 8900, 'Curator of digital-physical hybrid art experiences.', 'Fine Arts'),
  ('00000000-0000-0000-0000-000000000003', 'kenji@1hub.legacy', 'Kenji Sato', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji', 3, 5600, 'Architect of decentralized trust protocols and ZK-privacy.', 'Software Engineering'),
  ('00000000-0000-0000-0000-000000000004', 'sarah@1hub.legacy', 'Sarah Miller', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 2, 9200, 'Lead consultant for global ESG frameworks and sustainability.', 'ESG Strategy'),
  ('00000000-0000-0000-0000-000000000005', 'marcus@1hub.legacy', 'Marcus Vance', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', 3, 4800, 'Expert in cross-border IP law and open-innovation frameworks.', 'Legal Strategy');

-- 2. Create Projects
insert into projects (id, owner_id, title, description, thumbnail_url, industry, status)
values 
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'The Vertical Forest: Urban Biophilia', 'A landmark 40-story residential complex integrating 20,000 m² of vertical vegetation.', 'https://images.unsplash.com/photo-1518005020250-68594f2146e2?auto=format&fit=crop&q=80', 'Architecture / Sustainability', 'completed'),
  ('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000004', 'Global ESG Framework 2026', 'Comprehensive sustainability reporting standard for multinational corporations.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', 'Finance / ESG Strategy', 'completed'),
  ('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000002', 'Metabolic Sculpture: Kinetic Art', 'Interactive public installation reacting to environmental data and human presence.', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80', 'Art / Engineering', 'completed'),
  ('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000003', 'Decentralized Trust Protocol', 'Zero-knowledge proof infrastructure for high-fidelity professional verification.', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80', 'Tech / Cryptography', 'in-progress'),
  ('11111111-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000005', 'Global IP Harmony Initiative', 'Cross-border legal framework for protecting intellectual assets in open ecosystems.', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80', 'Legal / Strategy', 'completed');

-- 3. Create Project Members
insert into project_members (project_id, profile_id, role, is_verified)
values 
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'founder', true),
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000002', 'core', true),
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000003', 'rescuer', true);

-- 4. Create Case Studies
insert into case_studies (project_id, profile_id, title, content, perspective, is_public)
values 
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'The Biophilic Investment Logic', 'Redefining urban real estate value through ecological performance. This project proved that vertical greening reduces energy costs by 30% while increasing property desirability by 45%. The strategic challenge was aligning municipal zoning with biological requirements.', 'Strategic', true),
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Autonomous Irrigation Systems', 'Implemented a ZK-verified sensor network to monitor soil moisture and nutrient levels in real-time. The system utilizes greywater recycling and gravity-fed distribution to ensure 100% survival rates.', 'Technical', true);
