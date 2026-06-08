import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Eye, Clock, Users, ArrowLeft } from "lucide-react";
import { apiClient } from "@/services/client";
import type { ITopic } from "@/types/api";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const PAGE_SIZE = 20;

async function getFolloweTopics(from: number, size: number): Promise<ITopic[]> {
  return apiClient.get<ITopic[]>(`/me/followee/topic?from=${from}&size=${size}`);
}

export function FollowingTopicsPage() {
  return <FollowingTopicsPageContent />;
}

interface FollowingTopicsPageContentProps {
  compact?: boolean;
}

export function FollowingTopicsPageContent({
  compact = false,
}: FollowingTopicsPageContentProps = {}) {
  const [page, setPage] = useState(1);
  const from = (page - 1) * PAGE_SIZE;

  const {
    data: topics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["me", "followee", "topics", page],
    queryFn: () => getFolloweTopics(from, PAGE_SIZE),
    staleTime: 1000 * 60,
  });

  // 用当前页数量判断是否还有更多（满 PAGE_SIZE 则尝试下一页）
  const hasMore = topics ? topics.length === PAGE_SIZE : false;

  const content = (
    <>
      {isLoading && <FollowingTopicsSkeleton />}

      {error && (
        <div className="text-center py-12 text-destructive">
          加载失败：{(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {!topics || topics.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无内容，先去关注一些感兴趣的用户吧</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← 上一页
            </Button>
            <span className="text-sm text-muted-foreground">第 {page} 页</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页 →
            </Button>
          </div>
        </>
      )}
    </>
  );

  if (compact) {
    return content;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[900px]">
      <div className="mb-5 flex items-center gap-3">
        <Link
          to="/usercenter"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          个人中心
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          关注用户的帖子
        </h1>
      </div>
      {content}
    </div>
  );
}

function TopicCard({ topic }: { topic: ITopic }) {
  return (
    <Card className="shadow-sm bg-card/50 backdrop-blur-sm hover:bg-muted/20 transition-colors">
      <CardContent className="p-4">
        <Link
          to="/topic/$topicId"
          params={{ topicId: String(topic.id) }}
          className="block font-medium text-foreground hover:text-primary transition-colors line-clamp-2 mb-2"
        >
          {topic.title}
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{topic.isAnonymous ? "匿名用户" : topic.userName}</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {topic.replyCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {topic.hitCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(topic.lastPostTime ?? topic.time), "MM-dd HH:mm", { locale: zhCN })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function FollowingTopicsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}
