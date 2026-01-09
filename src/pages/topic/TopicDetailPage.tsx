import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Star,
} from 'lucide-react'
import { topicService } from '@/services/topic'
import { boardService } from '@/services/board'
import type { IPost, ITopic, IBoard } from '@/types/api'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { UbbContainer } from '@/components/UbbContainer'
import { Markdown } from '@/lib/ubb-modern/components/Markdown'

export function TopicDetailPage() {
  const { topicId } = useParams({ from: '/topic/$topicId' })
  const numericTopicId = parseInt(topicId, 10)

  const {
    data: topic,
    isLoading: topicLoading,
    error: topicError,
  } = useQuery<ITopic>({
    queryKey: ['topic', numericTopicId],
    queryFn: () => topicService.getTopic(numericTopicId),
    staleTime: 1000 * 60,
  })

  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery<IPost[]>({
    queryKey: ['topic', numericTopicId, 'posts'],
    queryFn: () => topicService.getTopicPosts(numericTopicId, 1, 20),
    staleTime: 1000 * 60,
  })

  const { data: board } = useQuery<IBoard>({
    queryKey: ['board', topic?.boardId],
    queryFn: () => boardService.getBoard(String(topic?.boardId)),
    enabled: !!topic?.boardId,
    staleTime: 1000 * 60 * 5,
  })

  const isLoading = topicLoading || postsLoading
  const error = topicError || postsError

  if (isLoading) {
    return <TopicDetailSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-4">加载失败</h2>
          <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
          <Link
            to="/boardlist"
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors inline-block"
          >
            返回版面列表
          </Link>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">帖子不存在</div>
      </div>
    )
  }

  const isTop = topic.topState > 0
  const isBest = topic.bestState > 0

  return (
    <div className="container mx-auto px-4 py-6 max-w-[900px]">
      <div className="mb-6">
        {board && (
          <Link
            to="/board/$boardId"
            params={{ boardId: String(board.id) }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回 {board.name}
          </Link>
        )}

        <Card className="shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              {isTop && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  <Pin className="w-3 h-3 mr-1" />
                  置顶
                </Badge>
              )}
              {isBest && (
                <Badge className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  精华
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-bold">{topic.title}</CardTitle>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {topic.isAnonymous ? '匿名用户' : topic.userName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(topic.time), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {topic.hitCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {topic.replyCount}
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post, index) => <PostItem key={post.id} post={post} floor={index + 1} />)
        ) : (
          <Card className="shadow-md bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center text-muted-foreground">暂无回复</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

interface PostItemProps {
  post: IPost
  floor: number
}

function PostItem({ post, floor }: PostItemProps) {
  return (
    <Card className="shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {post.isAnonymous ? '匿' : post.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-foreground">
                {post.isAnonymous ? '匿名用户' : post.userName}
                {post.isLZ && (
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 h-4">
                    楼主
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(post.time), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            #{floor}楼
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        {post.contentType === 1 ? (
          <Markdown>{post.content}</Markdown>
        ) : (
          <UbbContainer
            content={post.content}
            className="prose prose-sm dark:prose-invert max-w-none break-words [&_img]:max-w-full [&_img]:h-auto"
          />
        )}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-sm text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-primary transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span>{post.likeCount}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-destructive transition-colors">
            <ThumbsDown className="w-4 h-4" />
            <span>{post.dislikeCount}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function TopicDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[900px]">
      <Skeleton className="w-32 h-6 mb-4 rounded" />
      <Skeleton className="h-40 w-full rounded-lg mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
