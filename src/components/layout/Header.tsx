import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Bell, Search, LogOut, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useMessageStore } from '@/stores/message'
import { cn } from '@/lib/utils'

export function Header() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount } = useMessageStore()
  const [searchValue, setSearchValue] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMessageMenu, setShowMessageMenu] = useState(false)

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/boardlist', label: '版面' },
    { path: '/newtopics', label: '新帖' },
    { path: '/recommendedtopics', label: '精选' },
  ]

  const handleSearch = () => {
    if (!searchValue.trim()) return

    const boardMatch = location.pathname.match(/\/board\/(\d+)/)
    const boardId = boardMatch ? boardMatch[1] : '0'
    window.location.href = `/search?boardId=${boardId}&keyword=${encodeURIComponent(searchValue)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link to="/" className="mr-8 flex items-center space-x-2 no-underline">
          <span className="text-xl font-bold tracking-tight text-foreground">CC98</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'transition-colors hover:text-primary',
                location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="mr-4 hidden md:flex items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-8 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary h-9 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground"
                  onClick={() => setShowMessageMenu(!showMessageMenu)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                  )}
                </Button>

                {showMessageMenu && (
                  <div className="absolute right-0 top-12 w-56 bg-popover text-popover-foreground rounded-md shadow-md border border-border p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      消息通知
                    </div>
                    <div className="h-px bg-border my-1" />
                    {[
                      { label: '回复我的', path: '/message/reply' },
                      { label: '@ 我的', path: '/message/at' },
                      { label: '系统通知', path: '/message/system' },
                      { label: '我的私信', path: '/message/private' },
                    ].map(item => (
                      <Link
                        key={item.path}
                        to="/message"
                        className="block px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        onClick={() => setShowMessageMenu(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  className="pl-0 text-muted-foreground hover:text-foreground gap-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user?.portraitUrl ? (
                    <img
                      src={user.portraitUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-full border border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-56 bg-popover text-popover-foreground rounded-md shadow-md border border-border p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      账号
                    </div>
                    <div className="h-px bg-border my-1" />
                    <Link
                      to="/usercenter"
                      className="flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      个人中心
                    </Link>
                    <Link
                      to="/message"
                      className="flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Bell className="h-4 w-4" />
                      消息中心
                    </Link>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="flex w-full items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
