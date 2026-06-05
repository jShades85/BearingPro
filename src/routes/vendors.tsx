import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/vendors")({ component: Vendors });
function Vendors() {
  return <div className="p-6 text-muted-foreground">Vendors — coming soon</div>;
}
