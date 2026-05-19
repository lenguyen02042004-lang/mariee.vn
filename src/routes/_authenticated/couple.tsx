import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myCouples, getMyCouple } from "@/lib/couple-owner.functions";
import { CoupleForm } from "@/components/CoupleForm";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/couple")({
  component: CouplePortal,
  head: () => ({ meta: [{ title: "Trang của tôi — Mariée" }] }),
});

function CouplePortal() {
  const { user, signOut } = useAuth();
  const list = useServerFn(myCouples);
  const get = useServerFn(getMyCouple);
  const { data: mine, isLoading } = useQuery({ queryKey: ["my-couples"], queryFn: () => list() });
  const id = mine?.[0]?.id;
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ["my-couple", id], enabled: !!id, queryFn: () => get({ data: { id: id! } }),
  });

  if (isLoading) return <p className="text-center py-20 text-muted-foreground">Đang tải…</p>;

  if (!mine || mine.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="font-script text-3xl text-primary">couple portal</p>
        <h1 className="font-display text-4xl mt-2">Chưa có trang cưới nào</h1>
        <p className="text-muted-foreground mt-3">
          Tài khoản của bạn ({user?.email}) chưa được gán làm chủ trang cưới. Vui lòng liên hệ ban quản trị để được tạo trang và cấp quyền chỉnh sửa.
        </p>
        <button onClick={signOut} className="mt-6 text-sm text-primary underline">Đăng xuất</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-script text-3xl text-primary">couple portal</p>
          <h1 className="font-display text-3xl md:text-4xl">Trang cưới của bạn</h1>
          <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {detail?.couple?.slug && (
            <Link to="/couples/$slug" params={{ slug: detail.couple.slug }} className="px-3 py-1.5 rounded bg-secondary/60 hover:bg-secondary">Xem trang công khai</Link>
          )}
          <button onClick={signOut} className="text-primary underline">Đăng xuất</button>
        </div>
      </div>

      {loadingDetail || !detail?.couple ? (
        <p className="mt-10 text-muted-foreground">Đang tải dữ liệu…</p>
      ) : (
        <div className="mt-8">
          <CoupleForm mode="owner" initial={detail.couple} gallery={detail.gallery} />
        </div>
      )}
    </div>
  );
}
