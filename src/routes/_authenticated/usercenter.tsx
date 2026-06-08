import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * 个人中心父路由 — 仅提供 Outlet，具体页面由子路由决定
 */
export const Route = createFileRoute("/_authenticated/usercenter")({
  component: () => <Outlet />,
});
