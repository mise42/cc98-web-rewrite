import { createFileRoute } from '@tanstack/react-router'

/**
 * 关于我们
 */
export const Route = createFileRoute('/about')({
  component: () => <div>关于我们（占位符）</div>,
})
