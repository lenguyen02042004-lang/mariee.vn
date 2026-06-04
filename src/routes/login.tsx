import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import heroImg from "@/assets/hero-wedding-3.jpg";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Đăng nhập — Mariée" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Đăng nhập thành công");
    navigate({ to: "/admin" });
  };

  const onGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
    if (r.error) toast.error(r.error.message);
  };

  return (
    <>
    <PageHero image={heroImg} script="welcome back" title="Đăng nhập tài khoản" subtitle="Tiếp tục hành trình chuẩn bị cho ngày trọng đại của bạn." size="sm" />
    <div className="flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-card rounded-lg shadow-elegant p-8 border border-border/60">
        <h2 className="font-display text-2xl text-center">Chào mừng trở lại</h2>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-md border border-input bg-background" />
          <input required type="password" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-md border border-input bg-background" />
          <button disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm hover:opacity-90 disabled:opacity-50">{loading?"Đang xử lý…":"Đăng nhập"}</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> hoặc <div className="flex-1 h-px bg-border" />
        </div>
        <button onClick={onGoogle} className="w-full py-3 border border-input rounded-md text-sm hover:bg-secondary">Tiếp tục với Google</button>
        <p className="mt-6 text-sm text-center text-muted-foreground">Chưa có tài khoản? <Link to="/register" className="text-primary underline">Đăng ký</Link></p>
      </div>
    </div>
    </>
  );
}