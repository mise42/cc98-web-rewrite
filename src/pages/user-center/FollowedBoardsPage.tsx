import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid } from 'lucide-react'
import { TopicViewModeSelector } from '@/components/topic/TopicViewModeSelector'
import { ViewModeToggle } from '@/components/topic/ViewModeToggle'
import { ClassicTopicItem } from '@/components/topic/ClassicTopicItem'
import { CardTopicItem } from '@/components/topic/CardTopicItem'
import { PaginationControls } from '@/components/common/PaginationControls'
import { InfiniteScrollTrigger } from '@/components/common/InfiniteScrollTrigger'
import { ErrorState } from '@/components/ui/error-state'
import { userService } from '@/services/user'
import { boardService } from '@/services/board'
import type { ITopic } from '@/types/api'
import { useTopicViewModeStore } from '@/stores/topic-view-mode'
import { useFollowedBoardsViewStore } from '@/stores/followed-boards-view'

const PAGE_SIZE = 20
const MAX_TOPICS = 500

function isMediaTopic(topic: ITopic): boolean {
  return typeof topic.contentType === 'number' && topic.contentType >= 2 && topic.contentType <= 4
}

export function FollowedBoardsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const search = useSearch({ from: '/_authenticated/following/boards' })
  const urlPage = search.page
  const urlMode = search.mode
  const displayMode = useTopicViewModeStore(state => state.mode)
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
  } = useFollowedBoardsViewStore()

  useEffect(() => {
    if (urlMode !== viewMode) {
      setViewMode(urlMode)
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage)
    }
  }, [urlMode, viewMode, setViewMode, urlPage, currentPage, setCurrentPage])

  const updateURL = (page: number, mode: 'pagination' | 'infinite') => {
    navigate({
      to: '/following/boards',
      search: { page, mode },
    })
  }

  const { data: userInfo, isLoading: userLoading } = useQuery({
    queryKey: ['user', 'me', 'info'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
  })

  const {
    data: pagedTopics,
    isLoading: pagedLoading,
    error: pagedError,
  } = useQuery({
    queryKey: ['user', 'me', 'custom-board-topics', 'following-boards', 'pagination', currentPage],
    queryFn: () => boardService.getFollowedBoardTopics((currentPage - 1) * PAGE_SIZE, PAGE_SIZE),
    enabled: viewMode === 'pagination',
    staleTime: 1000 * 60,
  })

  const { isLoading: initialLoading, error: initialError } = useQuery({
    queryKey: ['user', 'me', 'custom-board-topics', 'following-boards', 'infinite', 'initial'],
    queryFn: async () => {
      const data = await boardService.getFollowedBoardTopics(0, PAGE_SIZE)
      if (allTopics.length === 0) {
        setAllTopics(data)
        setHasMore(data.length === PAGE_SIZE)
      }
      return data
    },
    enabled: viewMode === 'infinite' && allTopics.length === 0,
    staleTime: 1000 * 60,
  })

  const boardIds = userInfo?.customBoards ?? []
  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ['boards', 'followed', boardIds],
    queryFn: () => Promise.all(boardIds.map(id => boardService.getBoard(String(id)))),
    enabled: boardIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  const boardNameMap = useMemo(
    () => new Map((boards ?? []).map(board => [board.id, board.name])),
    [boards]
  )

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const from = allTopics.length
      const newTopics = await boardService.getFollowedBoardTopics(from, PAGE_SIZE)
      appendTopics(newTopics)
      setHasMore(newTopics.length === PAGE_SIZE && allTopics.length + newTopics.length < MAX_TOPICS)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleModeChange = (mode: 'pagination' | 'infinite') => {
    setViewMode(mode)
    resetTopics()
    queryClient.invalidateQueries({
      queryKey: ['user', 'me', 'custom-board-topics', 'following-boards'],
    })
    updateURL(1, mode)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL(page, viewMode)
  }

  const isLoading = userLoading || (viewMode === 'pagination' ? pagedLoading : initialLoading)
  const error = viewMode === 'pagination' ? pagedError : initialError
  const topics = useMemo(
    () => (viewMode === 'pagination' ? (pagedTopics ?? []) : allTopics),
    [viewMode, pagedTopics, allTopics]
  )

  const topicsWithBoardName = useMemo(
    () =>
      topics.map(topic => ({
        ...topic,
        boardName: topic.boardName || boardNameMap.get(topic.boardId),
      })),
    [topics, boardNameMap]
  )

  const displayTopics =
    displayMode === 'media-only' ? topicsWithBoardName.filter(isMediaTopic) : topicsWithBoardName

  if (isLoading) {
    return <FollowedBoardsSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        error={error as Error}
        retry={() =>
          queryClient.invalidateQueries({
            queryKey: ['user', 'me', 'custom-board-topics', 'following-boards'],
          })
        }
      />
    )
  }

  const isGridLayout = displayMode === 'card' || displayMode === 'media-only'

  return (
    <div className="space-y-6">
      <Card className="shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">我关注的版面</CardTitle>
        </CardHeader>
        <CardContent>
          {boardsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : !boards || boards.length === 0 ? (
            <div className="text-sm text-muted-foreground">暂未关注任何版面</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {boards.map(board => (
                <Link key={board.id} to="/board/$boardId" params={{ boardId: String(board.id) }}>
                  <Badge
                    variant="secondary"
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    {board.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            关注版面动态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">已加载 {displayTopics.length} 条</span>
            <div className="ml-auto flex items-center gap-3">
              <TopicViewModeSelector />
              <ViewModeToggle mode={viewMode} onModeChange={handleModeChange} />
            </div>
          </div>

          {displayTopics.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {displayMode === 'media-only' ? '暂无媒体帖子' : '暂无动态'}
            </div>
          ) : (
            <div
              className={
                isGridLayout ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'divide-y divide-border'
              }
            >
              {displayTopics.map(topic =>
                isGridLayout ? (
                  <CardTopicItem key={topic.id} topic={topic} />
                ) : (
                  <ClassicTopicItem key={topic.id} topic={topic} />
                )
              )}
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

function FollowedBoardsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
