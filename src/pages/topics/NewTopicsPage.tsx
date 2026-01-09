import { useCallback, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Clock, MessageSquare, Eye, User, Pin, Star, Loader2 } from 'lucide-react'
import { topicService } from '@/services/topic'
import type { ITopic } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import { ErrorState } from '@/components/ui/error-state'

const PAGE_SIZE = 20
const MAX_TOPICS = 500

export function NewTopicsPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['topics', 'new'],
      queryFn: async ({ pageParam = 0 }) => {
        return topicService.getNewTopics(pageParam, PAGE_SIZE)
      },
      getNextPageParam: (lastPage, allPages) => {
        const totalLoaded = allPages.flat().length
        if (lastPage.length < PAGE_SIZE || totalLoaded >= MAX_TOPICS) {
          return undefined
        }
        return totalLoaded
      },
      initialPageParam: 0,
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        // 不重试 401/403 错误
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
          return false
        }
        return failureCount < 3
      },
    })

  const handleScroll = useCallback(() => {
    if (!loadMoreRef.current || isFetchingNextPage || !hasNextPage) return

    const rect = loadMoreRef.current.getBoundingClientRect()
    const isVisible = rect.top <= window.innerHeight + 200

    if (isVisible) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (isLoading) {
    return <NewTopicsSkeleton />
  }

  if (error) {
    return <ErrorState error={error as Error} retry={() => refetch()} />
  }

  const topics = data?.pages.flat() ?? []

  if (topics.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">暂无新帖</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">新帖</h1>
        <Badge variant="secondary" className="text-xs">
          最新发布
        </Badge>
        <span className="text-sm text-muted-foreground ml-auto">已加载 {topics.length} 条</span>
      </div>

      <Card className="shadow-md bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {topics.map(topic => (
              <TopicItem key={topic.id} topic={topic} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>加载更多...</span>
          </div>
        ) : hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-md transition-colors"
          >
            加载更多
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">
            {topics.length >= MAX_TOPICS ? '已达到最大加载数量' : '没有更多了'}
          </span>
        )}
      </div>
    </div>
  )
}

interface TopicItemProps {
  topic: ITopic
}

function TopicItem({ topic }: TopicItemProps) {
  const isTop = topic.topState > 0
  const isBest = topic.bestState > 0

  return (
    <Link
      to="/topic/$topicId"
      params={{ topicId: String(topic.id) }}
      className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isTop && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              <Pin className="w-3 h-3 mr-0.5" />
              置顶
            </Badge>
          )}
          {isBest && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Star className="w-3 h-3 mr-0.5" />
              精华
            </Badge>
          )}
          <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {topic.title}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {topic.isAnonymous ? '匿名用户' : topic.userName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(topic.time)}
          </span>
          {topic.boardName && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              {topic.boardName}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0 ml-4">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          <span>{topic.replyCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{topic.hitCount}</span>
        </div>
      </div>
    </Link>
  )
}

function formatDate(dateStr: string) {
  if (!dateStr) return '未知时间'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '无效时间'
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
  } catch (e) {
    return '未知时间'
  }
}

function NewTopicsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-24 h-8 rounded" />
      </div>
      <Card className="shadow-md bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-6 py-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
