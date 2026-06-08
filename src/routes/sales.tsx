import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [{ title: "Sales · Port City Sound & Security" }] }),
  component: () => <Outlet />,
});
