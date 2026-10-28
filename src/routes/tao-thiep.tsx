import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tao-thiep")({
  beforeLoad: () => {
    throw redirect({ to: "/gui-thong-tin" });
  },
});
