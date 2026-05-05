import React from 'react'
import { Metadata } from 'next'
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  ScrollText, 
  Trophy, 
  Target, 
  MessageSquareCode, 
  AlertCircle,
  ArrowRight,
  BookOpen,
  Scale,
  Award
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Knowledge Sanctuary | 1HUB',
  description: 'Understand the world-first Intellectual Heritage platform, its mastery levels, and the sovereign governance protocol.',
}

const CHAPTERS = [
  {
    id: 'vision',
    title: 'Chapter 1: The Vision',
    subtitle: 'Khát vọng Di sản',
    icon: <Target className="text-accent" size={32} />,
    items: [
      {
        q: '1HUB là gì và tại sao nó khác biệt?',
        a: '1HUB không phải là một nền tảng kết nối phổ thông. Đây là "Thánh đường Di sản Trí tuệ" (Intellectual Heritage Sanctuary). Thay vì tập trung vào những thông tin tĩnh, tự khai báo, 1HUB tập trung vào các dự án đã được bảo chứng bởi đồng nghiệp, nơi mỗi đóng góp đều được ghi nhận vĩnh viễn và không thể giả mạo.'
      },
      {
        q: '"Di sản Trí tuệ" (Intellectual Heritage) nghĩa là gì?',
        a: 'Trong thế giới kỹ thuật số đầy nhiễu loạn, những đóng góp thực sự của bạn thường bị trôi đi. Chúng tôi định nghĩa "Di sản Trí tuệ" là bản ghi chép bất biến về logic, quy trình và tác động thực tế mà bạn đã tạo ra trong suốt sự nghiệp chuyên gia của mình.'
      },
      {
        q: 'Tại sao giao diện lại tối giản và có phần "nghiêm trọng"?',
        a: 'Chúng tôi áp dụng phong cách "Luxury Editorial". 1HUB được thiết kế để tôn vinh sự sâu sắc và trí tuệ, không phải sự hào nhoáng hay vanity (sống ảo). Mỗi dự án trên 1HUB xứng đáng được trình bày như một tác phẩm nghệ thuật kiến trúc.'
      }
    ]
  },
  {
    id: 'mastery',
    title: 'Chapter 2: The Mastery System',
    subtitle: 'Hệ thống Bậc thầy (L7 - L1)',
    icon: <Trophy className="text-accent" size={32} />,
    items: [
      {
        q: 'Hệ thống cấp bậc L7 đến L1 hoạt động như thế nào?',
        a: '1HUB sử dụng hệ thống phân cấp ngược để đảm bảo uy tín. Bạn bắt đầu từ L7 (The Creator) và thăng tiến thông qua việc tích lũy Merit Score ($R$). Càng lên cao (L1 - Master), trọng lượng của "chữ ký" và "sự bảo chứng" của bạn càng lớn trong toàn bộ hệ sinh thái.'
      },
      {
        q: 'Làm thế nào để thăng cấp?',
        a: 'Bạn thăng cấp không phải bằng cách "mua" hay "chăm chỉ đăng bài". Bạn thăng cấp bằng cách: 1. Hoàn thành các dự án chất lượng cao. 2. Nhận được sự bảo chứng (Endorsement) từ những người có cấp bậc cao hơn. 3. Viết các Case Study có chiều sâu được cộng đồng chuyên gia đánh giá cao.'
      }
    ]
  },
  {
    id: 'mechanics',
    title: 'Chapter 3: The Mechanics',
    subtitle: 'Cơ chế Vận hành',
    icon: <Zap className="text-accent" size={32} />,
    items: [
      {
        q: 'Chỉ số Danh tiếng (Heritage Reputation - $R$) là gì?',
        a: 'Công thức tính toán minh bạch:\n\n$R = ∑ (V × W × M)$\n\nTrong đó:\n• V (Verification): Số lượt bảo chứng (Endorsements) bạn nhận được từ cộng đồng.\n• W (Weight): Trọng số quyền năng. Một lời bảo chứng từ Master (L1-L3) có sức nặng gấp nhiều lần so với các cấp bậc thấp hơn.\n• M (Multiplier): Hệ số tác động thực thi.\n  - Vai trò Core: Hệ số x1.0.\n  - Vai trò Người giải cứu (Rescuer): Hệ số x2.0 (Dành cho những can thiệp chiến lược giúp dự án vượt qua khủng hoảng).'
      },
      {
        q: 'Project Pulse (Timeline) ghi nhận điều gì?',
        a: 'Nó ghi nhận chính xác "nhịp thở" của dự án: Ai tham gia lúc nào, vai trò gì (Founder, Core, Rescuer) và đóng góp trong bao lâu. Điều này ngăn chặn việc "nhận vơ" công trạng thường thấy trên các CV thông thường.'
      },
      {
        q: 'Tại sao Case Study lại bắt buộc phải có "Logic chuyên gia"?',
        a: 'Chúng tôi không quan tâm đến kết quả đẹp mắt, chúng tôi quan tâm đến "Cách bạn tư duy". Một Case Study trên 1HUB yêu cầu bạn giải trình logic kỹ thuật hoặc sáng tạo đằng sau giải pháp. AI của chúng tôi sẽ hỗ trợ bạn cấu trúc hóa điều này nhưng không thay thế trí tuệ của bạn.'
      }
    ]
  },
  {
    id: 'governance',
    title: 'Chapter 4: Sovereign Governance',
    subtitle: 'Quy tắc Chủ quyền',
    icon: <ShieldCheck className="text-accent" size={32} />,
    items: [
      {
        q: 'Sự khác biệt giữa Project Owner, Leader và Contributor?',
        a: 'Project Owner là người khởi tạo dự án và chịu trách nhiệm cao nhất. Leader là người điều hành. Contributor là những chuyên gia thực thi. Mỗi vai trò có quyền hạn khác nhau trong việc chỉnh sửa di sản dự án.'
      },
      {
        q: 'Quyền "Kháng nghị" (Dispute Record) là gì?',
        a: 'Nếu Project Owner ghi nhận sai thời gian hoặc vai trò của bạn, bạn có quyền "Kháng nghị". 1HUB đóng vai trò là "Nhân chứng khách quan", chúng tôi sẽ hiển thị cả hai phiên bản dữ liệu cạnh nhau để cộng đồng tự đánh giá tính trung thực của các bên.'
      },
      {
        q: 'Expert Insights là gì và tại sao tôi không thể bình luận?',
        a: '1HUB không có phần bình luận xã hội thông thường. Chúng tôi có Expert Insights - nơi chỉ những người đạt cấp bậc nhất định mới có thể đưa ra nhận xét chuyên môn, đảm bảo môi trường thảo luận luôn ở trình độ cao nhất.'
      }
    ]
  }
]

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-accent/20">
      
      {/* Cinematic Header */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="relative z-10 text-center space-y-8 max-w-4xl px-10">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5 animate-pulse">
              <BookOpen className="text-accent" size={32} />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="editorial-title text-white">The Knowledge Sanctuary</h1>
            <p className="text-[10px] font-mono text-accent uppercase tracking-[0.5em]">Tài liệu hướng dẫn & Khái niệm Di sản</p>
          </div>
          <p className="text-lg font-serif italic text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            "1HUB không chỉ là một ứng dụng, nó là một triết lý về sự công nhận. Hãy dành thời gian để hiểu cách chúng tôi bảo tồn trí tuệ của bạn."
          </p>
        </div>
      </section>

      {/* Navigation Quick Links */}
      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-10 h-16 flex items-center justify-center gap-12">
          {CHAPTERS.map(ch => (
            <a key={ch.id} href={`#${ch.id}`} className="text-[10px] font-mono text-zinc-500 hover:text-accent transition-colors uppercase tracking-widest">
              {ch.id}
            </a>
          ))}
        </div>
      </nav>

      {/* Content Chapters */}
      <main className="max-w-[1400px] mx-auto px-10 py-32 space-y-40">
        
        {CHAPTERS.map((chapter) => (
          <section key={chapter.id} id={chapter.id} className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* Chapter Header */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-4">
                <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10">
                  {chapter.icon}
                </div>
                <div>
                  <h2 className="text-[10px] font-mono text-accent uppercase tracking-widest mb-2">{chapter.subtitle}</h2>
                  <h3 className="text-3xl font-display text-white">{chapter.title}</h3>
                </div>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed font-serif italic pr-12">
                {chapter.id === 'vision' && "Khám phá lý do tại sao 1HUB được tạo ra để thay đổi hoàn toàn cách thế giới nhìn nhận về sự nghiệp của bạn."}
                {chapter.id === 'mastery' && "Thấu hiểu nấc thang quyền lực và danh dự trong một cộng đồng chuyên gia thực thụ."}
                {chapter.id === 'mechanics' && "Chi tiết về những thuật toán và cơ chế đảm bảo tính minh bạch và giá trị của di sản."}
                {chapter.id === 'governance' && "Các quy tắc nghiêm ngặt về chủ quyền và trách nhiệm để duy trì sự thượng tôn trí tuệ."}
              </p>
            </div>

            {/* Q&A Items */}
            <div className="lg:col-span-8 space-y-6">
              {chapter.items.map((item, i) => (
                <div key={i} className="glass-card group hover:border-accent/30 transition-all duration-500 overflow-hidden relative">
                  <div className="p-10 space-y-6">
                    <div className="flex gap-6">
                      <span className="text-[10px] font-mono text-accent/40 font-bold uppercase">Hỏi</span>
                      <h4 className="text-xl font-display text-zinc-200 group-hover:text-white transition-colors">
                        {item.q}
                      </h4>
                    </div>
                    <div className="flex gap-6">
                      <span className="text-[10px] font-mono text-zinc-700 font-bold uppercase">Đáp</span>
                      <p className="text-zinc-500 font-sans leading-relaxed text-sm md:text-base whitespace-pre-line">
                        {item.a}
                      </p>
                    </div>
                  </div>
                  
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-accent/10 rotate-45 transform transition-transform group-hover:scale-110" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* The Reputation Formula Visualizer */}
        <section className="py-40 border-t border-white/5">
           <div className="glass-card bg-accent/5 border-accent/20 p-20 text-center space-y-12 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
              <div className="space-y-4">
                <h3 className="text-[10px] font-mono text-accent uppercase tracking-[0.5em]">The Reputation Core</h3>
                <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter italic">
                  R = ∑ (V × W × M)
                </h2>
              </div>
              <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-2">
                  <p className="text-accent font-mono text-xl">V</p>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Votes (Bảo chứng)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-accent font-mono text-xl">W</p>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Weight (Trọng số cấp bậc)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-accent font-mono text-xl">M</p>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Impact (Hệ số tác động)</p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest pt-8 relative z-10">Verified by The Synergy Engine</p>
           </div>
        </section>

        {/* Hierarchy Section */}
        <section className="space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.6em]">The Mastery Hierarchy</h2>
            <p className="text-3xl font-display text-white">Nấc thang của sự Xuất chúng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="glass-card p-10 border-accent/10 space-y-6 bg-gradient-to-b from-accent/5 to-transparent relative">
                <Award className="text-accent" size={32} />
                <h4 className="text-xl font-display text-white">Class I: THE ELITES</h4>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">L1 Master & L2 Mentor</p>
                <p className="text-xs text-zinc-600 leading-relaxed">Đỉnh cao của danh tiếng và sức mạnh bảo chứng. Những người định hình tiêu chuẩn của toàn bộ hệ sinh thái.</p>
             </div>
             <div className="glass-card p-10 border-white/5 space-y-6 relative">
                <Scale className="text-zinc-500" size={32} />
                <h4 className="text-xl font-display text-white">Class II: THE LEADERS</h4>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">L3 Expert & L4 Lead</p>
                <p className="text-xs text-zinc-600 leading-relaxed">Những người dẫn dắt các dự án đa ngành, đảm bảo sự kết nối và thực thi chiến lược hoàn hảo.</p>
             </div>
             <div className="glass-card p-10 border-white/5 space-y-6 relative">
                <Users className="text-zinc-700" size={32} />
                <h4 className="text-xl font-display text-white">Class III: EXECUTORS</h4>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">L5 Specialist to L7 Creator</p>
                <p className="text-xs text-zinc-700 leading-relaxed">Các chuyên gia thực thi, bắt đầu hành trình xây dựng di sản và tích lũy uy tín từ những đóng góp thực tế.</p>
             </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-display text-white">Bạn đã sẵn sàng xây dựng Di sản?</h2>
            <p className="text-zinc-500 font-serif italic">"Đừng chỉ tồn tại trên các nền tảng phổ thông, hãy được ghi nhận trong Thánh đường."</p>
          </div>
          <div className="flex justify-center gap-6">
            <Link href="/" className="premium-button py-4 px-10 text-[10px] uppercase tracking-widest font-mono">
              Quay lại Repository
            </Link>
            <Link href="/onboarding" className="py-4 px-10 text-[10px] border border-white/10 hover:border-accent/50 hover:text-accent transition-all uppercase tracking-widest font-mono">
              Bắt đầu Onboarding
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/20 text-center">
        <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-[0.5em]">The Professional Heritage Network © 2026</p>
      </footer>

    </div>
  )
}
