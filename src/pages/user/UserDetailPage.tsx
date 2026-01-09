import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  MessageSquare,
  Eye,
  Users,
  Heart,
} from 'lucide-react'
import { userService } from '@/services/user'
import { topicService } from '@/services/topic'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface UserDetailPageProps {
  isOwnProfile?: boolean
}

export function UserDetailPage({ isOwnProfile = false }: UserDetailPageProps) {
  const { user: currentUser } = useAuth()
  const params = useParams({
    from: isOwnProfile ? '/_authenticated/usercenter' : '/user/$method/$id',
  })

  // 如果是个人中心，使用当前登录用户ID；否则从路由参数获取
  const targetUserId = isOwnProfile
    ? currentUser?.id
    : params.method === 'id'
      ? Number(params.id)
      : undefined

  const {
    data: userInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', targetUserId],
    queryFn: () => userService.getUser(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5,
  })

  // 获取用户收藏的主题（仅查看自己的时候显示）
  const { data: favoriteTopics } = useQuery({
    queryKey: ['topic', targetUserId, 'favorite'],
    queryFn: () => topicService.getFavoriteTopics(0, 5),
    enabled: isOwnProfile && !!targetUserId,
    staleTime: 1000 * 60,
  })

  // 获取用户关注的用户
  const { data: followingUsers } = useQuery({
    queryKey: ['user', targetUserId, 'following'],
    queryFn: () => userService.getFollowing(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 1000 * 60,
  })

  // 获取用户的粉丝
  const { data: fans } = useQuery({
    queryKey: ['user', targetUserId, 'fans'],
    queryFn: () => userService.getFans(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 1000 * 60,
  })

  if (isLoading) {
    return <UserDetailSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-4">用户不存在</h2>
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
      <div className="mb-4">
        {isOwnProfile ? (
          <h1 className="text-2xl font-bold">个人中心</h1>
        ) : (
          <Link
            to="/boardlist"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 返回版面列表
          </Link>
        )}
      </div>

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

        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile">个人简介</TabsTrigger>
              {isOwnProfile && <TabsTrigger value="favorites">收藏主题</TabsTrigger>}
              <TabsTrigger value="following">
                关注{' '}
                <span className="ml-1 text-xs opacity-70">({followingUsers?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="fans">
                粉丝 <span className="ml-1 text-xs opacity-70">({fans?.length || 0})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
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
            </TabsContent>

            {isOwnProfile && favoriteTopics && favoriteTopics.length > 0 && (
              <TabsContent value="favorites" className="space-y-6">
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
                          to="/topic/$topicId"
                          params={{ topicId: String(topic.id) }}
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
              </TabsContent>
            )}

            <TabsContent value="following" className="space-y-6">
              <Card className="shadow-md bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    关注的用户 ({followingUsers?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {followingUsers && followingUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {followingUsers.map(u => (
                        <Link
                          key={u.id}
                          to="/user/$method/$id"
                          params={{ method: 'id', id: String(u.id) }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {u.portraitUrl ? (
                              <img
                                src={u.portraitUrl}
                                alt={u.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span>{u.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{u.name}</div>
                            {u.signature && (
                              <div className="text-xs text-muted-foreground truncate">
                                {u.signature}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">暂无关注的用户</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fans" className="space-y-6">
              <Card className="shadow-md bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    粉丝 ({fans?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fans && fans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fans.map(u => (
                        <Link
                          key={u.id}
                          to="/user/$method/$id"
                          params={{ method: 'id', id: String(u.id) }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {u.portraitUrl ? (
                              <img
                                src={u.portraitUrl}
                                alt={u.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span>{u.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{u.name}</div>
                            {u.signature && (
                              <div className="text-xs text-muted-foreground truncate">
                                {u.signature}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">暂无粉丝</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function UserDetailSkeleton() {
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
