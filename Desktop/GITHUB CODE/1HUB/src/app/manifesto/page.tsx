import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Target, Zap, Users, Award, Sparkles, Scale, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-accent/20 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-zinc-400/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 md:py-48">
        {/* Header Section */}
        <header className="space-y-12 text-center mb-32">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5">
              <Shield className="text-accent" size={32} />
            </div>
          </div>
          <div className="space-y-4">
             <h2 className="text-[10px] font-mono text-accent uppercase tracking-[0.6em]">The Sovereign Manifesto</h2>
             <h1 className="editorial-title text-white text-5xl md:text-7xl">1HUB.</h1>

          </div>
          <div className="w-px h-24 bg-gradient-to-b from-accent/50 to-transparent mx-auto" />
        </header>


        <section className="space-y-32 mb-48">
          {/* Definition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="glass-card p-12 space-y-6 bg-zinc-900/10">
                <h3 className="text-2xl font-display text-white">1. 1HUB. là gì?</h3>
                <p className="text-zinc-500 leading-relaxed font-serif text-lg">
                  <span className="text-white font-bold">1HUB.</span> là một <span className="text-accent italic">Hệ sinh thái Di sản Chuyên gia Đa ngành</span>. Nó không phải là một mạng xã hội để "khoe mẽ" (Vanity), mà là một "Thánh đường" (Sanctuary) để lưu trữ và xác thực giá trị thực thi của con người.
                </p>
             </div>
             <div className="glass-card p-12 space-y-6 bg-accent/[0.02] border-accent/10">
                <h3 className="text-2xl font-display text-white">2. Ứng dụng giúp gì?</h3>
                <ul className="space-y-4">
                   {[
                     { t: 'Xác lập Danh tính Uy tín', d: 'Hồ sơ được bảo chứng bởi Master thay vì tự khai báo.' },
                     { t: 'Lưu trữ Di sản Trí tuệ', d: 'Ghi lại toàn bộ Logic thực thi và Contribution Timeline.' },
                     { t: 'Kết nối Cộng hưởng', d: 'Thuật toán kết nối dựa trên Tương thích thực thi.' },
                     { t: 'Bảo vệ Quyền sở hữu', d: 'Công khai chiến lược, bảo vệ bí mật kỹ thuật.' }
                   ].map((item, i) => (
                     <li key={i} className="flex gap-4">
                        <Sparkles size={14} className="text-accent shrink-0 mt-1" />
                        <div>
                           <p className="text-sm font-bold text-white uppercase tracking-wider">{item.t}</p>
                           <p className="text-xs text-zinc-500">{item.d}</p>
                        </div>
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="space-y-12 mb-48">
           <div className="text-center space-y-4">
              <h2 className="text-3xl font-display text-white italic">The Disruptive Edge</h2>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Sự khác biệt so với phần còn lại</p>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="border-b border-white/10">
                       <th className="py-6 px-4 text-left text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Đặc điểm</th>
                       <th className="py-6 px-4 text-left text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Nền tảng hiện tại</th>
                       <th className="py-6 px-4 text-left text-[10px] font-mono text-accent uppercase tracking-widest">1HUB.</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {[
                      { l: 'Bản chất', old: 'Chợ hồ sơ (Marketplace)', new: 'Hệ sinh thái di sản (Living Heritage)' },
                      { l: 'Xác thực', old: 'Tự khai báo, thiếu kiểm chứng', new: 'Xác thực chéo bởi Master' },
                      { l: 'Giá trị', old: 'Hình ảnh hào nhoáng (Decoration)', new: 'Logic thực thi (Verification)' },
                      { l: 'Cơ chế', old: 'Ưu tiên sự nổi tiếng (Popularity)', new: 'Uy tín thực chứng (Reputation Engine)' }
                    ].map((row, i) => (
                      <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                         <td className="py-8 px-4 text-sm font-bold text-zinc-400">{row.l}</td>
                         <td className="py-8 px-4 text-sm text-zinc-600 italic font-serif">{row.old}</td>
                         <td className="py-8 px-4 text-sm text-white font-medium">{row.new}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

        {/* CTO Verdict */}
        <section className="glass-card p-16 md:p-24 border-accent/20 bg-accent/5 space-y-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
           <div className="space-y-6 text-center">
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8">
              {[
                { t: 'Giải quyết "nỗi đau" toàn cầu', d: 'Thế giới đang lạm phát thông tin. Nhu cầu xác thực uy tín là cực lớn.' },
                { t: 'Cơ chế vận hành bền vững', d: 'Thuật toán uy tín $R$ và quản trị "Nhân chứng" đảm bảo tính công bằng.' },
                { t: 'Tính đa dụng cao', d: 'Thiết kế đa ngành giúp 1Hub không bị giới hạn trong bất kỳ thị trường nào.' }
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                   <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Zap size={14} className="text-accent" />
                   </div>
                   <h4 className="text-sm font-bold text-white uppercase tracking-wider">{item.t}</h4>
                   <p className="text-xs text-zinc-500 leading-relaxed">{item.d}</p>
                </div>
              ))}
           </div>

           <div className="pt-12 text-center">
              <p className="text-lg font-serif italic text-zinc-400">
                &quot;Chúng ta đang xây dựng một <span className="text-white font-bold">Cỗ máy sản xuất sự tin cậy</span>. Thành công của 1Hub nằm ở <span className="text-accent font-bold">chất lượng di sản</span>.&quot;
              </p>
           </div>
        </section>

        {/* Final CTA */}
        <footer className="py-40 text-center space-y-12">
           <div className="space-y-4">
              <h2 className="text-2xl font-display text-white italic">Bạn đã sẵn sàng bước sang trang tiếp theo?</h2>
              <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.5em]">TINH CHỈNH LUỒNG SYNERGY MATCHMAKING</p>
           </div>
           <div className="flex justify-center gap-6">
              <Link href="/dashboard" className="premium-button py-4 px-12 text-[10px] uppercase tracking-widest font-mono">
                 VÀO COMMAND CENTER
              </Link>
              <Link href="/knowledge" className="py-4 px-12 text-[10px] border border-white/5 hover:border-accent/20 transition-all uppercase tracking-widest font-mono">
                 KNOWLEDGE SANCTUARY
              </Link>
           </div>
        </footer>
      </div>
    </div>
  )
}
