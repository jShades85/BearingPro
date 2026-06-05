import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/team")({ component: Team });
function Team() {
  return <div className="p-6 text-muted-foreground">Team — coming soon</div>;
}
