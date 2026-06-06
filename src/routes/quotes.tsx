import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/quotes")({
  head: () => ({ meta: [{ title: "Quotes & Estimates · Port City Sound & Security" }] }),
  component: () => <Outlet />,
});
