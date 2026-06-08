import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/crm")({
  head: () => ({ meta: [{ title: "CRM · Port City Sound & Security" }] }),
  component: () => <Outlet />,
});
