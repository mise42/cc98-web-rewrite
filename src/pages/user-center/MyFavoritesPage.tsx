import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Eye, Clock } from "lucide-react";
import { topicService } from "@/services/topic";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const PAGE_SIZE = 10;

export function MyFavoritesPage() {
  const params = useParams({ from: "/_authenticated/usercenter/favorites/$page" });
  const page = Number(params.page) || 1;
  const from = (page - 1) * PAGE_SIZE;

  const {
    data: favoriteTopics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topic", "me", "favorite", page],
    queryFn: () => topicService.getFavoriteTopics(from, PAGE_SIZE + 1),
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return <MyFavoritesSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">加载失败</p>
      </div>
    );
  }

  const hasMore = favoriteTopics && favoriteTopics.length > PAGE_SIZE;
  const displayTopics = hasMore ? favoriteTopics.slice(0, PAGE_SIZE) : favoriteTopics;

  if (!displayTopics || displayTopics.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">暂无收藏主题</div>;
  }

  return (
    <div className="space-y-3">
      {displayTopics.map((topic) => (
        <Card key={topic.id} className="shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <Link
              to="/topic/$topicId"
              params={{ topicId: String(topic.id) }}
              className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {topic.title}
            </Link>

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                {format(new Date(topic.lastPostTime || topic.time), "yyyy-MM-dd HH:mm", {
                  locale: zhCN,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {page > 1 && (
        <Link
          to="/usercenter/favorites/$page"
          params={{ page: String(page - 1) }}
          className="block text-center text-sm text-muted-foreground hover:text-foreground py-2"
        >
          ← 上一页
        </Link>
      )}

      {hasMore && (
        <Link
          to="/usercenter/favorites/$page"
          params={{ page: String(page + 1) }}
          className="block text-center text-sm text-muted-foreground hover:text-foreground py-2"
        >
          下一页 →
        </Link>
      )}
    </div>
  );
}

function MyFavoritesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
