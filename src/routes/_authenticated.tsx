import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";

/**
 * 受保护路由的布局
 * 所有需要认证的路由都应该放在这个布局下
 * 使用 beforeLoad 钩子进行认证检查，避免 UI 闪烁
 */
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading } = useAuthStore.getState();

    // 如果还在加载中，不做任何处理（可以添加 loading 状态）
    // 如果未登录，重定向到登录页
    if (!isLoading && !isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});
