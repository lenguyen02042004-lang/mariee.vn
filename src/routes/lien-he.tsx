import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/lien-he")({
  beforeLoad: () => {
    throw redirect({ to: "/contact" });
  },
});
