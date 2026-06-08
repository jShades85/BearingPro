import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/operations/work-orders")({
  head: () => ({ meta: [{ title: "Work Orders · Crosscurrent" }] }),
  component: () => <Outlet />,
});
