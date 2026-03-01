import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { Award, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

function FollowingLayout() {
  const location = useLocation()
  const tabs = [
    { to: '/following/users', label: '关注用户', icon: Users },
    { to: '/following/boards', label: '关注版面', icon: Award },
  ] as const

  return (
    <div className="container mx-auto px-4 py-6 max-w-[900px]">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">关注</h1>
      </div>

      <div className="mb-5 flex items-center gap-2">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </div>

      <Outlet />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/following')({
  component: FollowingLayout,
})
