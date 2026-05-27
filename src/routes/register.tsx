import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { assignSignupRole } from "@/lib/signup-role.functions";
import { Heart, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Đăng ký — Mariée" }] }),
});

type Role = "couple" | "vendor";
const ROLE_KEY = "mariee.pendingSignupRole";
const NAME_KEY = "mariee.pendingDisplayName";

function RoleCard({ role, value, onChange, title, desc, Icon }: {
  role: Role; value: Role; onChange: (r: Role) => void; title: string; desc: string; Icon: any;
}) {
  const active = role === value;
  return (
    <button
      type="button"
      onClick={() => onChange(role)}
      className={`text-left p-5 rounded-lg border-2 transition-all duration-200 cursor-pointer flex gap-4 items-start ${
        active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50 hover:bg-secondary/40"
      }`}
    >
      <div className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const assign = useServerFn(assignSignupRole);
  const [role, setRole] = useState<Role>("couple");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const targetPath = role === "couple" ? "/couple" : "/vendor";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: name, signup_role: role }, emailRedirectTo: `${window.location.origin}${targetPath}` },
    });
    if (error) { setLoading(false); return toast.error(error.message); }
    // Nếu có session ngay (không cần confirm email) → gán role luôn
    if (data.session) {
      try { await assign({ data: { role, display_name: name } }); } catch (e: any) { toast.error(e.message); }
      setLoading(false);
      toast.success("Đăng ký thành công");
      navigate({ to: targetPath });
    } else {
      // Cần xác nhận email → lưu role để xử lý sau khi đăng nhập lần đầu
      try {
        localStorage.setItem(ROLE_KEY, role);
        if (name) localStorage.setItem(NAME_KEY, name);
      } catch {}
      setLoading(false);
      toast.success("Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư.");
    }
  };

  const onGoogle = async () => {
    try {
      localStorage.setItem(ROLE_KEY, role);
      if (name) localStorage.setItem(NAME_KEY, name);
    } catch {}
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + targetPath });
    if (r.error) toast.error(r.error.message);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl bg-card rounded-lg shadow-elegant p-8 border border-border/60">
        <p className="font-script text-3xl text-primary text-center">join mariée</p>
        <h1 className="font-display text-3xl text-center mt-2">Tạo tài khoản</h1>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Bạn là</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <RoleCard role="couple" value={role} onChange={setRole} Icon={Heart}
              title="Cặp đôi" desc="Tạo trang lễ cưới riêng, mời khách, nhận RSVP và lời chúc." />
            <RoleCard role="vendor" value={role} onChange={setRole} Icon={Store}
              title="Nhà cung cấp" desc="Trưng bày dịch vụ cưới, nhận yêu cầu báo giá từ cặp đôi." />
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input required type="text" placeholder={role === "couple" ? "Tên của bạn (ví dụ: Linh)" : "Tên thương hiệu / cá nhân"} value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-md border border-input bg-background transition-colors focus:border-primary focus:outline-none" />
          <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-md border border-input bg-background transition-colors focus:border-primary focus:outline-none" />
          <input required type="password" minLength={8} placeholder="Mật khẩu (≥ 8 ký tự)" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-md border border-input bg-background transition-colors focus:border-primary focus:outline-none" />
          <button disabled={loading} className="cursor-pointer w-full py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">{loading?"Đang xử lý…":`Đăng ký với vai trò ${role === "couple" ? "Cặp đôi" : "Nhà cung cấp"}`}</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> hoặc <div className="flex-1 h-px bg-border" />
        </div>
        <button onClick={onGoogle} className="cursor-pointer w-full py-3 border border-input rounded-md text-sm transition-colors hover:bg-secondary hover:border-primary/40">Tiếp tục với Google</button>
        <p className="mt-6 text-sm text-center text-muted-foreground">Đã có tài khoản? <Link to="/login" className="text-primary underline">Đăng nhập</Link></p>
      </div>
    </div>
  );
}