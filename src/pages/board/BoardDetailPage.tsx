import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageSquare, Eye, Clock, User, Pin, Star, Lock } from 'lucide-react'
import { boardService } from '@/services/board'
import type { IBoard, ITopic } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ErrorState } from '@/components/ui/error-state'

export function BoardDetailPage() {
  const { boardId } = useParams({ from: '/board/$boardId' })

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
      // 不重试 401/403 错误
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        return false
      }
      return failureCount < 3
    },
  })

  const {
    data: topicsData,
    isLoading: topicsLoading,
    error: topicsError,
    refetch: refetchTopics,
  } = useQuery({
    queryKey: ['board', boardId, 'topics'],
    queryFn: () => boardService.getBoardTopics(boardId, 1, 20),
    staleTime: 1000 * 60,
    enabled: !!board, // 只有获取到版面信息后才加载帖子
    retry: (failureCount, error) => {
      // 不重试 401/403 错误
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        return false
      }
      return failureCount < 3
    },
  })

  const isLoading = boardLoading || (!!board && topicsLoading)
  const error = boardError || topicsError

  const handleRetry = () => {
    if (boardError) refetchBoard()
    if (topicsError) refetchTopics()
  }

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

  const topics = topicsData?.list || []

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
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {board.name}
                  {board.isLock && <Lock className="w-5 h-5 text-muted-foreground" />}
                </CardTitle>
                {board.description && (
                  <p className="text-muted-foreground mt-2">{board.description}</p>
                )}
              </div>
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
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topics.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">暂无帖子</div>
          ) : (
            <div className="divide-y divide-border">
              {topics.map(topic => (
                <TopicItem key={topic.id} topic={topic} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
            {formatDistanceToNow(new Date(topic.time), { addSuffix: true, locale: zhCN })}
          </span>
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

function BoardDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <Skeleton className="w-32 h-6 mb-4 rounded" />
      <Skeleton className="h-40 w-full rounded-lg mb-6" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}
