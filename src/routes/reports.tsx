import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/reports")({ component: Reports });
function Reports() {
  return <div className="p-6 text-muted-foreground">Reports — coming soon</div>;
}
