import { useEffect, useRef } from 'react'
import { useTopicViewStore } from '@/stores/topic-view'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void
  totalCount: number
}

export function InfiniteScrollTrigger({ onLoadMore, totalCount }: InfiniteScrollTriggerProps) {
  const { allPosts, hasMore, isLoadingMore } = useTopicViewStore()
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
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
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
  if (!hasMore && allPosts.length > 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>已加载全部 {allPosts.length} 条回复</p>
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
