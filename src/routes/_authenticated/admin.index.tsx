import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListCouples, adminListVendors, adminListRsvp } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

function Dashboard() {
  const c = useServerFn(adminListCouples), v = useServerFn(adminListVendors), r = useServerFn(adminListRsvp);
  const couples = useQuery({ queryKey:["a-couples"], queryFn:()=>c() });
  const vendors = useQuery({ queryKey:["a-vendors"], queryFn:()=>v() });
  const rsvp = useQuery({ queryKey:["a-rsvp"], queryFn:()=>r() });
  const cards = [
    { label: "Cặp đôi", n: couples.data?.length ?? 0, to: "/admin/couples" as const },
    { label: "Nhà cung cấp", n: vendors.data?.length ?? 0, to: "/admin/vendors" as const },
    { label: "RSVP", n: rsvp.data?.length ?? 0, to: "/admin/rsvp" as const },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl">Tổng quan</h1>
      <div className="mt-8 grid sm:grid-cols-3 gap-6">
        {cards.map(c=>(
          <Link key={c.label} to={c.to} className="block p-6 rounded-lg border border-border/60 hover:shadow-elegant transition bg-card">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
            <p className="font-display text-5xl mt-3 text-primary">{c.n}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
