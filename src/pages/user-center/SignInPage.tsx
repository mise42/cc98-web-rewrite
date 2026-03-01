import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Flame } from 'lucide-react'
import { userService } from '@/services/user'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function SignInPage() {
  const queryClient = useQueryClient()
  const [latestReward, setLatestReward] = useState<number | null>(null)

  const { data: signInStatus, isLoading } = useQuery({
    queryKey: ['me', 'signin'],
    queryFn: () => userService.getSignInStatus(),
    staleTime: 1000 * 60,
  })

  const signInMutation = useMutation({
    mutationFn: () => userService.signIn(),
    onSuccess: reward => {
      setLatestReward(reward)
      queryClient.invalidateQueries({ queryKey: ['me', 'signin'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'me', 'info'] })
    },
  })

  if (isLoading || !signInStatus) {
    return <Skeleton className="h-56 w-full rounded-lg" />
  }

  const alreadySignedIn = signInStatus.hasSignedInToday || latestReward !== null

  return (
    <Card className="shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          签到中心
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">连续签到</span>
            <span className="font-semibold">{signInStatus.lastSignInCount} 天</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">签到状态</span>
            <span className="inline-flex items-center gap-1 text-sm">
              {alreadySignedIn ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  今日已签到
                </>
              ) : (
                '今日未签到'
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">上次签到</span>
            <span className="text-sm">
              {signInStatus.lastSignInTime
                ? format(new Date(signInStatus.lastSignInTime), 'yyyy-MM-dd HH:mm', {
                    locale: zhCN,
                  })
                : '—'}
            </span>
          </div>
        </div>

        {latestReward !== null && (
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded px-3 py-2">
            🎉 签到成功，获得 {latestReward} 财富值！
          </div>
        )}

        {signInMutation.isError && (
          <div className="text-sm text-destructive">签到失败，请稍后重试</div>
        )}

        <Button
          className="w-full"
          disabled={alreadySignedIn || signInMutation.isPending}
          variant={alreadySignedIn ? 'outline' : 'default'}
          onClick={() => signInMutation.mutate()}
        >
          {signInMutation.isPending ? '签到中...' : alreadySignedIn ? '今日已签到' : '立即签到'}
        </Button>
      </CardContent>
    </Card>
  )
}
