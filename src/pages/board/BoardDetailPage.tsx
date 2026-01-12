import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageSquare, User, Pin, Star, Lock } from 'lucide-react'
import { boardService } from '@/services/board'
import { TopicViewModeSelector } from '@/components/topic/TopicViewModeSelector'
import { ViewModeToggle } from '@/components/topic/ViewModeToggle'
import { ClassicTopicItem } from '@/components/topic/ClassicTopicItem'
import { CardTopicItem } from '@/components/topic/CardTopicItem'
import { PaginationControls } from '@/components/common/PaginationControls'
import { InfiniteScrollTrigger } from '@/components/common/InfiniteScrollTrigger'
import type { IBoard, ITopic } from '@/types/api'
import { ErrorState } from '@/components/ui/error-state'
import { useTopicViewModeStore } from '@/stores/topic-view-mode'
import { useBoardTopicsViewStore } from '@/stores/board-topics-view'

const PAGE_SIZE = 20

export function BoardDetailPage() {
  const { boardId } = useParams({ from: '/board/$boardId' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // 从 URL 读取查询参数
  const search = useSearch({ from: '/board/$boardId' })
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
  } = useBoardTopicsViewStore()

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
      to: '/board/$boardId',
      params: { boardId },
      search: { page, mode },
    })
  }

  const {
    data: board,
    isLoading: boardLoading,
    error: boardError,
    refetch: refetchBoard,
  } = useQuery<IBoard>({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getBoard(boardId),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        return false
      }
      return failureCount < 3
    },
  })

  // 分页模式：获取当前页的帖子
  const {
    data: pagedTopics,
    isLoading: pagedLoading,
    error: pagedError,
  } = useQuery<ITopic[]>({
    queryKey: ['board', boardId, 'topics', 'pagination', currentPage],
    queryFn: () => boardService.getBoardTopics(boardId, currentPage, PAGE_SIZE),
    enabled: viewMode === 'pagination' && !!board,
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
    queryKey: ['board', boardId, 'topics', 'infinite', 'initial'],
    queryFn: async () => {
      const data = await boardService.getBoardTopics(boardId, 1, PAGE_SIZE)
      if (allTopics.length === 0) {
        setAllTopics(data)
        setHasMore(data.length === PAGE_SIZE)
      }
      return data
    },
    enabled: viewMode === 'infinite' && !!board && allTopics.length === 0,
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
      const page = Math.floor(allTopics.length / PAGE_SIZE) + 1
      const newTopics = await boardService.getBoardTopics(boardId, page, PAGE_SIZE)
      appendTopics(newTopics)
      setHasMore(newTopics.length === PAGE_SIZE)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 处理模式切换
  const handleModeChange = (mode: 'pagination' | 'infinite') => {
    setViewMode(mode)
    resetTopics()
    // 清除查询缓存
    queryClient.invalidateQueries({ queryKey: ['board', boardId, 'topics'] })
    updateURL(1, mode)
  }

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL(page, viewMode)
  }

  const handleRetry = () => {
    if (boardError) refetchBoard()
    queryClient.invalidateQueries({ queryKey: ['board', boardId, 'topics'] })
  }

  // 加载状态
  const isLoading =
    boardLoading || (!!board && (viewMode === 'pagination' ? pagedLoading : initialLoading))
  const error = boardError || (viewMode === 'pagination' ? pagedError : initialError)

  // 根据显示模式过滤帖子
  const filterTopics = (topics: ITopic[] | undefined) => {
    const topicList = topics || []
    if (displayMode === 'media-only') {
      return topicList.filter(
        topic => topic.contentType && topic.contentType >= 2 && topic.contentType <= 4
      )
    }
    return topicList
  }

  // 分页模式使用过滤后的帖子
  const filteredPagedTopics = useMemo(() => filterTopics(pagedTopics), [pagedTopics, displayMode])
  // 无限滚动模式使用过滤后的帖子
  const filteredAllTopics = useMemo(() => filterTopics(allTopics), [allTopics, displayMode])

  const topics = viewMode === 'pagination' ? filteredPagedTopics : filteredAllTopics

  if (isLoading) {
    return <BoardDetailSkeleton />
  }

  if (error) {
    return <ErrorState error={error as Error} retry={handleRetry} />
  }

  if (!board) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">版块不存在</div>
      </div>
    )
  }

  const totalCount = board.topicCount || 0
  const isGridLayout = displayMode === 'card' || displayMode === 'media-only'

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="mb-6">
        <Link
          to="/boardlist"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回版面列表
        </Link>

        <Card className="shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {board.name}
                  {board.isLock && <Lock className="w-5 h-5 text-muted-foreground" />}
                </CardTitle>
                {board.description && (
                  <p className="text-muted-foreground mt-2">{board.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{board.topicCount}</div>
                    <div className="text-xs text-muted-foreground">主题</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{board.postCount}</div>
                    <div className="text-xs text-muted-foreground">帖子</div>
                  </div>
                  {board.todayCount > 0 && (
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      今日 +{board.todayCount}
                    </Badge>
                  )}
                </div>
                <TopicViewModeSelector />
                <ViewModeToggle mode={viewMode} onModeChange={handleModeChange} />
              </div>
            </div>
            {board.boardMasters && board.boardMasters.length > 0 && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>版主：{board.boardMasters.join(', ')}</span>
              </div>
            )}
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            帖子列表
            {displayMode === 'media-only' && (
              <Badge variant="secondary" className="ml-2">
                只看媒体
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topics.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {displayMode === 'media-only' ? '本版块暂无媒体帖子' : '暂无帖子'}
            </div>
          ) : (
            <>
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
              {viewMode === 'pagination' ? (
                <PaginationControls
                  currentPage={currentPage}
                  totalCount={totalCount}
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
                  message="没有更多帖子了"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function BoardDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <Skeleton className="w-32 h-6 mb-4 rounded" />
      <Skeleton className="h-40 w-full rounded-lg mb-6" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}
