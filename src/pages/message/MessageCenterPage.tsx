import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Bell, AtSign, MessageCircle, Send, Reply } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import {
  messageService,
  type INotification,
  type IUnreadMessageCount,
} from '@/services/message'
import { userService } from '@/services/user'
import { topicService } from '@/services/topic'
import { useAuth } from '@/hooks/useAuth'
import { useMessageStore } from '@/stores/message'

type MessageTab = 'reply' | 'at' | 'system' | 'private'

interface MessageCenterPageProps {
  activeTab: MessageTab
}

const tabs: Array<{ key: MessageTab; label: string; to: string; icon: ComponentType<{ className?: string }> }> = [
  { key: 'reply', label: '回复我的', to: '/message/reply', icon: Reply },
  { key: 'at', label: '@ 我的', to: '/message/at', icon: AtSign },
  { key: 'system', label: '系统通知', to: '/message/system', icon: Bell },
  { key: 'private', label: '我的私信', to: '/message/private', icon: MessageCircle },
]

const NOTIFICATION_PAGE_SIZE = 20

export function MessageCenterPage({ activeTab }: MessageCenterPageProps) {
  const queryClient = useQueryClient()
  const { unreadSummary, setUnreadSummary } = useMessageStore()

  const { data: unreadData } = useQuery<IUnreadMessageCount>({
    queryKey: ['message', 'unread-summary'],
    queryFn: () => messageService.getUnreadCount(),
    staleTime: 1000 * 30,
  })

  useEffect(() => {
    if (unreadData) {
      setUnreadSummary(unreadData)
    }
  }, [unreadData, setUnreadSummary])

  const counters = unreadData ?? unreadSummary

  const getTabCount = (tab: MessageTab) => {
    if (tab === 'reply') return counters.replyCount
    if (tab === 'at') return counters.atCount
    if (tab === 'system') return counters.systemCount
    return counters.messageCount
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">消息中心</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Card className="h-fit">
          <CardContent className="p-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              const count = getTabCount(tab.key)
              return (
                <Link
                  key={tab.key}
                  to={tab.to}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors no-underline ${
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </span>
                  {count > 0 && (
                    <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">
                      {count}
                    </span>
                  )}
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <div>
          {activeTab === 'reply' && (
            <NotificationPanel
              title="回复我的"
              queryKey="reply"
              queryFn={messageService.getReplyNotifications}
              markAllAsRead={() => messageService.markAllReplyAsRead()}
            />
          )}

          {activeTab === 'at' && (
            <NotificationPanel
              title="@ 我的"
              queryKey="at"
              queryFn={messageService.getAtNotifications}
              markAllAsRead={() => messageService.markAllAtAsRead()}
            />
          )}

          {activeTab === 'system' && (
            <NotificationPanel
              title="系统通知"
              queryKey="system"
              queryFn={messageService.getSystemNotifications}
              markAllAsRead={() => messageService.markAllSystemAsRead()}
            />
          )}

          {activeTab === 'private' && <PrivateMessagePanel />}
        </div>
      </div>
    </div>
  )
}

interface NotificationPanelProps {
  title: string
  queryKey: string
  queryFn: (from: number, size: number) => Promise<INotification[]>
  markAllAsRead: () => Promise<void>
}

function NotificationPanel({ title, queryKey, queryFn, markAllAsRead }: NotificationPanelProps) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['message', 'notifications', queryKey, page],
    queryFn: () => queryFn((page - 1) * NOTIFICATION_PAGE_SIZE, NOTIFICATION_PAGE_SIZE),
    staleTime: 1000 * 30,
  })

  const topicIds = useMemo(
    () =>
      Array.from(
        new Set(
          notifications
            .map(notification => notification.topicId)
            .filter((topicId): topicId is number => topicId !== null)
        )
      ),
    [notifications]
  )

  const { data: topicTitleMap = {} } = useQuery({
    queryKey: ['message', 'notifications', queryKey, 'topics', topicIds],
    queryFn: async () => {
      const topics = await Promise.all(
        topicIds.map(async topicId => {
          try {
            const topic = await topicService.getTopic(topicId)
            return [topicId, topic.title] as const
          } catch {
            return [topicId, `主题 #${topicId}`] as const
          }
        })
      )

      return Object.fromEntries(topics) as Record<number, string>
    },
    enabled: topicIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  const hasMore = notifications.length === NOTIFICATION_PAGE_SIZE

  const { mutate: markAll, isPending: isMarking } = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: async () => {
      toast.success('已全部标记为已读')
      setPage(1)
      await queryClient.invalidateQueries({ queryKey: ['message'] })
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : '操作失败')
    },
  })

  if (isLoading) {
    return <Skeleton className="h-[520px] w-full rounded-lg" />
  }

  if (error) {
    return (
      <ErrorState
        error={error as Error}
        retry={() => queryClient.invalidateQueries({ queryKey: ['message', 'notifications', queryKey] })}
      />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => markAll()} disabled={isMarking}>
            {isMarking ? '处理中...' : '全部标为已读'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">暂无消息</div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  topicTitle={notification.topicId ? topicTitleMap[notification.topicId] : undefined}
                />
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="hover:text-foreground disabled:opacity-40"
              >
                ← 上一页
              </button>
              <span>第 {page} 页</span>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={!hasMore}
                className="hover:text-foreground disabled:opacity-40"
              >
                下一页 →
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function NotificationItem({
  notification,
  topicTitle,
}: {
  notification: INotification
  topicTitle?: string
}) {
  const actorName = notification.postBasicInfo?.userName || '有人'
  const isReplyOrAt = notification.type === 2 || notification.type === 3
  const actionText = notification.type === 3 ? '@ 了你' : '回复了你'

  const resolvedTopicTitle =
    topicTitle ||
    (notification.topicId ? `主题 #${notification.topicId}` : undefined) ||
    notification.title ||
    '未知主题'
  const floor = notification.postBasicInfo?.floor
  const topicPage = floor && floor > 0 ? Math.floor((floor - 1) / 20) + 1 : 1
  const topicHash = notification.postId ? `post-${notification.postId}` : undefined

  return (
    <div className={`px-4 py-3 ${notification.isRead ? 'opacity-80' : ''}`}>
      <div className="min-w-0">
        {isReplyOrAt ? (
          <div className="font-medium text-sm leading-6">
            <span>{actorName} 在 </span>
            {notification.topicId ? (
              <Link
                to="/topic/$topicId"
                params={{ topicId: String(notification.topicId) }}
                search={{ page: topicPage, mode: 'pagination' }}
                hash={topicHash}
                className="text-primary hover:underline"
              >
                《{resolvedTopicTitle}》
              </Link>
            ) : (
              <span>《{resolvedTopicTitle}》</span>
            )}
            <span>{actionText}</span>
          </div>
        ) : (
          <>
            <div className="font-medium text-sm">{notification.title || '系统通知'}</div>
            {notification.content && (
              <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {notification.content}
              </div>
            )}
          </>
        )}

        <div className="mt-2 text-xs text-muted-foreground">
          {format(new Date(notification.time), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
          {notification.postBasicInfo?.floor && <span className="ml-2">#{notification.postBasicInfo.floor} 楼</span>}
        </div>
      </div>
    </div>
  )
}

function PrivateMessagePanel() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  const {
    data: contacts = [],
    isLoading: contactsLoading,
    error: contactsError,
  } = useQuery({
    queryKey: ['message', 'contacts'],
    queryFn: () => messageService.getRecentMessages(0, 20),
    staleTime: 1000 * 30,
  })

  const contactIds = useMemo(
    () => Array.from(new Set(contacts.map(contact => contact.userId))),
    [contacts]
  )

  const { data: userMap = {} } = useQuery({
    queryKey: ['message', 'contacts', 'users', contactIds],
    queryFn: async () => {
      const users = await Promise.all(
        contactIds.map(async id => {
          try {
            return await userService.getUser(id)
          } catch {
            return null
          }
        })
      )

      return users.reduce<Record<number, Awaited<ReturnType<typeof userService.getUser>>>>((map, item) => {
        if (item) {
          map[item.id] = item
        }
        return map
      }, {})
    },
    enabled: contactIds.length > 0,
    staleTime: 1000 * 60,
  })

  useEffect(() => {
    if (selectedUserId && contactIds.includes(selectedUserId)) {
      return
    }

    if (contactIds.length > 0) {
      setSelectedUserId(contactIds[0])
    }
  }, [contactIds, selectedUserId])

  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ['message', 'conversation', selectedUserId],
    queryFn: () => messageService.getMessageContent(selectedUserId!, 0, 20),
    enabled: !!selectedUserId,
    staleTime: 1000 * 10,
  })

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) {
        throw new Error('请先选择联系人')
      }
      const content = draft.trim()
      if (!content) {
        throw new Error('消息内容不能为空')
      }

      const targetUser = userMap[selectedUserId]
      if (!targetUser?.name) {
        throw new Error('无法识别联系人用户名')
      }

      await messageService.sendMessage(targetUser.name, content)
    },
    onSuccess: async () => {
      setDraft('')
      toast.success('发送成功')
      await queryClient.invalidateQueries({ queryKey: ['message'] })
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : '发送失败')
    },
  })

  if (contactsLoading) {
    return <Skeleton className="h-[520px] w-full rounded-lg" />
  }

  if (contactsError) {
    return (
      <ErrorState
        error={contactsError as Error}
        retry={() => queryClient.invalidateQueries({ queryKey: ['message', 'contacts'] })}
      />
    )
  }

  const orderedMessages = [...messages].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  )

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg">我的私信</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[520px]">
          <div className="border-r border-border p-2">
            {contacts.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">暂无私信联系人</div>
            ) : (
              contacts.map(contact => {
                const profile = userMap[contact.userId]
                return (
                  <button
                    key={`${contact.userId}-${contact.time}`}
                    onClick={() => setSelectedUserId(contact.userId)}
                    className={`w-full rounded-md p-3 text-left transition-colors ${
                      selectedUserId === contact.userId
                        ? 'bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {profile?.name || `用户 ${contact.userId}`}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {contact.lastContent}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {format(new Date(contact.time), 'MM-dd HH:mm', { locale: zhCN })}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="flex flex-col">
            {!selectedUserId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                请选择联系人
              </div>
            ) : messagesError ? (
              <div className="p-4">
                <ErrorState
                  error={messagesError as Error}
                  retry={() =>
                    queryClient.invalidateQueries({
                      queryKey: ['message', 'conversation', selectedUserId],
                    })
                  }
                />
              </div>
            ) : messagesLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-14 w-[65%]" />
                <Skeleton className="h-14 w-[72%]" />
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                  {orderedMessages.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">暂无历史消息</div>
                  ) : (
                    orderedMessages.map(message => {
                      const isMine = message.senderId === user?.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                              isMine
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{message.content}</div>
                            <div
                              className={`mt-1 text-[11px] ${
                                isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              }`}
                            >
                              {format(new Date(message.time), 'MM-dd HH:mm', { locale: zhCN })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="border-t border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={draft}
                      onChange={event => setDraft(event.target.value)}
                      placeholder="输入私信内容，Enter 发送"
                      onKeyDown={event => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          sendMutation.mutate()
                        }
                      }}
                    />
                    <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
