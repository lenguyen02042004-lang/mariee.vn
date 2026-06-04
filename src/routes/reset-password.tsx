import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImg from "@/assets/hero-wedding-1.jpg";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/reset-password")({
  component: ResetPage,
  head: () => ({ meta: [{ title: "Đặt lại mật khẩu — Mariée" }] }),
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Đặt lại mật khẩu thành công");
    navigate({ to: "/admin" });
  };
  return (
    <>
    <PageHero image={heroImg} script="reset password" title="Đặt mật khẩu mới" subtitle="Chọn mật khẩu mạnh để bảo vệ tài khoản của bạn." size="sm" />
    <div className="flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-card rounded-lg shadow-elegant p-8 border border-border/60">
        <h2 className="font-display text-2xl text-center">Mật khẩu mới</h2>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input required type="password" minLength={8} placeholder="Mật khẩu mới (≥ 8 ký tự)" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-md border border-input bg-background" />
          <button disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm disabled:opacity-50">{loading?"Đang lưu…":"Lưu mật khẩu"}</button>
        </form>
      </div>
    </div>
    </>
  );
}