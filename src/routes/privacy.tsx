import { createFileRoute } from '@tanstack/react-router'

/**
 * 隐私政策
 */
export const Route = createFileRoute('/privacy')({
  component: () => <div>隐私政策（占位符）</div>,
})
