import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
  currentCount: number
  message?: string
}

/**
 * 通用无限滚动触发器组件
 *
 * 使用 IntersectionObserver API 在元素进入视口前 200px 时触发加载
 *
 * @param onLoadMore - 加载更多的回调函数
 * @param hasMore - 是否还有更多数据
 * @param isLoadingMore - 是否正在加载中
 * @param currentCount - 当前已加载的数量
 * @param message - 完成时显示的自定义消息（可选）
 */
export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  isLoadingMore,
  currentCount,
  message,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // 如果没有更多数据或正在加载，不设置观察者
    if (!hasMore || isLoadingMore) return

    // 创建 Intersection Observer
    observerRef.current = new IntersectionObserver(
      entries => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore()
        }
      },
      {
        root: null, // 相对于视口
        rootMargin: '200px', // 提前200px触发
        threshold: 0.1, // 10%可见度触发
      }
    )

    // 开始观察触发元素
    const currentTrigger = triggerRef.current
    if (currentTrigger && observerRef.current) {
      observerRef.current.observe(currentTrigger)
    }

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, onLoadMore])

  // 如果没有更多数据，显示完成信息
  if (!hasMore && currentCount > 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{message || `已加载全部 ${currentCount} 条`}</p>
      </div>
    )
  }

  // 显示加载中状态
  if (isLoadingMore) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">加载中...</span>
      </div>
    )
  }

  // 触发元素（不可见）
  return <div ref={triggerRef} className="h-1" />
}
