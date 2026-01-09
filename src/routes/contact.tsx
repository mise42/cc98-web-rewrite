import { createFileRoute } from '@tanstack/react-router'

/**
 * 联系我们
 */
export const Route = createFileRoute('/contact')({
  component: () => <div>联系我们（占位符）</div>,
})
