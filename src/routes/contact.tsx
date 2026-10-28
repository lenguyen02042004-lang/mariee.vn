import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { sendTelegramContact } from "@/lib/telegram.functions";
import { toast } from "sonner";
import { PageHero } from "@/components/PageHero";
import heroImg from "@/assets/hero-wedding-2.jpg";
import { canonical } from "@/lib/seo";
import {
  Send,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Liên Hệ Cùng Mariée — Thiệp Cưới Online Cao Cấp" },
      {
        name: "description",
        content:
          "Liên hệ đội ngũ Mariée để được tư vấn thiết kế thiệp cưới online sang trọng, hỗ trợ chu đáo và đồng hành cùng ngày trọng đại của bạn.",
      },
      { property: "og:title", content: "Liên Hệ Cùng Mariée" },
      {
        property: "og:description",
        content:
          "Gửi lời nhắn và yêu cầu tư vấn thiệp cưới trực tiếp tới đội ngũ Mariée.",
      },
      { property: "og:url", content: canonical("/contact") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: canonical("/contact") }],
  }),
});

function ContactPage() {
  const sendTelegramFn = useServerFn(sendTelegramContact);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim() || submitting) return;

    setSubmitting(true);
    try {
      const pageUrl = typeof window !== "undefined" ? window.location.href : "";
      const res = await sendTelegramFn({
        data: {
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim(),
          pageUrl,
        },
      });

      if (res.success) {
        toast.success(res.message);
        setSentSuccess(true);
        setName("");
        setContact("");
        setMessage("");
      } else {
        toast.error(res.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } catch (err: any) {
      toast.error("Có lỗi xảy ra trong quá trình gửi, vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        image={heroImg}
        script="get in touch"
        title="Liên Hệ Cùng Mariée"
        subtitle="Chúng tôi luôn sẵn lòng lắng nghe mọi mong muốn của bạn để cùng tạo nên trang thiệp cưới trọn vẹn và đáng nhớ nhất."
      />

      <section className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* LEFT COLUMN: INTRODUCTION & VALUE */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full mb-3">
                Đồng hành cùng ngày trọng đại
              </span>
              <h2 className="font-display text-3xl md:text-4xl leading-tight text-foreground">
                Mariée Luôn Sẵn Lòng Lắng Nghe &amp; Đồng Hành
              </h2>
              <p className="mt-4 text-foreground/80 leading-relaxed text-sm md:text-base">
                Mỗi đám cưới là một câu chuyện tình yêu duy nhất. Dù bạn muốn tư vấn mẫu thiệp cưới thiết kế theo phong cách riêng, cần hỗ trợ thêm thông tin hay muốn gửi bất kỳ góp ý nào, đội ngũ Mariée luôn ở đây để hỗ trợ bạn thật chu đáo.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Phản hồi nhanh chóng &amp; chu đáo</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Lời nhắn của bạn sẽ được tiếp nhận ngay và chúng tôi sẽ liên hệ lại qua SĐT/Zalo hoặc Email sớm nhất.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Bảo mật thông tin trọn vẹn</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Thông tin liên hệ của bạn luôn được giữ kín tuyệt đối và chỉ dùng để tư vấn, hỗ trợ ngày cưới của bạn.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Chăm chút từng chi tiết thiệp cưới</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Hỗ trợ tinh chỉnh bài nhạc nền, album ảnh cưới, mã QR mừng cưới hay bảng danh sách khách mời xác nhận tham dự.
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK LINK CARD */}
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border/70 space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Sparkles size={16} />
                <span>Bạn muốn tạo thiệp cưới online ngay?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chỉ cần điền tên cô dâu chú rể, ngày cưới và link album ảnh cưới, hệ thống sẽ tự động khởi tạo trang thiệp cưới và bảng tiếp nhận xác nhận tham dự cho bạn.
              </p>
              <Link
                to="/gui-thong-tin"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary hover:underline pt-1"
              >
                <span>Mở biểu mẫu tạo thiệp cưới</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-3xl border border-border/70 p-6 sm:p-10 shadow-xl shadow-primary/5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-foreground">Gửi Lời Nhắn Cho Mariée</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Để lại thông tin bên dưới, chúng tôi sẽ liên hệ lại với bạn sớm nhất.
                  </p>
                </div>
              </div>

              {sentSuccess ? (
                <div className="text-center py-12 px-6 rounded-2xl bg-secondary/40 border border-primary/20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="font-display text-2xl text-foreground">Đã Gửi Thành Công!</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Cảm ơn bạn đã gửi lời nhắn tới Mariée. Chúng tôi đã nhận được thông tin và sẽ sớm liên hệ lại với bạn qua số điện thoại/Zalo hoặc email đã cung cấp.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => setSentSuccess(false)}
                      className="px-6 py-2.5 rounded-full border border-primary text-primary text-xs font-medium uppercase tracking-wider hover:bg-primary/5 transition"
                    >
                      Gửi thêm lời nhắn khác
                    </button>
                    <Link
                      to="/"
                      className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wider hover:opacity-90 transition"
                    >
                      Về trang chủ
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                      Họ và tên của bạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Hoàng Nam hoặc Cô dâu Thảo My"
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                      Số điện thoại / Zalo hoặc Email để nhận phản hồi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Ví dụ: 0912 345 678 hoặc email@domain.com"
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                      Nội dung lời nhắn hoặc mong muốn của bạn <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Vui lòng chia sẻ mong muốn, câu hỏi hoặc nội dung bạn cần Mariée tư vấn..."
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-y"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    * Mariée luôn trân trọng từng lời nhắn và sẽ phản hồi chu đáo tới bạn trong thời gian sớm nhất.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    <span>{submitting ? "Đang gửi lời nhắn..." : "Gửi lời nhắn →"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
