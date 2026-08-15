import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/escola")({
  component: () => <Outlet />,
});
