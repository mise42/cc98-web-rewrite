import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { User, Lock, LogIn } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

interface LoginPageProps {
  redirect?: string
}

export function LoginPage({ redirect }: LoginPageProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || username.length < 2) {
      toast.error('用户名至少2个字符')
      return
    }

    if (!password.trim() || password.length < 6) {
      toast.error('密码至少6个字符')
      return
    }

    try {
      setIsSubmitting(true)
      await login(username, password)
      toast.success('登录成功！')
      navigate({ to: redirect || '/', replace: true })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || '登录失败，请检查用户名和密码')
      } else {
        toast.error('登录失败，请稍后重试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">欢迎回来</CardTitle>
          <p className="text-sm text-muted-foreground">请输入您的账号密码进行登录</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="pl-10 bg-background/50 border-input focus-visible:ring-primary"
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 bg-background/50 border-input focus-visible:ring-primary"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
              {isSubmitting ? '登录中...' : '立即登录'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">更多选项</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://account.cc98.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary hover:underline transition-colors"
            >
              注册账号
            </a>
            <Separator orientation="vertical" className="h-4 bg-border" />
            <a
              href="https://account.cc98.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary hover:underline transition-colors"
            >
              找回密码
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
