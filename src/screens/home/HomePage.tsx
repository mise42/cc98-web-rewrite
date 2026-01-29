import { useQuery } from '@tanstack/react-query'
import { Carousel } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Flame, BarChart3, Users, FileText } from 'lucide-react'
import type { IIndex } from '@/types/config'
import { UbbContainer } from '@/components/UbbContainer'
import { getIconForFunction } from '@/lib/utils/icons'

export function HomePage() {
  const { data, isLoading, error, refetch } = useQuery<IIndex>({
    queryKey: ['config', 'index'],
    queryFn: async () => {
      const response = await fetch('/api/config/index')
      if (!response.ok) {
        throw new Error('Failed to fetch index data')
      }
      return response.json()
    },
    staleTime: 1000 * 60,
  })

  if (isLoading) {
    return <HomePageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-4">加载失败</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">暂无数据</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {data.announcement && (
            <Card className="border-l-4 border-l-primary shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                  <UbbContainer content={data.announcement} />
                </div>
              </CardContent>
            </Card>
          )}

          {data.recommendationReading && data.recommendationReading.length > 0 && (
            <Card className="shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  推荐阅读
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Carousel
                  items={data.recommendationReading}
                  renderItem={(item, index) => (
                    <a
                      key={index}
                      href={item.link || '#'}
                      className="group flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/60 transition-all no-underline border border-transparent hover:border-border/50"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.imageLink && (
                        <div className="relative overflow-hidden rounded-md w-[80px] h-[80px] shrink-0">
                          <img
                            src={item.imageLink}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-base font-medium mb-1 truncate text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        {item.content && (
                          <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            <UbbContainer content={item.content} />
                          </div>
                        )}
                      </div>
                    </a>
                  )}
                  autoPlay
                  interval={5000}
                  className="relative"
                />
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md bg-card/50 backdrop-blur-sm flex-1">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <Flame className="w-5 h-5 text-destructive" />
                热门话题
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {!data.hotTopic || data.hotTopic.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">暂无热门话题数据</div>
                ) : (
                  data.hotTopic.map((topic, index) => (
                    <a
                      key={topic.id}
                      href={`/topic/${topic.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                    >
                      <span
                        className={`
                        flex items-center justify-center w-6 h-6 rounded text-xs font-bold shrink-0
                        ${index < 3 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}
                      `}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 font-normal text-muted-foreground border-border"
                          >
                            {topic.boardName}
                          </Badge>
                          <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                            {topic.title}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          {data.recommendationFunction && data.recommendationFunction.length > 0 && (
            <Card className="shadow-md bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-foreground">
                  <span>📌</span> 推荐功能
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  {data.recommendationFunction.map((item, index) => {
                    const Icon = getIconForFunction(item.title)
                    return (
                      <a
                        key={index}
                        href={item.link || '#'}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-background shadow-sm flex items-center justify-center border border-border group-hover:border-primary/50 group-hover:shadow-md transition-all">
                          <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">
                          {item.title}
                        </span>
                      </a>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <BarChart3 className="w-5 h-5 text-primary" />
                论坛统计
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">今日帖子</div>
                  <div className="text-xl font-bold text-foreground">{data.todayCount}</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">在线用户</div>
                  <div className="text-xl font-bold text-foreground">{data.onlineUserCount}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> 主题总数
                  </span>
                  <span className="font-medium">{data.topicCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> 帖子总数
                  </span>
                  <span className="font-medium">{data.postCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> 用户总数
                  </span>
                  <span className="font-medium">{data.userCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-dashed bg-transparent">
            <CardContent className="p-8 flex items-center justify-center text-muted-foreground text-sm">
              广告位招租
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function HomePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
export default HomePage
