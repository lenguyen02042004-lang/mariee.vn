import { createFileRoute } from "@tanstack/react-router";
import { VendorShell } from "@/components/VendorShell";

export const Route = createFileRoute("/_authenticated/vendor")({
  component: VendorShell,
});