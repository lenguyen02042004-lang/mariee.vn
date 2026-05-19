import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
  head: () => ({ meta: [{ title: "Quên mật khẩu — Mariée" }] }),
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) return toast.error(error.message);
    setSent(true);
  };
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-card rounded-lg shadow-elegant p-8 border border-border/60">
        <h1 className="font-display text-3xl text-center">Quên mật khẩu</h1>
        {sent ? (
          <p className="mt-6 text-center text-muted-foreground">Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-md border border-input bg-background" />
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm">Gửi liên kết</button>
          </form>
        )}
        <p className="mt-6 text-sm text-center"><Link to="/login" className="text-primary underline">← Đăng nhập</Link></p>
      </div>
    </div>
  );
}