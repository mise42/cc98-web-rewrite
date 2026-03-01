import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'
import { userService } from '@/services/user'

export function MyFansPage() {
  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['user', 'me', 'info'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return <Skeleton className="h-56 w-full rounded-lg" />
  }

  return (
    <Card className="shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          关注与粉丝
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-3 bg-muted/30 rounded">
            <div className="text-lg font-bold text-foreground">{userInfo?.followCount ?? 0}</div>
            <div className="text-xs text-muted-foreground">关注</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded">
            <div className="text-lg font-bold text-foreground">{userInfo?.fanCount ?? 0}</div>
            <div className="text-xs text-muted-foreground">粉丝</div>
          </div>
        </div>

        <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
          当前仅展示统计数量，不再请求关注/粉丝详情列表接口。
        </div>
      </CardContent>
    </Card>
  )
}
