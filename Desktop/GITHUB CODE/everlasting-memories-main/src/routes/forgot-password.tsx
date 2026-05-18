import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({ meta: [{ title: "Quên mật khẩu — Mariée" }] }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Email đặt lại mật khẩu đã được gửi.");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-card rounded-lg shadow-elegant p-8 border border-border/60">
        <p className="font-script text-3xl text-primary text-center">quên mật khẩu</p>
        <h1 className="font-display text-3xl text-center mt-2">Yêu cầu đặt lại mật khẩu</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-md border border-input bg-background" />
          <button disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm hover:opacity-90 disabled:opacity-50">{loading ? "Đang gửi…" : "Gửi email"}</button>
        </form>
        <p className="mt-6 text-sm text-center text-muted-foreground">Đã nhớ mật khẩu? <Link to="/login" className="text-primary underline">Đăng nhập</Link></p>
      </div>
    </div>
  );
}
