import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Clock, Loader2 } from 'lucide-react'
import { topicService } from '@/services/topic'
import { TopicViewModeSelector } from '@/components/topic/TopicViewModeSelector'
import { ViewModeToggle } from '@/components/topic/ViewModeToggle'
import { ClassicTopicItem } from '@/components/topic/ClassicTopicItem'
import { CardTopicItem } from '@/components/topic/CardTopicItem'
import { PaginationControls } from '@/components/common/PaginationControls'
import { InfiniteScrollTrigger } from '@/components/common/InfiniteScrollTrigger'
import type { ITopic } from '@/types/api'
import { useTopicViewModeStore } from '@/stores/topic-view-mode'
import { useNewTopicsViewStore } from '@/stores/new-topics-view'
import { ErrorState } from '@/components/ui/error-state'

const PAGE_SIZE = 20
const MAX_TOPICS = 500

export function NewTopicsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // 从 URL 读取查询参数
  const search = useSearch({ from: '/newtopics' })
  const urlPage = search.page
  const urlMode = search.mode

  // 显示模式（classic/card/media-only）
  const displayMode = useTopicViewModeStore(state => state.mode)

  // 视图模式（pagination/infinite）
  const {
    viewMode,
    currentPage,
    allTopics,
    hasMore,
    isLoadingMore,
    setViewMode,
    setCurrentPage,
    setAllTopics,
    appendTopics,
    setHasMore,
    setIsLoadingMore,
    resetTopics,
  } = useNewTopicsViewStore()

  // 同步 URL 状态到 store（仅初始化时）
  useEffect(() => {
    if (urlMode !== viewMode) {
      setViewMode(urlMode)
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage)
    }
  }, [])

  // 更新 URL 的辅助函数
  const updateURL = (page: number, mode: 'pagination' | 'infinite') => {
    navigate({
      to: '/newtopics',
      search: { page, mode },
    })
  }

  // 分页模式：获取当前页的帖子
  const {
    data: pagedTopics,
    isLoading: pagedLoading,
    error: pagedError,
  } = useQuery<ITopic[]>({
    queryKey: ['topics', 'new', 'pagination', currentPage, displayMode],
    queryFn: async () => {
      const from = (currentPage - 1) * PAGE_SIZE
      if (displayMode === 'media-only') {
        return topicService.getNewMediaTopics(from, PAGE_SIZE)
      } else {
        return topicService.getNewTopics(from, PAGE_SIZE)
      }
    },
    enabled: viewMode === 'pagination',
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        return false
      }
      return failureCount < 3
    },
  })

  // 无限滚动模式：初始加载
  const { isLoading: initialLoading, error: initialError } = useQuery<ITopic[]>({
    queryKey: ['topics', 'new', 'infinite', 'initial', displayMode],
    queryFn: async () => {
      if (displayMode === 'media-only') {
        const data = await topicService.getNewMediaTopics(0, PAGE_SIZE)
        if (allTopics.length === 0) {
          setAllTopics(data)
          setHasMore(data.length === PAGE_SIZE)
        }
        return data
      } else {
        const data = await topicService.getNewTopics(0, PAGE_SIZE)
        if (allTopics.length === 0) {
          setAllTopics(data)
          setHasMore(data.length === PAGE_SIZE)
        }
        return data
      }
    },
    enabled: viewMode === 'infinite' && allTopics.length === 0,
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        return false
      }
      return failureCount < 3
    },
  })

  // 无限滚动模式：加载更多
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const from = allTopics.length
      let newTopics: ITopic[]

      if (displayMode === 'media-only') {
        newTopics = await topicService.getNewMediaTopics(from, PAGE_SIZE)
      } else {
        newTopics = await topicService.getNewTopics(from, PAGE_SIZE)
      }

      appendTopics(newTopics)
      setHasMore(newTopics.length === PAGE_SIZE && allTopics.length + newTopics.length < MAX_TOPICS)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 处理模式切换
  const handleModeChange = (mode: 'pagination' | 'infinite') => {
    setViewMode(mode)
    resetTopics()
    // 清除查询缓存
    queryClient.invalidateQueries({ queryKey: ['topics', 'new'] })
    updateURL(1, mode)
  }

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL(page, viewMode)
  }

  // 加载状态
  const isLoading = viewMode === 'pagination' ? pagedLoading : initialLoading
  const error = viewMode === 'pagination' ? pagedError : initialError
  const topics = viewMode === 'pagination' ? (pagedTopics ?? []) : allTopics

  if (isLoading) {
    return <NewTopicsSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        error={error as Error}
        retry={() => queryClient.invalidateQueries({ queryKey: ['topics', 'new'] })}
      />
    )
  }

  if (topics.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">
          {displayMode === 'media-only' ? '暂无媒体帖子' : '暂无新帖'}
        </div>
      </div>
    )
  }

  const isGridLayout = displayMode === 'card' || displayMode === 'media-only'

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">新帖</h1>
        <Badge variant="secondary" className="text-xs">
          最新发布
        </Badge>
        {displayMode === 'media-only' && (
          <Badge variant="outline" className="text-xs ml-2">
            只看媒体
          </Badge>
        )}
        <div className="flex items-center gap-4 ml-auto">
          <span className="text-sm text-muted-foreground">已加载 {topics.length} 条</span>
          <TopicViewModeSelector />
          <ViewModeToggle mode={viewMode} onModeChange={handleModeChange} />
        </div>
      </div>

      <Card className="shadow-md bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {isGridLayout ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {topics.map(topic => (
                <CardTopicItem key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topics.map(topic => (
                <ClassicTopicItem key={topic.id} topic={topic} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {viewMode === 'pagination' ? (
        <PaginationControls
          currentPage={currentPage}
          totalCount={MAX_TOPICS}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
          scrollToTop={true}
        />
      ) : (
        <InfiniteScrollTrigger
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          currentCount={allTopics.length}
          message={
            allTopics.length >= MAX_TOPICS ? `已达到最大加载数量 ${MAX_TOPICS} 条` : undefined
          }
        />
      )}
    </div>
  )
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
