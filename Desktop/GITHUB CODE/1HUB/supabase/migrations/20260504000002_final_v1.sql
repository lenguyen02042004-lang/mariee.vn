-- FINAL ARCHITECTURAL OVERRIDE: THE COMPLETE HERITAGE
-- This migration populates the 20 projects for the Genesis Seed across 5 non-tech industries.

-- Profiles (Expanded for team diversity)
insert into profiles (id, name, major, level, reputation, bio) values
  ('7b8a1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'Dr. Julian Vane', 'Neuro-Ethical Science', 1, 15400, 'Defining the boundary between self and machine.'),
  ('8b9c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e', 'Isabella Montez', 'High-End Couture', 2, 9800, 'Garments that breathe and evolve.'),
  ('9c0d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f', 'Victor Rothschild', 'Generational Finance', 1, 22000, 'Securing wealth for the next century.'),
  ('0d1e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a', 'Luciano Verdi', 'Classical Composition', 1, 18200, 'The digital resonance of the opera.'),
  ('1e2f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b', 'Gaia Sterling', 'Regenerative Ecology', 1, 14500, 'Securing the future of biodiversity.'),
  ('2f3a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c', 'Justice Reed', 'International Arbitration', 1, 19800, 'Absolute equity through logic.');

-- Projects (20 Heritage Projects)
insert into projects (id, title, description, industry, tags, duration, impact_points, status) values
  ('vertical-forest', 'The Vertical Forest: Urban Biophilia', 'Khung kiến trúc đột phá tích hợp hệ sinh thái sống vào các cấu trúc đô thị.', 'Architecture / Sustainability', ARRAY['Biophilic Design', 'Urban Ecology'], 36, '12400', 'completed'),
  ('esg-framework', 'Global ESG Framework 2026', 'Tiêu chuẩn báo cáo bền vững toàn diện cho tập đoàn đa quốc gia.', 'Finance / ESG Strategy', ARRAY['Carbon Accounting', 'Corporate Governance'], 24, '18500', 'completed'),
  ('metabolic-sculpture', 'Metabolic Sculpture: Kinetic Art', 'Công trình nghệ thuật công cộng phản ứng với dữ liệu môi trường.', 'Art / Engineering', ARRAY['Kinetic Art', 'Robotics'], 18, '8900', 'completed'),
  ('ip-harmony', 'Global IP Harmony Initiative', 'Khuôn khổ pháp lý bảo vệ tài sản trí tuệ trong đổi mới mở.', 'Legal / Strategy', ARRAY['IP Law', 'Governance'], 12, '10500', 'completed'),
  ('neuro-ethics', 'Neuro-Ethics Protocol 2027', 'Khuôn khổ đạo đức cho giao diện não-máy tính.', 'Science / Biotech', ARRAY['Neuroscience', 'Ethics'], 48, '31000', 'ongoing'),
  ('couture-legacy', 'Couture Legacy: Digital Fabric', 'Thời trang cao cấp kết hợp vật liệu thông minh.', 'Fashion / Art', ARRAY['Smart Materials', 'Digital Twin'], 24, '15200', 'completed'),
  ('lunar-arch', 'Lunar Architecture: Alpha Base', 'Thiết kế khu định cư bền vững trên Mặt Trăng.', 'Architecture / Science', ARRAY['Space Habitat', '3D Printing'], 72, '45000', 'ongoing'),
  ('wealth-sanctuary', 'Wealth Sanctuary: Generational Asset Protocol', 'Mô hình bảo tồn tài sản xuyên thế hệ.', 'Finance / Law', ARRAY['Wealth', 'Legacy'], 36, '28000', 'completed'),
  ('bio-resonance', 'Bio-Resonance: Regenerative Lab', 'Nghiên cứu trẻ hóa tế bào và y học tái tạo.', 'Science / Medicine', ARRAY['Regenerative Medicine', 'Cellular Biology'], 60, '38500', 'completed'),
  ('opera-digitalis', 'Opera Digitalis: Immersive Heritage', 'Tái định nghĩa trải nghiệm Opera qua thực tế hỗn hợp.', 'Art / Tech', ARRAY['Opera', 'Mixed Reality'], 18, '11200', 'completed'),
  ('quantum-finance', 'Quantum Risk Framework', 'Dự báo rủi ro tài chính sử dụng thuật toán lượng tử.', 'Finance / Tech', ARRAY['Quantum Computing', 'Risk'], 24, '24000', 'ongoing'),
  ('agri-heritage', 'Agri-Heritage: Seed Sanctuary', 'Bảo tồn hạt giống di sản và đa dạng sinh học.', 'Environment / Science', ARRAY['Biodiversity', 'Heritage Seeds'], 120, '52000', 'ongoing'),
  ('ocean-ark', 'The Ocean Ark: Floating Research', 'Thành phố nghiên cứu nổi tự cung tự cấp.', 'Architecture / Environment', ARRAY['Floating City', 'Renewable Energy'], 48, '36000', 'ongoing'),
  ('lex-aeterna', 'Lex Aeterna: AI-Mediated Law', 'Hệ thống phân xử tranh chấp tự động thương mại quốc tế.', 'Law / Tech', ARRAY['Smart Contracts', 'Arbitration'], 30, '19500', 'completed'),
  ('pure-light', 'Pure Light: Solar Glass', 'Vật liệu kính trong suốt hấp thụ năng lượng mặt trời.', 'Science / Engineering', ARRAY['Solar Energy', 'Material Science'], 36, '21000', 'completed'),
  ('botanical-ai', 'Botanical AI: Forest Guardian', 'Giám sát sức khỏe rừng nhiệt đới thời gian thực.', 'Science / Environment', ARRAY['Conservation', 'Deep Learning'], 24, '17800', 'ongoing'),
  ('ethereal-silk', 'Ethereal Silk: Bio-Couture', 'Sợi tơ từ protein nhện kết hợp dệt cổ truyền.', 'Fashion / Science', ARRAY['Spider Silk', 'Textile Engineering'], 30, '14500', 'completed'),
  ('global-trust-node', 'Global Trust Node: Master Identity', 'Định danh kỹ thuật số tối thượng cho chuyên gia.', 'Tech / Law', ARRAY['Digital Identity', 'Trust'], 48, '33000', 'ongoing'),
  ('mars-colony-ethics', 'Mars Colony: Social Charter', 'Hiến chương xã hội và hiến pháp cho định cư sao Hỏa.', 'Law / Science', ARRAY['Space Law', 'Ethics'], 60, '41000', 'ongoing'),
  ('resonance-frequency', 'Resonance: Sonic Architecture', 'Thiết kế không gian âm thanh đô thị giảm căng thẳng.', 'Architecture / Science', ARRAY['Psycho-Acoustics', 'Wellness'], 24, '16500', 'completed');

-- Project Members (Establishing Synergy)
insert into project_members (project_id, profile_id, role, impact_score) values
  ('vertical-forest', '69e25537-8e6c-482f-8703-a1789d6e492f', 'founder', 98),
  ('vertical-forest', '7b8a1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'core', 92),
  ('neuro-ethics', '7b8a1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'founder', 99),
  ('neuro-ethics', '2f3a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c', 'core', 94),
  ('wealth-sanctuary', '9c0d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f', 'founder', 98),
  ('wealth-sanctuary', '2f3a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c', 'core', 91),
  ('couture-legacy', '8b9c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e', 'founder', 96),
  ('couture-legacy', '69e25537-8e6c-482f-8703-a1789d6e492f', 'rescuer', 90);
