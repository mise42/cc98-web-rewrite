import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Eye, Clock, Folder } from 'lucide-react'
import { userService } from '@/services/user'
import { boardService } from '@/services/board'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const PAGE_SIZE = 10

export function MyTopicsPage() {
  const params = useParams({ from: '/_authenticated/usercenter/mytopics' })
  const page = Number(params.page) || 1
  const from = (page - 1) * PAGE_SIZE

  const {
    data: topics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', 'me', 'topics', page],
    queryFn: () => userService.getRecentTopics(from, PAGE_SIZE + 1),
    staleTime: 1000 * 60,
  })

  const boardIds = topics?.map(t => t.boardId) || []
  const { data: boards } = useQuery({
    queryKey: ['boards', 'batch', boardIds],
    queryFn: () => Promise.all(boardIds.map(id => boardService.getBoard(String(id)))),
    enabled: boardIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return <MyTopicsSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">加载失败</p>
      </div>
    )
  }

  const hasMore = topics && topics.length > PAGE_SIZE
  const displayTopics = hasMore ? topics.slice(0, PAGE_SIZE) : topics

  if (!displayTopics || displayTopics.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">暂无主题</div>
  }

  return (
    <div className="space-y-3">
      {displayTopics.map((topic, index) => {
        const board = boards?.find(b => b.id === topic.boardId)
        return (
          <TopicItem
            key={topic.id}
            topic={topic}
            boardName={board?.name || `版面 ${topic.boardId}`}
          />
        )
      })}

      {page > 1 && (
        <Link
          to="/usercenter/mytopics/$page"
          params={{ page: String(page - 1) }}
          className="block text-center text-sm text-muted-foreground hover:text-foreground py-2"
        >
          ← 上一页
        </Link>
      )}

      {hasMore && (
        <Link
          to="/usercenter/mytopics/$page"
          params={{ page: String(page + 1) }}
          className="block text-center text-sm text-muted-foreground hover:text-foreground py-2"
        >
          下一页 →
        </Link>
      )}
    </div>
  )
}

interface TopicItemProps {
  topic: any
  boardName: string
}

function TopicItem({ topic, boardName }: TopicItemProps) {
  return (
    <Card className="shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              to="/topic/$topicId"
              params={{ topicId: String(topic.id) }}
              className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {topic.title}
            </Link>

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" />
                {boardName}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {topic.replyCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {topic.hitCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(topic.lastPostTime || topic.time), 'yyyy-MM-dd HH:mm', {
                  locale: zhCN,
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MyTopicsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  )
}
