import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendTelegramContact } from "@/lib/telegram.functions";
import { toast } from "sonner";
import { Send, Home, Sparkles, MessageSquare, ExternalLink, CheckCircle2 } from "lucide-react";

interface MarieeFooterProps {
  theme?: "blush" | "champagne" | string;
  coupleName?: string;
}

export default function MarieeFooter({ theme = "blush", coupleName = "Cô dâu & Chú rể" }: MarieeFooterProps) {
  const isChampagne = theme === "champagne";
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
        if (res.missingConfig) {
          toast.info(res.message);
        } else {
          toast.error(res.message);
        }
      }
    } catch (err: any) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const accentColor = isChampagne ? "#c9983e" : "#e25c80";
  const btnGradient = isChampagne
    ? "linear-gradient(135deg, #d8a548, #be8b32)"
    : "linear-gradient(135deg, #e86588, #d44c72)";

  return (
    <footer
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "60px auto 30px",
        padding: "0 20px",
        position: "relative",
        zIndex: 5,
      }}
    >
      {/* BRAND & CONTACT CARD */}
      <div
        className="soft-card reveal-on-scroll"
        style={{
          background: "#ffffff",
          borderRadius: "28px",
          padding: "clamp(28px, 4vw, 44px)",
          border: isChampagne ? "1px solid #ede0c8" : "1px solid #fcd4df",
          boxShadow: isChampagne
            ? "0 18px 48px -10px rgba(190, 139, 50, 0.12)"
            : "0 18px 48px -10px rgba(212, 76, 114, 0.12)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "36px",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: MARIEE NAVIGATION */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <span
              style={{
                fontFamily: "'Charm', cursive",
                fontSize: "32px",
                fontWeight: 700,
                color: isChampagne ? "#9e6f24" : "#c43d63",
                letterSpacing: "0.02em",
              }}
            >
              Mariée.vn
            </span>
            <span
              style={{
                fontSize: "11px",
                padding: "3px 9px",
                borderRadius: "99px",
                background: isChampagne ? "#fbf3e4" : "#fdebf0",
                color: accentColor,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Nền tảng thiệp cưới
            </span>
          </div>

          <p style={{ fontSize: "14px", lineHeight: "1.65", color: "var(--muted)", margin: "0 0 20px" }}>
            Trang thiệp cưới của <strong>{coupleName}</strong> được tạo và cá nhân hóa trên nền tảng <strong>Mariée.vn</strong> — Giải pháp thiệp cưới trực tuyến tinh tế, hiện đại và lưu trữ kỷ niệm trọn đời.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                padding: "13px 24px",
                borderRadius: "99px",
                background: btnGradient,
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                boxShadow: isChampagne
                  ? "0 6px 18px rgba(190, 139, 50, 0.28)"
                  : "0 6px 18px rgba(212, 76, 114, 0.28)",
                transition: "transform 0.2s, box-shadow 0.2s",
                width: "fit-content",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <Home size={16} />
              <span>Trở về Trang Chủ Mariée.vn ↗</span>
            </a>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "10px", fontSize: "12px" }}>
              <a href="/" style={{ color: "var(--deep)", textDecoration: "none", fontWeight: 500 }}>
                • Trang chủ
              </a>
              <a href="/#templates" style={{ color: "var(--deep)", textDecoration: "none", fontWeight: 500 }}>
                • Mẫu thiệp cưới cao cấp
              </a>
              <a href="/#pricing" style={{ color: "var(--deep)", textDecoration: "none", fontWeight: 500 }}>
                • Bảng giá dịch vụ
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TELEGRAM CONTACT FORM */}
        <div
          style={{
            background: isChampagne ? "#fffdfa" : "#fffbfc",
            padding: "24px",
            borderRadius: "20px",
            border: isChampagne ? "1px solid #f2e7d5" : "1px solid #fde5ec",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <MessageSquare size={18} color={accentColor} />
            <h3 style={{ margin: 0, fontSize: "17px", color: "var(--deep)" }}>
              Liên hệ &amp; Góp ý (Telegram)
            </h3>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 16px" }}>
            Gửi phản hồi, yêu cầu đặt thiệp hoặc hỗ trợ kỹ thuật trực tiếp tới ban quản trị.
          </p>

          {sentSuccess ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 12px",
                background: isChampagne ? "#fbf3e4" : "#fdebf0",
                borderRadius: "14px",
              }}
            >
              <CheckCircle2 size={36} color={accentColor} style={{ margin: "0 auto 10px" }} />
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--deep)" }}>
                Cảm ơn bạn đã gửi liên hệ!
              </p>
              <small style={{ color: "var(--muted)", fontSize: "12px", display: "block", marginTop: "4px" }}>
                Tin nhắn đã được chuyển tiếp thành công đến Telegram của ban quản trị.
              </small>
              <button
                type="button"
                onClick={() => setSentSuccess(false)}
                style={{
                  marginTop: "14px",
                  fontSize: "11px",
                  background: "transparent",
                  border: `1px solid ${accentColor}`,
                  color: accentColor,
                  padding: "5px 12px",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Họ và tên của bạn *"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: isChampagne ? "1px solid #ede0c8" : "1px solid #fcd4df",
                  background: "#ffffff",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              <input
                required
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Số điện thoại hoặc Email *"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: isChampagne ? "1px solid #ede0c8" : "1px solid #fcd4df",
                  background: "#ffffff",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nội dung lời nhắn hoặc yêu cầu hỗ trợ... *"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: isChampagne ? "1px solid #ede0c8" : "1px solid #fcd4df",
                  background: "#ffffff",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  color: "var(--ink)",
                  outline: "none",
                  resize: "vertical",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "11px 18px",
                  borderRadius: "99px",
                  background: btnGradient,
                  color: "#ffffff",
                  border: 0,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: isChampagne
                    ? "0 4px 14px rgba(190, 139, 50, 0.22)"
                    : "0 4px 14px rgba(212, 76, 114, 0.22)",
                }}
              >
                <Send size={13} />
                <span>{submitting ? "Đang gửi Telegram..." : "Gửi tới Telegram ban quản trị →"}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* BOTTOM COPYRIGHT */}
      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "12px",
          color: "var(--muted)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <p style={{ margin: 0 }}>
          © 2026 <strong>{coupleName}</strong>. Trang thiệp cưới cá nhân hóa bởi{" "}
          <a href="/" style={{ color: accentColor, textDecoration: "none", fontWeight: 600 }}>
            Mariée.vn
          </a>
        </p>
        <small style={{ opacity: 0.85 }}>Cảm ơn bạn đã đồng hành trong ngày trọng đại của chúng mình! ♡</small>
      </div>
    </footer>
  );
}
