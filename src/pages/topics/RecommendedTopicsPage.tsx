import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Eye, User, Clock, Pin } from "lucide-react";
import { topicService } from "@/services/topic";
import { hasStatus } from "@/services/client";
import type { IRandomRecommendation } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ErrorState } from "@/components/ui/error-state";

export function RecommendedTopicsPage() {
  const {
    data: recommendations,
    isLoading,
    error,
    refetch,
  } = useQuery<IRandomRecommendation[]>({
    queryKey: ["topics", "recommended"],
    queryFn: () => topicService.getRecommendedTopics(),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // 不重试 401/403 错误
      if (hasStatus(error) && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (isLoading) {
    return <RecommendedTopicsSkeleton />;
  }

  if (error) {
    return <ErrorState error={error as Error} retry={() => refetch()} />;
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">暂无精选帖子</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-foreground">精选帖子</h1>
        <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
          推荐阅读
        </Badge>
      </div>

      <Card className="shadow-md bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recommendations.map((item) => (
              <TopicItem key={item.topic.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TopicItemProps {
  item: IRandomRecommendation;
}

function TopicItem({ item }: TopicItemProps) {
  const { topic, content } = item;
  const isTop = topic.topState > 0;
  const isBest = topic.bestState > 0;

  return (
    <Link
      to="/topic/$topicId"
      params={{ topicId: String(topic.id) }}
      className="flex flex-col px-6 py-4 hover:bg-muted/30 transition-colors group gap-2"
    >
      <div className="flex items-center justify-between">
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
              {topic.isAnonymous ? "匿名用户" : topic.userName}
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
      </div>
      {content && <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>}
    </Link>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "未知时间";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "无效时间";
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
  } catch {
    return "未知时间";
  }
}

function RecommendedTopicsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-32 h-8 rounded" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}
