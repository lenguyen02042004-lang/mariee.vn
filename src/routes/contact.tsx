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
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Liên hệ — Mariée" },
      {
        name: "description",
        content: "Liên hệ với Mariée để được tư vấn và hỗ trợ về thiệp cưới online.",
      },
      { property: "og:title", content: "Liên hệ — Mariée" },
      {
        property: "og:description",
        content: "Gửi thông tin liên hệ cho Mariée.",
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
        script="contact"
        title="Liên hệ"
        subtitle="Gửi thông tin để liên hệ với Mariée."
      />

      <section className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl leading-tight text-foreground">
                Liên hệ với Mariée
              </h2>
              <p className="mt-4 text-foreground/80 leading-relaxed text-sm md:text-base">
                Nếu bạn có câu hỏi, cần tư vấn mẫu thiệp cưới hoặc cần hỗ trợ, vui lòng để lại thông tin. Chúng tôi sẽ phản hồi lại bạn sớm nhất.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Phản hồi nhanh chóng</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Chúng tôi sẽ liên hệ lại qua số điện thoại hoặc email trong thời gian sớm nhất.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Bảo mật thông tin</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Thông tin liên hệ của bạn chỉ được dùng để phản hồi và hỗ trợ bạn.
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK LINK */}
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border/70 space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Sparkles size={16} />
                <span>Bạn muốn tạo thiệp cưới online?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Điền thông tin ngày cưới và ảnh cưới để tự động khởi tạo trang thiệp cưới ngay bây giờ.
              </p>
              <Link
                to="/gui-thong-tin"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary hover:underline pt-1"
              >
                <span>Tạo thiệp cưới</span>
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
                  <h3 className="font-display text-2xl text-foreground">Gửi tin nhắn</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Điền thông tin bên dưới để gửi tin nhắn cho chúng tôi.
                  </p>
                </div>
              </div>

              {sentSuccess ? (
                <div className="text-center py-12 px-6 rounded-2xl bg-secondary/40 border border-primary/20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="font-display text-2xl text-foreground">Đã gửi thành công!</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => setSentSuccess(false)}
                      className="px-6 py-2.5 rounded-full border border-primary text-primary text-xs font-medium uppercase tracking-wider hover:bg-primary/5 transition"
                    >
                      Gửi tin nhắn khác
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
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                      Số điện thoại hoặc Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Nhập số điện thoại hoặc email"
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                      Nội dung lời nhắn <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nhập nội dung lời nhắn hoặc câu hỏi của bạn..."
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    <span>{submitting ? "Đang gửi..." : "Gửi tin nhắn"}</span>
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
