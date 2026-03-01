import { createFileRoute, Navigate } from '@tanstack/react-router'

/**
 * 消息中心默认入口，重定向到「回复我的」
 */
export const Route = createFileRoute('/_authenticated/message/')({
  component: () => <Navigate to="/message/reply" />,
})
