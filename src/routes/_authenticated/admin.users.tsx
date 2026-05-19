import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListUsers, adminSetUserRole } from "@/lib/admin-billing.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersAdmin });

function UsersAdmin() {
  const list = useServerFn(adminListUsers);
  const setRole = useServerFn(adminSetUserRole);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const m = useMutation({ mutationFn: (v:any) => setRole({ data: v }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Đã cập nhật"); } });
  const toggle = (uid: string, role: "admin"|"vendor", has: boolean) => m.mutate({ user_id: uid, role, grant: !has });
  return (
    <div>
      <h1 className="font-display text-3xl">Người dùng & vai trò</h1>
      <div className="mt-6 grid gap-2">
        {data.map((u: any) => (
          <div key={u.id} className="border border-border/60 rounded p-3 flex justify-between items-center">
            <div><div className="font-medium">{u.display_name||"(no name)"}</div><div className="text-xs text-muted-foreground">{u.id}</div><div className="text-xs mt-1">Roles: {u.roles.join(", ")||"—"}</div></div>
            <div className="flex gap-2 text-xs">
              {(["admin","vendor"] as const).map(r => { const has = u.roles.includes(r); return <button key={r} onClick={()=>toggle(u.id,r,has)} className={`px-3 py-1 rounded ${has?"bg-primary text-primary-foreground":"border border-input"}`}>{has?"− ":"+ "}{r}</button>; })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}