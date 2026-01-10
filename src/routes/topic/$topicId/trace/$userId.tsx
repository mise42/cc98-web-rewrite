import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

/**
 * 追踪特定用户的帖子路由（已废弃，保留用于向后兼容）
 * URL: /topic/$topicId/trace/$userId
 *
 * 注意：此路由已废弃，追踪功能现在通过postId实现，而不是userId
 * 建议直接在主题页面中使用"追踪"按钮
 */
export const Route = createFileRoute('/topic/$topicId/trace/$userId')({
  component: TraceRedirect,
})

function TraceRedirect() {
  const { topicId } = Route.useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // 直接重定向到主主题页面
    // 追踪功能现在通过页面内的"追踪"按钮实现
    navigate({
      to: '/topic/$topicId',
      params: { topicId },
    })
  }, [navigate, topicId])

  // 显示加载状态
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="text-center text-muted-foreground">正在加载...</div>
    </div>
  )
}
