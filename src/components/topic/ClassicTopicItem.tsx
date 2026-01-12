import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Eye, User, Clock, Pin, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { ITopic } from '@/types/api'
import { getBoardNameById } from '@/lib/board-utils'

interface ClassicTopicItemProps {
  topic: ITopic
}

export function ClassicTopicItem({ topic }: ClassicTopicItemProps) {
  const isTop = topic.topState > 0
  const isBest = topic.bestState > 0
  const boardName = getBoardNameById(topic.boardId)

  return (
    <Link
      to="/topic/$topicId"
      params={{ topicId: String(topic.id) }}
      className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 shrink-0 hover:bg-primary/10 transition-colors"
          >
            {boardName}
          </Badge>
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
            发帖：{formatDistanceToNow(new Date(topic.time), { addSuffix: true, locale: zhCN })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            回复：
            {formatDistanceToNow(new Date(topic.lastPostTime), { addSuffix: true, locale: zhCN })}
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
