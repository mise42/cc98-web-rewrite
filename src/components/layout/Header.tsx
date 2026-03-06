import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Bell, Monitor, Moon, Search, Sun, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useMessageStore } from '@/stores/message'
import { userService } from '@/services/user'
import { cn } from '@/lib/utils'
import tokenManager from '@/lib/token-manager'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { mode, setMode } = useTheme()
  const { unreadCount, unreadSummary } = useMessageStore()
  const [searchValue, setSearchValue] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMessageMenu, setShowMessageMenu] = useState(false)
  const [hasSignedInToday, setHasSignedInToday] = useState<boolean | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const messageMenuRef = useRef<HTMLDivElement>(null)
  const userMenuHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messageMenuHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showAuthenticated = isAuthenticated && tokenManager.hasSession()

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (userMenuHideTimerRef.current) {
        clearTimeout(userMenuHideTimerRef.current)
      }
      if (messageMenuHideTimerRef.current) {
        clearTimeout(messageMenuHideTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!showAuthenticated || !showUserMenu) return

    let cancelled = false

    userService
      .getSignInStatus()
      .then(status => {
        if (!cancelled) {
          setHasSignedInToday(status.hasSignedInToday)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasSignedInToday(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [showAuthenticated, showUserMenu])

  const openUserMenu = () => {
    if (userMenuHideTimerRef.current) {
      clearTimeout(userMenuHideTimerRef.current)
      userMenuHideTimerRef.current = null
    }
    setShowUserMenu(true)
  }

  const closeUserMenuWithDelay = () => {
    if (userMenuHideTimerRef.current) {
      clearTimeout(userMenuHideTimerRef.current)
    }
    userMenuHideTimerRef.current = setTimeout(() => {
      setShowUserMenu(false)
    }, 120)
  }

  const openMessageMenu = () => {
    if (messageMenuHideTimerRef.current) {
      clearTimeout(messageMenuHideTimerRef.current)
      messageMenuHideTimerRef.current = null
    }
    setShowMessageMenu(true)
  }

  const closeMessageMenuWithDelay = () => {
    if (messageMenuHideTimerRef.current) {
      clearTimeout(messageMenuHideTimerRef.current)
    }
    messageMenuHideTimerRef.current = setTimeout(() => {
      setShowMessageMenu(false)
    }, 120)
  }

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/boardlist', label: '版面' },
    { path: '/newtopics', label: '新帖' },
    { path: '/recommendedtopics', label: '精选' },
    { path: '/following', label: '关注' },
  ]

  const isNavActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/boardlist') {
      return location.pathname === '/boardlist' || location.pathname.startsWith('/board/')
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const handleSearch = () => {
    const keyword = searchValue.trim()
    if (!keyword) return

    const boardMatch = location.pathname.match(/\/board\/(\d+)/)
    const boardId = boardMatch ? Number(boardMatch[1]) : 0

    navigate({
      to: '/search',
      search: {
        keyword,
        tab: 'topics',
        page: 1,
        boardId,
      },
    })
  }

  const handleQuickThemeToggle = () => {
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light')
  }

  const quickThemeLabel =
    mode === 'light' ? '切换到深色模式' : mode === 'dark' ? '切换到跟随系统' : '切换到浅色模式'

  return (
    <header className="app-themed-header sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
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
                'px-1 py-1 transition-colors',
                isNavActive(item.path)
                  ? 'text-white font-semibold underline underline-offset-4 decoration-2'
                  : 'text-white/85 hover:text-white'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="mr-4 hidden md:flex items-center">
          <div className="relative w-64">
            <Search
              aria-hidden="true"
              className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
              type="text"
              aria-label="搜索"
              autoComplete="off"
              name="keyword"
              placeholder="搜索…"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="h-9 border-transparent bg-muted/50 pl-8 transition-[background-color,border-color,box-shadow] focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/85 hover:text-foreground"
            onClick={handleQuickThemeToggle}
            title={quickThemeLabel}
            aria-label={quickThemeLabel}
          >
            {mode === 'light' ? (
              <Sun aria-hidden="true" className="h-5 w-5" />
            ) : mode === 'dark' ? (
              <Moon aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Monitor aria-hidden="true" className="h-5 w-5" />
            )}
          </Button>

          {showAuthenticated ? (
            <>
              <div
                className="relative"
                ref={messageMenuRef}
                onMouseEnter={openMessageMenu}
                onMouseLeave={closeMessageMenuWithDelay}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="打开消息通知"
                  aria-expanded={showMessageMenu}
                  aria-haspopup="true"
                  className="relative text-foreground/85 hover:text-foreground"
                  onClick={() => setShowMessageMenu(prev => !prev)}
                >
                  <Bell aria-hidden="true" className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                  )}
                </Button>

                {showMessageMenu && (
                  <div className="absolute right-0 top-full z-50 w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none motion-reduce:duration-0">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      消息通知
                    </div>
                    <div className="h-px bg-border my-1" />
                    {[
                      {
                        label: '回复我的',
                        path: '/message/reply',
                        count: unreadSummary.replyCount,
                      },
                      { label: '@ 我的', path: '/message/at', count: unreadSummary.atCount },
                      {
                        label: '系统通知',
                        path: '/message/system',
                        count: unreadSummary.systemCount,
                      },
                      {
                        label: '我的私信',
                        path: '/message/private',
                        count: unreadSummary.messageCount,
                      },
                    ].map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center justify-between px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        onClick={() => setShowMessageMenu(false)}
                      >
                        <span>{item.label}</span>
                        {item.count > 0 && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative"
                ref={userMenuRef}
                onMouseEnter={openUserMenu}
                onMouseLeave={closeUserMenuWithDelay}
              >
                <Button
                  variant="ghost"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                  className="pl-0 text-foreground/90 hover:text-foreground gap-2"
                >
                  {user?.portraitUrl ? (
                    <img
                      src={user.portraitUrl}
                      alt={user.name}
                      width="32"
                      height="32"
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-8 rounded-full border border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                      <User aria-hidden="true" className="h-4 w-4" />
                    </div>
                  )}
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full z-50 w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none motion-reduce:duration-0">
                    <Link
                      to="/usercenter"
                      className="block px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      个人中心
                    </Link>
                    <Link
                      to="/usercenter/signin"
                      className="block px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {hasSignedInToday ? '已签到' : '签到'}
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="block w-full px-3 py-2 text-sm rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                登录
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
