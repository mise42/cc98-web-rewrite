import { createFileRoute } from '@tanstack/react-router'

/**
 * 用户中心（占位符）
 * 需要登录才能访问
 */
export const Route = createFileRoute('/_authenticated/usercenter')({
  component: () => <div>用户中心（占位符）</div>,
})
