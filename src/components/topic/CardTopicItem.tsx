import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { User, Clock, Pin, Star, Play, FileText, MessageSquare, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { ITopic } from '@/types/api'
import { getBoardNameById } from '@/lib/board-utils'

interface CardTopicItemProps {
  topic: ITopic
}

export function CardTopicItem({ topic }: CardTopicItemProps) {
  const isTop = topic.topState > 0
  const isBest = topic.bestState > 0
  const hasMedia = topic.contentType && topic.contentType >= 2 && topic.contentType <= 4
  const isImage = topic.contentType === 4
  const isVideo = topic.contentType === 2
  const isAudio = topic.contentType === 3
  const boardName = topic.boardName || getBoardNameById(topic.boardId)

  // 获取内容预览（用于媒体帖子）
  const contentPreview = topic.content
    ? topic.content.length > 100
      ? topic.content.substring(0, 100) + '...'
      : topic.content
    : null

  // 获取缩略图
  const thumbnail =
    hasMedia && topic.mediaContent?.thumbnail && topic.mediaContent.thumbnail.length > 0
      ? topic.mediaContent.thumbnail[0]
      : null

  return (
    <Link
      to="/topic/$topicId"
      params={{ topicId: String(topic.id) }}
      className="block p-4 bg-card hover:bg-muted/30 transition-colors rounded-lg border border-border h-full flex flex-col"
    >
      {/* 标题和标签 */}
      <div className="mb-3">
        <div className="flex items-start gap-2 mb-2">
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0 h-5 shrink-0 hover:bg-primary/10 transition-colors"
          >
            {boardName}
          </Badge>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">{topic.title}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isTop && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                <Pin className="w-3 h-3 mr-0.5" />
                置顶
              </Badge>
            )}
            {isBest && (
              <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Star className="w-3 h-3 mr-0.5" />
                精华
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 内容预览区域 */}
      <div className="mb-3 flex-1">
        {hasMedia && thumbnail ? (
          // 媒体内容：显示缩略图
          <>
            {contentPreview && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{contentPreview}</p>
            )}
            <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
              {isImage ? (
                <img
                  src={thumbnail}
                  alt={topic.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                  <Play className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {(isVideo || isAudio) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-foreground ml-1" />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // 纯文本内容：不显示预览区域，只留空白
          <div className="w-full h-24 flex items-center justify-center border border-dashed border-muted-foreground/30 rounded-lg">
            <div className="text-center text-muted-foreground text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              纯文本讨论
            </div>
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {topic.isAnonymous ? '匿名用户' : topic.userName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(topic.time), { addSuffix: true, locale: zhCN })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(topic.lastPostTime), { addSuffix: true, locale: zhCN })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {topic.replyCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {topic.hitCount}
          </span>
        </div>
      </div>
    </Link>
  )
}
