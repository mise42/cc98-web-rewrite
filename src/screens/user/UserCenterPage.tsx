import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Mail, Calendar, Award, TrendingUp, MessageSquare, Eye } from 'lucide-react'
import { userService } from '@/services/user'
import { topicService } from '@/services/topic'

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'

export function UserCenterPage() {
  const {
    data: userInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', 'me', 'info'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
  })

  const { data: favoriteTopics } = useQuery({
    queryKey: ['topic', 'me', 'favorite'],
    queryFn: () => topicService.getFavoriteTopics(0, 5),
    staleTime: 1000 * 60,
  })

  if (isLoading) {
    return <UserCenterSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-4">加载失败</h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">用户信息加载失败</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                {userInfo.portraitUrl ? (
                  <img
                    src={userInfo.portraitUrl}
                    alt={userInfo.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <CardTitle className="text-xl">{userInfo.name}</CardTitle>
              {userInfo.displayTitle && (
                <Badge variant="secondary" className="mt-2">
                  {userInfo.displayTitle}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{userInfo.emailAddress || '未设置邮箱'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    注册于 {format(new Date(userInfo.registerTime), 'yyyy-MM-dd', { locale: zhCN })}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  统计信息
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-foreground">{userInfo.postCount}</div>
                    <div className="text-xs text-muted-foreground">帖子数</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-foreground">{userInfo.fanCount}</div>
                    <div className="text-xs text-muted-foreground">粉丝数</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-foreground">{userInfo.followCount}</div>
                    <div className="text-xs text-muted-foreground">关注数</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-foreground">{userInfo.popularity}</div>
                    <div className="text-xs text-muted-foreground">风评</div>
                  </div>
                </div>
              </div>

              {userInfo.boardMasterTitles && userInfo.boardMasterTitles.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    版主头衔
                  </h4>
                  <div className="space-y-2 text-sm">
                    {userInfo.boardMasterTitles.map(title => (
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

        <div className="lg:col-span-2 space-y-6">
          {favoriteTopics && favoriteTopics.length > 0 && (
            <Card className="shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  收藏的主题
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favoriteTopics.map(topic => (
                    <Link
                      key={topic.id}
                      href={`/topic/${topic.id}`}
                      className="block p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="font-medium text-foreground mb-1">{topic.title}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {topic.replyCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {topic.hitCount}
                        </span>
                        <span>
                          {format(new Date(topic.time), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">个人简介</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {userInfo.introduction || '这个人很懒，什么都没留下...'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function UserCenterSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
export default UserCenterPage
