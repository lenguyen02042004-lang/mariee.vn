import React from 'react'
import { ArrowLeft, Quote } from 'lucide-react'
import Link from 'next/link'

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-slate-400/30">
      <nav className="max-w-3xl mx-auto px-6 h-24 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-xs font-mono uppercase tracking-widest">Back to Hub</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pb-32 space-y-16">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Founding Manifesto</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-[0.9]">
            THE 1HUB <br />
            <span className="text-zinc-600">MANIFESTO.</span>
          </h1>
          <p className="text-xl text-zinc-400 font-medium italic border-l-2 border-slate-500/30 pl-6 py-2">
            "For those who build the world, not just those who talk about it."
          </p>
        </header>

        <section className="prose prose-invert prose-zinc max-w-none space-y-12 text-lg leading-relaxed text-zinc-300">
          <div className="space-y-6">
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-white first-letter:mr-3 first-letter:float-left">
              Chúng ta đang sống trong một kỷ nguyên mà sự chuyên nghiệp bị pha loãng bởi những tiếng ồn. Một kỷ nguyên mà những hồ sơ tự xưng tràn ngập trên LinkedIn, và những hình ảnh hào nhoáng nhưng rỗng tuếch đang đánh lừa thị giác trên mạng xã hội.
            </p>
            <p>
              Giá trị thực sự của một chuyên gia đang bị đánh đồng. Công sức của bạn bị đánh cắp bởi những kẻ nhận vơ. Tri thức của bạn bị chôn vùi dưới những dòng "newsfeed" vô tận.
            </p>
          </div>

          <div className="glass-card p-8 md:p-12 space-y-8 bg-zinc-900/20">
            <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Tại 1Hub, chúng tôi tin rằng:</h3>
            
            <div className="grid gap-8">
              <div className="space-y-2">
                <h4 className="text-slate-400 font-mono text-xs uppercase tracking-widest">01. Heritage over Profiles</h4>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Hồ sơ cá nhân chỉ là những dòng chữ. Di sản (Heritage) mới là những gì tồn tại mãi mãi. 1Hub tập trung vào việc lưu trữ quá trình thi công thực tế của bạn.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-slate-400 font-mono text-xs uppercase tracking-widest">02. Meritocracy over Popularity</h4>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Uy tín không đến từ lượt follower. Nó đến từ sự xác thực chéo (Cross-verification) từ những Bậc thầy (Masters) khác trong cùng lĩnh vực.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-slate-400 font-mono text-xs uppercase tracking-widest">03. Synergy over Competition</h4>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Khi những chuyên gia xuất sắc nhất gặp nhau, họ không cạnh tranh. Họ tạo ra sự cộng hưởng (Synergy) để xây dựng những giải pháp thay đổi cuộc chơi.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p>
              1Hub ra đời để chấm dứt sự im lặng của các ngành nghề. Chúng tôi xóa bỏ ranh giới giữa Designer, Developer và Architect. Chúng ta không làm việc đơn độc; chúng ta xây dựng một hệ sinh thái.
            </p>
            <p className="font-bold text-white">
              Chúng tôi không xây dựng một mạng xã hội. Chúng tôi xây dựng một Di sản.
            </p>
          </div>
        </section>

        <footer className="pt-20 border-t border-zinc-900 flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
             <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Signed by</p>
             <p className="text-xl font-display font-bold text-zinc-400">The Global Master Council</p>
          </div>
          <Link href="/onboarding" className="premium-button px-10 py-4">
            Acknowledge & Join the Elite
          </Link>
        </footer>
      </main>

      {/* Decorative Quote Mark */}
      <div className="fixed bottom-10 right-10 opacity-[0.03] pointer-events-none">
        <Quote size={300} className="text-white" />
      </div>
    </div>
  )
}
