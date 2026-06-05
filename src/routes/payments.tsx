import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/payments")({ component: Payments });
function Payments() {
  return <div className="p-6 text-muted-foreground">Payments — coming soon</div>;
}
