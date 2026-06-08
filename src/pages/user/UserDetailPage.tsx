import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Calendar,
  Award,
  TrendingUp,
  MessageSquare,
  Eye,
  UserPlus,
  UserMinus,
  ArrowLeft,
  Users,
} from "lucide-react";
import { userService } from "@/services/user";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { UbbContainer } from "@/components/UbbContainer";

interface UserDetailPageProps {
  isOwnProfile?: boolean;
  userId?: number;
}

const TOPIC_PREVIEW_PAGE_SIZE = 6;

export function UserDetailPage({ isOwnProfile = true, userId }: UserDetailPageProps) {
  const [topicPage, setTopicPage] = useState(1);
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const targetUserId = isOwnProfile ? currentUser?.id : userId;

  const {
    data: userInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", targetUserId],
    queryFn: () => userService.getUser(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5,
  });

  const topicsFrom = (topicPage - 1) * TOPIC_PREVIEW_PAGE_SIZE;

  const { data: recentTopics, isLoading: topicsLoading } = useQuery({
    queryKey: ["user", targetUserId, "recent-topics", topicPage],
    queryFn: () =>
      userService.getUserRecentTopics(targetUserId!, topicsFrom, TOPIC_PREVIEW_PAGE_SIZE + 1),
    enabled: !!targetUserId,
    staleTime: 1000 * 60,
  });

  const followMutation = useMutation({
    mutationFn: (follow: boolean) =>
      follow ? userService.followUser(targetUserId!) : userService.unfollowUser(targetUserId!),
    onMutate: async (follow) => {
      await queryClient.cancelQueries({ queryKey: ["user", targetUserId] });
      const prev = queryClient.getQueryData<typeof userInfo>(["user", targetUserId]);
      queryClient.setQueryData<typeof userInfo>(["user", targetUserId], (old) =>
        old ? { ...old, isFollowing: follow, fanCount: old.fanCount + (follow ? 1 : -1) } : old,
      );
      return { prev };
    },
    onError: (_err, _follow, ctx) => {
      queryClient.setQueryData(["user", targetUserId], ctx?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", targetUserId] });
    },
  });

  if (isLoading) {
    return <UserDetailPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-4">用户不存在</h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">用户信息加载失败</div>
      </div>
    );
  }

  const hasMoreTopics = !!recentTopics && recentTopics.length > TOPIC_PREVIEW_PAGE_SIZE;
  const displayTopics = hasMoreTopics
    ? recentTopics.slice(0, TOPIC_PREVIEW_PAGE_SIZE)
    : recentTopics;

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="mb-4">
        <Link
          to="/boardlist"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回版面列表
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
        <div className="lg:col-span-1">
          <Card className="shadow-md bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="text-center pb-3">
              <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {userInfo.portraitUrl ? (
                  <img
                    src={userInfo.portraitUrl}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <CardTitle className="text-xl">{userInfo.name}</CardTitle>
              {userInfo.displayTitle && (
                <Badge variant="secondary" className="mt-1">
                  {userInfo.displayTitle}
                </Badge>
              )}

              {!isOwnProfile && isAuthenticated && currentUser?.id !== userInfo.id && (
                <div className="mt-3">
                  <Button
                    variant={userInfo.isFollowing ? "outline" : "default"}
                    size="sm"
                    className="w-full gap-1"
                    disabled={followMutation.isPending}
                    onClick={() => followMutation.mutate(!userInfo.isFollowing)}
                  >
                    {userInfo.isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        已关注
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        关注
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="mt-3 w-full rounded-lg border border-border/50 bg-muted/35 px-3 py-2 text-left">
                <div className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground">
                  签名档
                </div>
                <div className="max-h-20 overflow-y-auto pr-1 text-xs leading-5 text-foreground break-words">
                  {userInfo.signatureCode ? (
                    <UbbContainer content={userInfo.signatureCode} />
                  ) : (
                    <span className="text-muted-foreground">暂无签名档</span>
                  )}
                </div>
              </div>

              <div className="mt-2 w-full rounded-lg border border-border/50 bg-muted/35 px-3 py-2 text-left">
                <div className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground">
                  个人简介
                </div>
                <div className="max-h-24 overflow-y-auto pr-1 text-xs leading-5 text-foreground whitespace-pre-wrap break-words">
                  {userInfo.introduction || (
                    <span className="text-muted-foreground">暂无个人简介</span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{userInfo.emailAddress || "未公开"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">QQ：{userInfo.qq || "未公开"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    注册于 {format(new Date(userInfo.registerTime), "yyyy-MM-dd", { locale: zhCN })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>
                    关注 {userInfo.followCount} · 粉丝 {userInfo.fanCount}
                  </span>
                </div>
              </div>

              <div className="mt-1 pt-4 border-t border-border">
                <h4 className="font-medium mb-3 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  统计
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "帖子", value: userInfo.postCount },
                    { label: "点赞", value: userInfo.receivedLikeCount ?? 0 },
                    { label: "粉丝", value: userInfo.fanCount },
                    { label: "风评", value: userInfo.popularity },
                    { label: "威望", value: userInfo.prestige },
                    { label: "财富", value: userInfo.wealth },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-base font-bold text-foreground">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {userInfo.boardMasterTitles && userInfo.boardMasterTitles.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <h4 className="font-medium mb-2 text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    版主头衔
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    {userInfo.boardMasterTitles.map((title) => (
                      <div
                        key={`${title.boardId}-${title.title}`}
                        className="p-2 bg-muted/30 rounded"
                      >
                        <div className="font-medium">{title.title}</div>
                        <div className="text-xs text-muted-foreground">{title.boardName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6 lg:flex lg:flex-col">
          <Card className="shadow-md bg-card/50 backdrop-blur-sm lg:flex lg:flex-1 lg:flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                TA 的主题
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 lg:flex lg:flex-1 lg:flex-col">
              {topicsLoading ? (
                <div className="space-y-2 lg:flex-1">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : !displayTopics || displayTopics.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 lg:flex-1 lg:flex lg:items-center">
                  暂未发布主题
                </div>
              ) : (
                <div className="space-y-2 lg:flex-1">
                  {displayTopics.map((topic) => (
                    <Link
                      key={topic.id}
                      to="/topic/$topicId"
                      params={{ topicId: String(topic.id) }}
                      className="block p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="font-medium text-foreground mb-1 line-clamp-1">
                        {topic.title}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {topic.replyCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {topic.hitCount || 0}
                        </span>
                        <span>
                          {format(new Date(topic.lastPostTime || topic.time), "MM-dd HH:mm", {
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-3 border-t border-border pt-3 flex items-center justify-between text-xs text-muted-foreground">
                <button
                  onClick={() => setTopicPage((p) => Math.max(1, p - 1))}
                  disabled={topicPage === 1}
                  className="hover:text-foreground disabled:opacity-40"
                >
                  ← 上一页
                </button>
                <span>第 {topicPage} 页</span>
                <button
                  onClick={() => setTopicPage((p) => p + 1)}
                  disabled={!hasMoreTopics}
                  className="hover:text-foreground disabled:opacity-40"
                >
                  下一页 →
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function UserDetailPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-[620px] w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
