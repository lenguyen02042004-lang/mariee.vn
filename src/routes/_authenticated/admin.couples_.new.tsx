import { createFileRoute } from "@tanstack/react-router";
import { CoupleForm } from "@/components/CoupleForm";

export const Route = createFileRoute("/_authenticated/admin/couples_/new")({
  component: () => (
    <div>
      <h1 className="font-display text-3xl">Thêm cặp đôi</h1>
      <div className="mt-6"><CoupleForm initial={{}} /></div>
    </div>
  ),
});
