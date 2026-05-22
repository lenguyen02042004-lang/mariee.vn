import { createFileRoute } from "@tanstack/react-router";
import { VendorForm } from "@/components/VendorForm";

export const Route = createFileRoute("/_authenticated/admin/vendors/new")({
  component: () => (
    <div>
      <h1 className="font-display text-3xl">Thêm vendor</h1>
      <div className="mt-6"><VendorForm initial={{}} /></div>
    </div>
  ),
});