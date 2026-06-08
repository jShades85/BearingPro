import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/crm/companies")({
  head: () => ({ meta: [{ title: "Companies · Port City Sound & Security" }] }),
  component: () => <Outlet />,
});
