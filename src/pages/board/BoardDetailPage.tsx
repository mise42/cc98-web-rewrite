import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageSquare, User, Pin, Star, Lock, PenLine } from 'lucide-react'
import { boardService } from '@/services/board'
import { useAuth } from '@/hooks/useAuth'
import { TopicViewModeSelector } from '@/components/topic/TopicViewModeSelector'
import { ViewModeToggle } from '@/components/topic/ViewModeToggle'
import { ClassicTopicItem } from '@/components/topic/ClassicTopicItem'
import { CardTopicItem } from '@/components/topic/CardTopicItem'
import { PaginationControls } from '@/components/common/PaginationControls'
import { InfiniteScrollTrigger } from '@/components/common/InfiniteScrollTrigger'
import type { IBoard, ITopic, IPost } from '@/types/api'
import { ErrorState } from '@/components/ui/error-state'
import { useTopicViewModeStore } from '@/stores/topic-view-mode'
import { useBoardTopicsViewStore } from '@/stores/board-topics-view'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { toast } from 'sonner'

const PAGE_SIZE = 20

export function BoardDetailPage() {
  const { boardId } = useParams({ from: '/board/$boardId' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  // 从 URL 读取查询参数
  const search = useSearch({ from: '/board/$boardId' })
  const urlPage = search.page
  const urlMode = search.mode
  const activeTab = search.tab ?? 'topics'

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
      search: { page, mode, tab: activeTab },
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

  const followBoardMutation = useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      const numericBoardId = Number(boardId)
      if (shouldFollow) {
        await boardService.followBoard(numericBoardId)
      } else {
        await boardService.unfollowBoard(numericBoardId)
      }
    },
    onMutate: async shouldFollow => {
      await queryClient.cancelQueries({ queryKey: ['board', boardId] })
      const previousBoard = queryClient.getQueryData<IBoard>(['board', boardId])
      queryClient.setQueryData<IBoard>(['board', boardId], old =>
        old ? { ...old, isUserCustomBoard: shouldFollow } : old
      )
      return { previousBoard }
    },
    onError: (error, _shouldFollow, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', boardId], context.previousBoard)
      }
      toast.error(error instanceof Error ? error.message : '操作失败，请稍后重试')
    },
    onSuccess: (_data, shouldFollow) => {
      toast.success(shouldFollow ? '已关注版面' : '已取消关注版面')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      await queryClient.invalidateQueries({ queryKey: ['user', 'me', 'info'] })
      await queryClient.invalidateQueries({ queryKey: ['user', 'me', 'custom-board-topics'] })
    },
  })

  // 精华区
  const {
    data: essenceTopics,
    isLoading: essenceLoading,
    error: essenceError,
  } = useQuery<IPost[]>({
    queryKey: ['board', boardId, 'essence'],
    queryFn: () => boardService.getEssenceTopics(boardId),
    enabled: activeTab === 'essence' && !!board,
    staleTime: 1000 * 60 * 5,
    retry: false,
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
                {isAuthenticated && (
                  <>
                    <Button
                      size="sm"
                      variant={(board.isUserCustomBoard ?? false) ? 'outline' : 'default'}
                      onClick={() =>
                        followBoardMutation.mutate(!(board.isUserCustomBoard ?? false))
                      }
                      disabled={followBoardMutation.isPending}
                    >
                      {followBoardMutation.isPending
                        ? '处理中...'
                        : (board.isUserCustomBoard ?? false)
                          ? '已关注版面'
                          : '关注版面'}
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        navigate({ to: '/new-topic', search: { boardId } })
                      }
                    >
                      <PenLine className="w-4 h-4" />
                      发帖
                    </Button>
                  </>
                )}
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

      <div className="flex gap-2 mb-4">
        {[
          { key: 'topics', label: '帖子列表', icon: MessageSquare },
          { key: 'essence', label: '精华区', icon: Star },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() =>
              navigate({
                to: '/board/$boardId',
                params: { boardId },
                search: { page: 1, mode: viewMode, tab: key as 'topics' | 'essence' },
              })
            }
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* 精华区 */}
      {activeTab === 'essence' && (
        <Card className="shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              精华区
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {essenceLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : essenceError ? (
              <div className="p-8 text-center text-muted-foreground">
                本版块暂未开放精华区
              </div>
            ) : !essenceTopics || essenceTopics.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">本版块暂无精华帖子</div>
            ) : (
              <div className="divide-y divide-border">
                {essenceTopics.map(post => (
                  <Link
                    key={post.id}
                    to="/topic/$topicId"
                    params={{ topicId: String(post.topicId) }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
                  >
                    <Star className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {post.title || '无标题'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                        <span>{post.isAnonymous ? '匿名用户' : post.userName}</span>
                        <span>{format(new Date(post.time), 'yyyy-MM-dd', { locale: zhCN })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 普通帖子列表 */}
      {activeTab === 'topics' && (
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
      )}
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
