export type MemberRole = 'founder' | 'core' | 'rescuer' | 'contributor';

export interface MemberContribution {
  id: string;
  name: string;
  role: MemberRole;
  level: number;
  impactScore: number;
  startMonth: number;
  endMonth: number;
}

export interface CaseStudy {
  title: string;
  content: string;
}

export interface ProjectHeritage {
  id: string;
  title: string;
  description: string;
  industry: string;
  tags: string[];
  duration: number;
  impactPoints: string;
  status: 'completed' | 'ongoing';
  members: MemberContribution[];
  caseStudies: CaseStudy[];
}

export const SEED_PROJECTS: Record<string, ProjectHeritage> = {
  'vertical-forest': {
    id: 'vertical-forest',
    title: "The Vertical Forest: Urban Biophilia",
    description: "Khung kiến trúc đột phá tích hợp hệ sinh thái sống vào các cấu trúc đô thị mật độ cao. Dự án này thiết lập tiêu chuẩn toàn cầu cho các tòa nhà chọc trời âm carbon.",
    industry: "Architecture / Sustainability",
    tags: ['Biophilic Design', 'Carbon-Negative', 'Urban Ecology', 'Structural Bio-Engineering'],
    duration: 36,
    impactPoints: "12,400",
    status: 'completed',
    members: [
      { id: '1', name: 'Dr. Aris Thorne', role: 'founder', level: 1, impactScore: 98, startMonth: 0, endMonth: 36 },
      { id: '2', name: 'Elena Rossi', role: 'core', level: 2, impactScore: 88, startMonth: 2, endMonth: 36 },
      { id: '3', name: 'Kenji Sato', role: 'rescuer', level: 3, impactScore: 92, startMonth: 24, endMonth: 36 },
    ],
    caseStudies: [
      { title: 'Technical Logic', content: 'Integrating hydroponic vertical systems into load-bearing steel structures without compromising seismic stability. We utilized a patented bio-polymer for nutrient delivery.' },
      { title: 'Aesthetic Vision', content: 'The goal was to create a "Living Skin" that changes colors with the seasons, mimicking the natural lifecycle of a temperate forest.' },
      { title: 'Strategic Impact', content: 'Reducing urban heat island effect by 4.2 degrees Celsius and improving air quality for 12,000 residents within a 2km radius.' }
    ]
  },
  'esg-framework': {
    id: 'esg-framework',
    title: "Global ESG Framework 2026",
    description: "Một tiêu chuẩn báo cáo bền vững toàn diện được áp dụng bởi hơn 40 tập đoàn đa quốc gia để kiểm toán carbon minh bạch.",
    industry: "Finance / ESG Strategy",
    tags: ['Sustainability', 'Carbon Accounting', 'Corporate Governance', 'Big Data'],
    duration: 24,
    impactPoints: "18,500",
    status: 'completed',
    members: [
      { id: '4', name: 'Sarah Miller', role: 'founder', level: 2, impactScore: 95, startMonth: 0, endMonth: 24 },
      { id: '1', name: 'Dr. Aris Thorne', role: 'core', level: 1, impactScore: 85, startMonth: 6, endMonth: 24 },
      { id: '5', name: 'Marcus Vance', role: 'rescuer', level: 3, impactScore: 90, startMonth: 12, endMonth: 18 }
    ],
    caseStudies: [
      { title: 'Strategic Logic', content: 'Developed the mathematical model for absolute carbon decoupling. The framework provides a verified pathway for corporations to scale revenue while maintaining a science-based emissions reduction trajectory.' },
      { title: 'Technical Execution', content: 'Every emission data point is signed and hashed on a private ledger, ensuring auditability and preventing greenwashing.' }
    ]
  },
  'metabolic-sculpture': {
    id: 'metabolic-sculpture',
    title: "Metabolic Sculpture: Kinetic Art",
    description: "Một công trình nghệ thuật công cộng tương tác mô phỏng các quy trình sinh học, phản ứng với dữ liệu môi trường cục bộ và sự hiện diện của con người.",
    industry: "Art / Engineering",
    tags: ['Kinetic Art', 'Environmental Data', 'Public Installation', 'Robotics'],
    duration: 18,
    impactPoints: "8,900",
    status: 'completed',
    members: [
      { id: '2', name: 'Elena Rossi', role: 'founder', level: 2, impactScore: 92, startMonth: 0, endMonth: 18 },
      { id: '6', name: 'Kenji Sato', role: 'core', level: 3, impactScore: 88, startMonth: 2, endMonth: 16 },
      { id: '5', name: 'Marcus Vance', role: 'contributor', level: 4, impactScore: 75, startMonth: 8, endMonth: 12 }
    ],
    caseStudies: [
      { title: 'Aesthetic Vision', content: 'Visualizing the invisible. The sculpture\'s movement is driven by local air quality and sound levels, creating a meditative feedback loop between the city and the installation.' },
      { title: 'Technical Execution', content: 'Designed a series of custom pneumatic actuators that replicate soft-tissue movement. The system is powered by solar energy.' }
    ]
  },
  'ip-harmony': {
    id: 'ip-harmony',
    title: "Global IP Harmony Initiative",
    description: "Một khuôn khổ pháp lý xuyên biên giới để bảo vệ tài sản trí tuệ trong các dự án hợp tác phi tập trung và hệ sinh thái đổi mới mở.",
    industry: "Legal / Strategy",
    tags: ['IP Law', 'Open Innovation', 'Legal Framework', 'Global Governance'],
    duration: 12,
    impactPoints: "10,500",
    status: 'completed',
    members: [
      { id: '5', name: 'Marcus Vance', role: 'founder', level: 3, impactScore: 94, startMonth: 0, endMonth: 12 },
      { id: '4', name: 'Sarah Miller', role: 'core', level: 2, impactScore: 82, startMonth: 2, endMonth: 10 },
      { id: '2', name: 'Elena Rossi', role: 'contributor', level: 2, impactScore: 78, startMonth: 4, endMonth: 8 }
    ],
    caseStudies: [
      { title: 'Strategic Logic', content: 'Defining legal boundaries for "Partial Visibility" assets. Establishing a template for "Execution-Only Disclosure".' }
    ]
  },
  'neuro-ethics': {
    id: 'neuro-ethics',
    title: "Neuro-Ethics Protocol 2027",
    description: "Khuôn khổ đạo đức toàn cầu cho việc tích hợp giao diện não-máy tính, đảm bảo quyền riêng tư của nhận thức.",
    industry: "Science / Biotech",
    tags: ['Neuroscience', 'Ethics', 'Bio-Tech', 'Human Rights'],
    duration: 48,
    impactPoints: "31,000",
    status: 'ongoing',
    members: [
      { id: '7', name: 'Dr. Julian Vane', role: 'founder', level: 1, impactScore: 99, startMonth: 0, endMonth: 48 },
      { id: '5', name: 'Marcus Vance', role: 'core', level: 3, impactScore: 89, startMonth: 12, endMonth: 48 },
      { id: '1', name: 'Dr. Aris Thorne', role: 'rescuer', level: 1, impactScore: 92, startMonth: 24, endMonth: 36 }
    ],
    caseStudies: [
      { title: 'Philosophical Logic', content: 'Defining the boundary between self and machine. We established the "Cognitive Sanctuary" principle, legally protecting mental data from unauthorized commercialization.' },
      { title: 'Technical Guardrails', content: 'Developed the ZK-Privacy layer for neural signal encryption, preventing any third-party access to raw synaptic patterns.' }
    ]
  },
  'couture-legacy': {
    id: 'couture-legacy',
    title: "Couture Legacy: Digital Fabric",
    description: "Sự giao thoa giữa thời trang cao cấp và vật liệu thông minh, tạo ra những bộ trang phục di sản có thể tự sửa chữa và thích ứng với môi trường.",
    industry: "Fashion / Art",
    tags: ['High-End Fashion', 'Smart Materials', 'Digital Twin', 'Sustainability'],
    duration: 24,
    impactPoints: "15,200",
    status: 'completed',
    members: [
      { id: '8', name: 'Isabella Montez', role: 'founder', level: 2, impactScore: 96, startMonth: 0, endMonth: 24 },
      { id: '2', name: 'Elena Rossi', role: 'core', level: 2, impactScore: 91, startMonth: 4, endMonth: 24 },
      { id: '6', name: 'Kenji Sato', role: 'rescuer', level: 3, impactScore: 88, startMonth: 18, endMonth: 24 }
    ],
    caseStudies: [
      { title: 'Design Vision', content: 'Creating garments that breathe and evolve. We utilized lab-grown silk infused with graphene for structural memory, allowing the garment to retain its shape for decades.' },
      { title: 'Heritage Persistence', content: 'Each piece contains a nested RFID silk thread that records the garment\'s history, including every event it was worn and every repair made.' }
    ]
  },
  'lunar-arch': {
    id: 'lunar-arch',
    title: "Lunar Architecture: Alpha Base",
    description: "Thiết kế khu định cư bền vững trên Mặt Trăng sử dụng in 3D bằng bụi regolith và cấu trúc bơm hơi áp suất cao.",
    industry: "Architecture / Science",
    tags: ['Space Habitat', 'Additive Manufacturing', 'Extreme Environment', 'Structural Design'],
    duration: 72,
    impactPoints: "45,000",
    status: 'ongoing',
    members: [
      { id: '1', name: 'Dr. Aris Thorne', role: 'founder', level: 1, impactScore: 97, startMonth: 0, endMonth: 72 },
      { id: '6', name: 'Kenji Sato', role: 'core', level: 3, impactScore: 93, startMonth: 12, endMonth: 60 },
      { id: '4', name: 'Sarah Miller', role: 'rescuer', level: 2, impactScore: 86, startMonth: 36, endMonth: 48 }
    ],
    caseStudies: [
      { title: 'Structural Logic', content: 'Designing for 1/6th gravity while maintaining atmospheric integrity. We pioneered the "Regolith Sintering" technique for on-site radiation shielding.' }
    ]
  },
  'wealth-sanctuary': {
    id: 'wealth-sanctuary',
    title: "Wealth Sanctuary: Generational Asset Protocol",
    description: "Mô hình bảo tồn tài sản xuyên thế hệ dành cho các gia đình di sản, tích hợp luật pháp và quản lý tài chính bền vững.",
    industry: "Finance / Law",
    tags: ['Generational Wealth', 'Asset Preservation', 'Trust Law', 'Global Finance'],
    duration: 36,
    impactPoints: "28,000",
    status: 'completed',
    members: [
      { id: '9', name: 'Victor Rothschild', role: 'founder', level: 1, impactScore: 98, startMonth: 0, endMonth: 36 },
      { id: '5', name: 'Marcus Vance', role: 'core', level: 3, impactScore: 92, startMonth: 6, endMonth: 36 },
      { id: '4', name: 'Sarah Miller', role: 'rescuer', level: 2, impactScore: 89, startMonth: 12, endMonth: 24 }
    ],
    caseStudies: [
      { title: 'Strategic Impact', content: 'Creating a financial "time-capsule" that is immune to inflationary cycles and local geopolitical instability through multi-jurisdictional redundancy.' }
    ]
  },
  'bio-resonance': {
    id: 'bio-resonance',
    title: "Bio-Resonance: Regenerative Lab",
    description: "Trung tâm nghiên cứu y sinh cao cấp tập trung vào công nghệ trẻ hóa tế bào và y học tái tạo.",
    industry: "Science / Medicine",
    tags: ['Regenerative Medicine', 'Cellular Biology', 'Life Extension', 'Lab Design'],
    duration: 60,
    impactPoints: "38,500",
    status: 'completed',
    members: [
      { id: '7', name: 'Dr. Julian Vane', role: 'founder', level: 1, impactScore: 99, startMonth: 0, endMonth: 60 },
      { id: '1', name: 'Dr. Aris Thorne', role: 'core', level: 1, impactScore: 94, startMonth: 12, endMonth: 60 },
      { id: '8', name: 'Isabella Montez', role: 'rescuer', level: 2, impactScore: 87, startMonth: 24, endMonth: 48 }
    ],
    caseStudies: [
      { title: 'Technical Logic', content: 'Developed the "Bio-Harmonic" laboratory environment where air quality, sound frequency, and light spectrum are optimized for stem cell proliferation.' }
    ]
  },
  'opera-digitalis': {
    id: 'opera-digitalis',
    title: "Opera Digitalis: Immersive Heritage",
    description: "Tái định nghĩa trải nghiệm Opera thông qua thực tế hỗn hợp, kết nối âm thanh cổ điển với hình ảnh kỹ thuật số thế hệ mới.",
    industry: "Art / Tech",
    tags: ['Opera', 'Mixed Reality', 'Immersive Art', 'Sound Engineering'],
    duration: 18,
    impactPoints: "11,200",
    status: 'completed',
    members: [
      { id: '2', name: 'Elena Rossi', role: 'founder', level: 2, impactScore: 93, startMonth: 0, endMonth: 18 },
      { id: '10', name: 'Luciano Verdi', role: 'core', level: 1, impactScore: 98, startMonth: 2, endMonth: 18 },
      { id: '6', name: 'Kenji Sato', role: 'rescuer', level: 3, impactScore: 90, startMonth: 10, endMonth: 18 }
    ],
    caseStudies: [
      { title: 'Aesthetic Vision', content: 'Visualizing the human voice. Each note sung by the soprano generates real-time particle simulations that envelop the audience in a digital aurora.' }
    ]
  },
  'quantum-finance': {
    id: 'quantum-finance',
    title: "Quantum Risk Framework",
    description: "Mô hình dự báo rủi ro tài chính sử dụng thuật toán lượng tử để tối ưu hóa danh mục đầu tư quốc gia.",
    industry: "Finance / Tech",
    tags: ['Quantum Computing', 'Risk Management', 'Global Finance', 'Macro-Economics'],
    duration: 24,
    impactPoints: "24,000",
    status: 'ongoing',
    members: [
      { id: '4', name: 'Sarah Miller', role: 'founder', level: 2, impactScore: 95, startMonth: 0, endMonth: 24 },
      { id: '6', name: 'Kenji Sato', role: 'core', level: 3, impactScore: 92, startMonth: 4, endMonth: 24 },
      { id: '9', name: 'Victor Rothschild', role: 'rescuer', level: 1, impactScore: 91, startMonth: 12, endMonth: 24 }
    ],
    caseStudies: [
      { title: 'Strategic Logic', content: 'Achieving "Zero-Lag" market response. The model allows central banks to simulate 100 years of market volatility in under 3 minutes.' }
    ]
  },
  'agri-heritage': {
    id: 'agri-heritage',
    title: "Agri-Heritage: Seed Sanctuary",
    description: "Kho lưu trữ hạt giống di sản và bảo tồn đa dạng sinh học thông qua canh tác tái tạo cao cấp.",
    industry: "Environment / Science",
    tags: ['Biodiversity', 'Heritage Seeds', 'Regenerative Agriculture', 'Food Security'],
    duration: 120,
    impactPoints: "52,000",
    status: 'ongoing',
    members: [
      { id: '11', name: 'Gaia Sterling', role: 'founder', level: 1, impactScore: 99, startMonth: 0, endMonth: 120 },
      { id: '1', name: 'Dr. Aris Thorne', role: 'core', level: 1, impactScore: 92, startMonth: 12, endMonth: 120 },
      { id: '5', name: 'Marcus Vance', role: 'rescuer', level: 3, impactScore: 85, startMonth: 24, endMonth: 48 }
    ],
    caseStudies: [
      { title: 'Impact Strategy', content: 'Securing the future of food. We have indexed over 4,000 extinct-in-the-wild species, ensuring their genetic heritage is preserved for a carbon-neutral future.' }
    ]
  },
  'ocean-ark': {
    id: 'ocean-ark',
    title: "The Ocean Ark: Floating Research",
    description: "Thành phố nghiên cứu nổi tự cung tự cấp, chuyên về hải dương học và năng lượng thủy triều.",
    industry: "Architecture / Environment",
    tags: ['Floating City', 'Renewable Energy', 'Oceanography', 'Sustainable Living'],
    duration: 48,
    impactPoints: "36,000",
    status: 'ongoing',
    members: [
      { id: '1', name: 'Dr. Aris Thorne', role: 'founder', level: 1, impactScore: 96, startMonth: 0, endMonth: 48 },
      { id: '11', name: 'Gaia Sterling', role: 'core', level: 1, impactScore: 93, startMonth: 6, endMonth: 48 },
      { id: '6', name: 'Kenji Sato', role: 'rescuer', level: 3, impactScore: 89, startMonth: 12, endMonth: 36 }
    ],
    caseStudies: [
      { title: 'Structural Innovation', content: 'A modular hexagonal platform design that can withstand Category 5 hurricanes while generating 200% of its own energy needs from waves.' }
    ]
  },
  'lex-aeterna': {
    id: 'lex-aeterna',
    title: "Lex Aeterna: AI-Mediated Law",
    description: "Hệ thống phân xử tranh chấp tự động sử dụng logic pháp lý thuần túy để giải quyết các xung đột thương mại quốc tế.",
    industry: "Law / Tech",
    tags: ['Smart Contracts', 'Arbitration', 'International Law', 'AI Ethics'],
    duration: 30,
    impactPoints: "19,500",
    status: 'completed',
    members: [
      { id: '5', name: 'Marcus Vance', role: 'founder', level: 3, impactScore: 91, startMonth: 0, endMonth: 30 },
      { id: '12', name: 'Justice Reed', role: 'core', level: 1, impactScore: 99, startMonth: 6, endMonth: 30 },
      { id: '4', name: 'Sarah Miller', role: 'rescuer', level: 2, impactScore: 83, startMonth: 12, endMonth: 24 }
    ],
    caseStudies: [
      { title: 'Legal Logic', content: 'Reducing judicial bias to zero. The protocol analyzes 200 years of case law in milliseconds to find the most equitable resolution for complex IP disputes.' }
    ]
  },
  'pure-light': {
    id: 'pure-light',
    title: "Pure Light: Solar Glass",
    description: "Phát minh vật liệu kính trong suốt có khả năng hấp thụ năng lượng mặt trời hiệu suất cao cho các tòa nhà chọc trời.",
    industry: "Science / Engineering",
    tags: ['Solar Energy', 'Material Science', 'Green Building', 'Photonics'],
    duration: 36,
    impactPoints: "21,000",
    status: 'completed',
    members: [
      { id: '13', name: 'Dr. Clara Lux', role: 'founder', level: 1, impactScore: 98, startMonth: 0, endMonth: 36 },
      { id: '1', name: 'Dr. Aris Thorne', role: 'core', level: 1, impactScore: 94, startMonth: 8, endMonth: 36 },
      { id: '2', name: 'Elena Rossi', role: 'rescuer', level: 2, impactScore: 86, startMonth: 20, endMonth: 30 }
    ],
    caseStudies: [
      { title: 'Technical Breakthrough', content: 'Utilizing perovskite quantum dots to capture infrared light without affecting visible transparency. This transforms every window into a power generator.' }
    ]
  },
  'botanical-ai': {
    id: 'botanical-ai',
    title: "Botanical AI: Forest Guardian",
    description: "Mạng lưới cảm biến sinh học và AI để giám sát sức khỏe rừng nhiệt đới trong thời gian thực.",
    industry: "Science / Environment",
    tags: ['Conservation', 'Internet of Trees', 'Deep Learning', 'Ecology'],
    duration: 24,
    impactPoints: "17,800",
    status: 'ongoing',
    members: [
      { id: '11', name: 'Gaia Sterling', role: 'founder', level: 1, impactScore: 95, startMonth: 0, endMonth: 24 },
      { id: '6', name: 'Kenji Sato', role: 'core', level: 3, impactScore: 91, startMonth: 4, endMonth: 24 },
      { id: '4', name: 'Sarah Miller', role: 'rescuer', level: 2, impactScore: 82, startMonth: 12, endMonth: 20 }
    ],
    caseStudies: [
      { title: 'Monitoring Strategy', content: 'Detecting illegal logging sounds 2 miles away using psycho-acoustic AI models trained on 10,000 hours of rainforest audio.' }
    ]
  },
  'ethereal-silk': {
    id: 'ethereal-silk',
    title: "Ethereal Silk: Bio-Couture",
    description: "Sợi tơ nhân tạo từ protein nhện, kết hợp với kỹ thuật dệt cổ truyền để tạo ra trang phục không thể bị rách.",
    industry: "Fashion / Science",
    tags: ['Bio-Tech Fashion', 'Spider Silk', 'Textile Engineering', 'Heritage Craft'],
    duration: 30,
    impactPoints: "14,500",
    status: 'completed',
    members: [
      { id: '8', name: 'Isabella Montez', role: 'founder', level: 2, impactScore: 94, startMonth: 0, endMonth: 30 },
      { id: '7', name: 'Dr. Julian Vane', role: 'core', level: 1, impactScore: 91, startMonth: 6, endMonth: 30 },
      { id: '2', name: 'Elena Rossi', role: 'rescuer', level: 2, impactScore: 88, startMonth: 12, endMonth: 24 }
    ],
    caseStudies: [
      { title: 'Material Innovation', content: 'Scaling lab-grown spider silk for the first time in high-fashion. The resulting material is 5 times stronger than steel and 100% biodegradable.' }
    ]
  },
  'global-trust-node': {
    id: 'global-trust-node',
    title: "Global Trust Node: Master Identity",
    description: "Hệ thống định danh kỹ thuật số tối thượng dành cho các chuyên gia Master, được xác thực bởi 100 tổ chức uy tín nhất thế giới.",
    industry: "Tech / Law",
    tags: ['Digital Identity', 'Trust Networks', 'Global Standards', 'Privacy'],
    duration: 48,
    impactPoints: "33,000",
    status: 'ongoing',
    members: [
      { id: '6', name: 'Kenji Sato', role: 'founder', level: 3, impactScore: 97, startMonth: 0, endMonth: 48 },
      { id: '9', name: 'Victor Rothschild', role: 'core', level: 1, impactScore: 95, startMonth: 12, endMonth: 48 },
      { id: '5', name: 'Marcus Vance', role: 'rescuer', level: 3, impactScore: 89, startMonth: 24, endMonth: 48 }
    ],
    caseStudies: [
      { title: 'Governance Logic', content: 'A truly self-sovereign identity model where the individual controls every attribute disclosure, from educational credentials to project execution history.' }
    ]
  },
  'mars-colony-ethics': {
    id: 'mars-colony-ethics',
    title: "Mars Colony: Social Charter",
    description: "Hiến chương xã hội và hiến pháp đầu tiên cho sự định cư lâu dài của con người trên sao Hỏa.",
    industry: "Law / Science",
    tags: ['Space Law', 'Social Engineering', 'Extraterrestrial Ethics', 'Governance'],
    duration: 60,
    impactPoints: "41,000",
    status: 'ongoing',
    members: [
      { id: '12', name: 'Justice Reed', role: 'founder', level: 1, impactScore: 98, startMonth: 0, endMonth: 60 },
      { id: '7', name: 'Dr. Julian Vane', role: 'core', level: 1, impactScore: 94, startMonth: 12, endMonth: 60 },
      { id: '5', name: 'Marcus Vance', role: 'rescuer', level: 3, impactScore: 90, startMonth: 24, endMonth: 48 }
    ],
    caseStudies: [
      { title: 'Governance Strategy', content: 'Creating a "Direct-Liquid" democracy model for small-scale extreme environments where survival depends on collective accountability.' }
    ]
  },
  'resonance-frequency': {
    id: 'resonance-frequency',
    title: "Resonance: Sonic Architecture",
    description: "Thiết kế không gian âm thanh đô thị giúp giảm căng thẳng và tăng cường khả năng tập trung thông qua sóng âm cộng hưởng.",
    industry: "Architecture / Science",
    tags: ['Psycho-Acoustics', 'Urban Soundscape', 'Wellness Design', 'Architectural Physics'],
    duration: 24,
    impactPoints: "16,500",
    status: 'completed',
    members: [
      { id: '1', name: 'Dr. Aris Thorne', role: 'founder', level: 1, impactScore: 95, startMonth: 0, endMonth: 24 },
      { id: '13', name: 'Dr. Clara Lux', role: 'core', level: 1, impactScore: 91, startMonth: 4, endMonth: 24 },
      { id: '10', name: 'Luciano Verdi', role: 'rescuer', level: 1, impactScore: 89, startMonth: 12, endMonth: 20 }
    ],
    caseStudies: [
      { title: 'Scientific Impact', content: 'Reducing cortisol levels by an average of 22% in office workers through the integration of passive acoustic dampeners and generative "Pink Noise" ventilation systems.' }
    ]
  }
};
