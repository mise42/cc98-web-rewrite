import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * 消息中心父路由
 */
export const Route = createFileRoute("/_authenticated/message")({
  component: () => <Outlet />,
});
