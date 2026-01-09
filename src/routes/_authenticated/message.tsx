import { createFileRoute } from '@tanstack/react-router'

/**
 * 消息中心（占位符）
 * 需要登录才能访问
 */
export const Route = createFileRoute('/_authenticated/message')({
  component: () => <div>消息中心（占位符）</div>,
})
