import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate, useSearch } from '@tanstack/react-router'
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ApiError } from '@/services/client'
import { toast } from 'sonner'
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Star,
  X,
  Quote,
} from 'lucide-react'
import { topicService } from '@/services/topic'
import { boardService } from '@/services/board'
import { userService } from '@/services/user'
import type { IPost, ITopic, IBoard } from '@/types/api'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { UbbContainer } from '@/components/UbbContainer'
import { Markdown } from '@/lib/ubb-modern/components/Markdown'
import { useAuthStore } from '@/stores/auth'
import { useTopicViewStore } from '@/stores/topic-view'
import { ViewModeToggle } from '@/components/topic/ViewModeToggle'
import { PaginationControls } from '@/components/topic/PaginationControls'
import { InfiniteScrollTrigger } from '@/components/topic/InfiniteScrollTrigger'
import { FormatToolbar } from '@/components/editor'

export function TopicDetailPage() {
  const { topicId } = useParams({ from: '/topic/$topicId' })
  const numericTopicId = parseInt(topicId, 10)
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // 从 URL 读取查询参数
  const search = useSearch({ from: '/topic/$topicId' })
  const urlPage = search.page
  const urlMode = search.mode

  // 获取视图模式状态
  const {
    viewMode,
    currentPage,
    pageSize,
    allPosts,
    hasMore,
    isLoadingMore,
    tracePostId,
    setAllPosts,
    appendPosts,
    setHasMore,
    setIsLoadingMore,
    resetPosts,
    setCurrentPage,
    setViewMode,
    setTracePost,
  } = useTopicViewStore()

  const [replyContent, setReplyContent] = React.useState('')
  const [replyContentType, setReplyContentType] = React.useState<0 | 1>(0)
  const [isSubmittingReply, setIsSubmittingReply] = React.useState(false)
  const replyEditorRef = React.useRef<HTMLTextAreaElement | null>(null)
  const hasScrolledToHashRef = React.useRef(false)

  // 同步 URL 状态到 store（仅初始化时）
  React.useEffect(() => {
    if (urlMode !== viewMode) {
      setViewMode(urlMode)
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage)
    }
  }, [])

  React.useEffect(() => {
    hasScrolledToHashRef.current = false
  }, [numericTopicId])

  // 更新 URL 的辅助函数
  const updateURL = (page: number, mode: 'pagination' | 'infinite') => {
    navigate({
      to: '/topic/$topicId',
      params: { topicId },
      search: { page, mode },
    })
  }

  const {
    data: topic,
    isLoading: topicLoading,
    error: topicError,
  } = useQuery<ITopic>({
    queryKey: ['topic', numericTopicId],
    queryFn: () => topicService.getTopic(numericTopicId),
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        return false
      }
      return failureCount < 3
    },
  })

  // 分页模式：获取当前页的帖子
  const {
    data: pagedPosts,
    isLoading: pagedPostsLoading,
    error: pagedPostsError,
  } = useQuery<IPost[]>({
    queryKey: ['topic', numericTopicId, 'posts', currentPage, tracePostId],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize
      if (tracePostId) {
        return topicService.getUserPostsInTopic(numericTopicId, tracePostId, from, pageSize)
      }
      return topicService.getTopicPosts(numericTopicId, from, pageSize)
    },
    enabled: viewMode === 'pagination',
    staleTime: 1000 * 60,
  })

  // 无限滚动模式：初始加载
  const {
    data: initialPosts,
    isLoading: initialPostsLoading,
    error: initialPostsError,
  } = useQuery<IPost[]>({
    queryKey: ['topic', numericTopicId, 'posts', 'initial', tracePostId],
    queryFn: async () => {
      if (tracePostId) {
        const data = await topicService.getUserPostsInTopic(
          numericTopicId,
          tracePostId,
          0,
          pageSize
        )
        if (allPosts.length === 0) {
          setAllPosts(data)
          setHasMore(data.length === pageSize)
        }
        return data
      }
      const data = await topicService.getTopicPosts(numericTopicId, 0, pageSize)
      if (allPosts.length === 0) {
        setAllPosts(data)
        setHasMore(data.length === pageSize)
      }
      return data
    },
    enabled: viewMode === 'infinite' && allPosts.length === 0,
    staleTime: 1000 * 60,
  })

  // 加载更多帖子（无限滚动）
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const from = allPosts.length
      let newPosts: IPost[]

      if (tracePostId) {
        newPosts = await topicService.getUserPostsInTopic(
          numericTopicId,
          tracePostId,
          from,
          pageSize
        )
      } else {
        newPosts = await topicService.getTopicPosts(numericTopicId, from, pageSize)
      }

      appendPosts(newPosts)
      setHasMore(newPosts.length === pageSize)
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 根据模式确定显示的帖子
  const displayPosts = viewMode === 'pagination' ? (pagedPosts ?? []) : allPosts
  const postsLoading = viewMode === 'pagination' ? pagedPostsLoading : initialPostsLoading
  const postsError = viewMode === 'pagination' ? pagedPostsError : initialPostsError
  const totalCount = topic?.replyCount ?? 0

  const postUserIds = React.useMemo(
    () =>
      Array.from(
        new Set(displayPosts.filter(post => !post.isAnonymous).map(post => post.userId))
      ).sort((a, b) => a - b),
    [displayPosts]
  )

  const { data: postUserPortraitMap } = useQuery<Record<number, string>>({
    queryKey: ['topic', numericTopicId, 'post-user-portraits', postUserIds],
    queryFn: async () => {
      const users = await userService.getUsers(postUserIds)
      const portraitMap: Record<number, string> = {}

      users.forEach(user => {
        if (user?.portraitUrl) {
          portraitMap[user.id] = user.portraitUrl
        }
      })

      return portraitMap
    },
    enabled: postUserIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  // 退出追踪模式
  const exitTraceMode = () => {
    setTracePost(null)
    resetPosts()
  }

  // 查找追踪用户的名称
  const tracedUser = displayPosts.find(p => p.id === tracePostId)

  React.useEffect(() => {
    if (hasScrolledToHashRef.current || postsLoading) return

    const hash = window.location.hash
    if (!hash || !hash.startsWith('#post-')) return

    const target = document.getElementById(hash.slice(1))
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    hasScrolledToHashRef.current = true
  }, [displayPosts, postsLoading])

  const insertQuote = (post: IPost) => {
    const author = post.isAnonymous ? '匿名用户' : post.userName
    const quotePrefix =
      replyContentType === 1
        ? `> ${author} 发表于 ${format(new Date(post.time), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}\n`
        : `[quote=${author}]\n`
    const quoteBody =
      replyContentType === 1
        ? `${post.content
            .split('\n')
            .map(line => `> ${line}`)
            .join('\n')}\n\n`
        : `${post.content}\n[/quote]\n\n`

    setReplyContent(prev => `${prev}${quotePrefix}${quoteBody}`)

    requestAnimationFrame(() => {
      replyEditorRef.current?.focus()
      replyEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const submitReply = async () => {
    const content = replyContent.trim()

    if (!isAuthenticated) {
      toast.error('请先登录后再回复')
      return
    }

    if (!content) {
      toast.error('回复内容不能为空')
      return
    }

    try {
      setIsSubmittingReply(true)
      await topicService.replyTopic(numericTopicId, content, replyContentType)
      toast.success('回复成功')
      setReplyContent('')

      // 刷新主题与回复列表
      await queryClient.invalidateQueries({ queryKey: ['topic', numericTopicId] })
      await queryClient.invalidateQueries({ queryKey: ['topic', numericTopicId, 'posts'] })

      if (viewMode === 'infinite') {
        resetPosts()
      }
    } catch (error) {
      if (error instanceof ApiError && error.isAuthError()) {
        toast.error('登录状态已失效，请重新登录')
      } else {
        toast.error(error instanceof Error ? error.message : '回复失败，请稍后重试')
      }
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const { data: board } = useQuery<IBoard>({
    queryKey: ['board', topic?.boardId],
    queryFn: () => boardService.getBoard(String(topic?.boardId)),
    enabled: !!topic?.boardId,
    staleTime: 1000 * 60 * 5,
  })

  const isLoading = topicLoading || postsLoading
  const error = topicError || postsError

  if (isLoading) {
    return <TopicDetailSkeleton />
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    const errorStatus = (error as any).status

    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-4">加载失败</h2>
          <p className="text-muted-foreground mb-2">错误信息: {errorMessage}</p>
          {errorStatus && <p className="text-muted-foreground mb-4">状态码: {errorStatus}</p>}
          {errorStatus === 401 && (
            <p className="text-yellow-600 mb-4">您可能未登录或登录已过期，请重新登录</p>
          )}
          <Link
            to="/login"
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors inline-block mr-2"
          >
            前往登录
          </Link>
          <Link
            to="/boardlist"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors inline-block"
          >
            返回版面列表
          </Link>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">帖子不存在</div>
      </div>
    )
  }

  const isTop = topic.topState > 0
  const isBest = topic.bestState > 0

  return (
    <div className="container mx-auto px-4 py-6 max-w-[900px]">
      <div className="mb-6">
        {board && (
          <Link
            to="/board/$boardId"
            params={{ boardId: String(board.id) }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回 {board.name}
          </Link>
        )}

        <Card className="shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              {isTop && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  <Pin className="w-3 h-3 mr-1" />
                  置顶
                </Badge>
              )}
              {isBest && (
                <Badge className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  精华
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-bold">{topic.title}</CardTitle>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {topic.isAnonymous ? (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  匿名用户
                </span>
              ) : (
                <Link
                  to="/user/id/$id"
                  params={{ id: String(topic.userId) }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <User className="w-4 h-4" />
                  {topic.userName}
                </Link>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(topic.time), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {topic.hitCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {topic.replyCount}
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 视图模式切换 */}
      <div className="mb-4">
        <ViewModeToggle mode={viewMode} onModeChange={mode => updateURL(urlPage, mode)} />
      </div>

      {/* 追踪模式提示条 */}
      {tracePostId && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              🔍 追踪中：{tracedUser?.userName || `用户`}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">只显示该用户的回复</span>
          </div>
          <Button variant="outline" size="sm" onClick={exitTraceMode} className="h-8 text-xs">
            <X className="w-3 h-3 mr-1" />
            退出追踪
          </Button>
        </div>
      )}

      {/* 帖子列表 */}
      <div className="space-y-4">
        {displayPosts && displayPosts.length > 0 ? (
          displayPosts.map(post => (
            <PostItem
              key={post.id}
              post={post}
              portraitUrl={postUserPortraitMap?.[post.userId]}
              queryClient={queryClient}
              topicId={numericTopicId}
              onQuote={insertQuote}
            />
          ))
        ) : (
          <Card className="shadow-md bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              {tracePostId ? '该用户在此帖子中暂无回复' : '暂无回复'}
            </CardContent>
          </Card>
        )}
      </div>

      {isAuthenticated ? (
        <Card className="mt-6 shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">发表回复</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={replyContentType === 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReplyContentType(0)}
                >
                  UBB
                </Button>
                <Button
                  variant={replyContentType === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReplyContentType(1)}
                >
                  Markdown
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <FormatToolbar
              mode={replyContentType === 0 ? 'ubb' : 'markdown'}
              value={replyContent}
              onChange={setReplyContent}
              textareaRef={replyEditorRef}
            />
            <textarea
              ref={replyEditorRef}
              value={replyContent}
              onChange={event => setReplyContent(event.target.value)}
              placeholder="输入回复内容..."
              className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary"
            />
            <div className="flex justify-end">
              <Button onClick={submitReply} disabled={isSubmittingReply}>
                {isSubmittingReply ? '发送中...' : '发送回复'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6 shadow-md bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              登录后可参与回复
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 分页控件或无限滚动触发器（追踪模式下不显示） */}
      {!tracePostId &&
        (viewMode === 'pagination' ? (
          <PaginationControls
            totalCount={totalCount}
            onPageChange={page => {
              setCurrentPage(page)
              updateURL(page, urlMode)
            }}
          />
        ) : (
          <InfiniteScrollTrigger onLoadMore={loadMore} totalCount={totalCount} />
        ))}
    </div>
  )
}

interface PostItemProps {
  post: IPost
  portraitUrl?: string
  queryClient: ReturnType<typeof useQueryClient>
  topicId: number
  onQuote: (post: IPost) => void
}

function PostItem({ post, portraitUrl, queryClient, topicId, onQuote }: PostItemProps) {
  const { setTracePost, resetPosts, tracePostId } = useTopicViewStore()
  const [likeState, setLikeState] = React.useState<0 | 1 | 2>(post.likeState)
  const [likeCount, setLikeCount] = React.useState(post.likeCount)
  const [dislikeCount, setDislikeCount] = React.useState(post.dislikeCount)
  const [isLiking, setIsLiking] = React.useState(false)

  // 当 post 对象变化时，同步状态（例如切换追踪模式、翻页等）
  React.useEffect(() => {
    setLikeState(post.likeState)
    setLikeCount(post.likeCount)
    setDislikeCount(post.dislikeCount)
  }, [post.id, post.likeState, post.likeCount, post.dislikeCount])

  // 更新Query缓存中的帖子数据
  const updatePostsCache = (
    newLikeState: 0 | 1 | 2,
    newLikeCount: number,
    newDislikeCount: number
  ) => {
    // 更新所有相关的query缓存
    queryClient.setQueriesData<IPost[]>({ queryKey: ['topic', topicId, 'posts'] }, oldData => {
      if (!oldData) return oldData
      return oldData.map(p =>
        p.id === post.id
          ? {
              ...p,
              likeState: newLikeState,
              likeCount: newLikeCount,
              dislikeCount: newDislikeCount,
            }
          : p
      )
    })
  }

  // 进入追踪模式
  const enterTraceMode = () => {
    resetPosts()
    setTracePost(post.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 点赞
  const handleLike = async () => {
    if (isLiking) return

    // 保存原始状态用于回滚
    const originalState = { likeState, likeCount, dislikeCount }

    // 乐观更新：假设会切换状态（后端决定最终状态）
    // 如果当前已点赞，假设会取消；否则假设会点赞
    const willCancel = likeState === 1
    const optimisticState = willCancel
      ? { likeState: 0 as const, likeCount: likeCount - 1, dislikeCount }
      : { likeState: 1 as const, likeCount: likeCount + 1, dislikeCount }

    // 立即更新UI（乐观更新）
    setLikeState(optimisticState.likeState)
    setLikeCount(optimisticState.likeCount)
    setDislikeCount(optimisticState.dislikeCount)
    setIsLiking(true)

    try {
      // 调用API（后端会根据当前状态自动决定是点赞还是取消）
      await topicService.likePost(post.id)

      // 成功：保持乐观状态，更新Query缓存
      updatePostsCache(
        optimisticState.likeState,
        optimisticState.likeCount,
        optimisticState.dislikeCount
      )
    } catch (error) {
      console.error('[PostItem] likePost API failed for post', post.id, ':', error)
      // 失败：回滚到原始状态
      setLikeState(originalState.likeState)
      setLikeCount(originalState.likeCount)
      setDislikeCount(originalState.dislikeCount)

      // 检查是否是403错误（频率限制）
      if (error instanceof ApiError && error.status === 403) {
        toast.error('操作太快，请稍后再试', {
          description: '请等待几秒后再继续操作',
        })
      }
    } finally {
      setIsLiking(false)
    }
  }

  // 点踩
  const handleDislike = async () => {
    if (isLiking) return

    // 保存原始状态用于回滚
    const originalState = { likeState, likeCount, dislikeCount }

    // 乐观更新：假设会切换状态（后端决定最终状态）
    // 如果当前已点踩，假设会取消；否则假设会点踩
    const willCancel = likeState === 2
    const optimisticState = willCancel
      ? { likeState: 0 as const, likeCount, dislikeCount: dislikeCount - 1 }
      : { likeState: 2 as const, likeCount, dislikeCount: dislikeCount + 1 }

    // 立即更新UI（乐观更新）
    setLikeState(optimisticState.likeState)
    setLikeCount(optimisticState.likeCount)
    setDislikeCount(optimisticState.dislikeCount)
    setIsLiking(true)

    try {
      // 调用API（后端会根据当前状态自动决定是点踩还是取消）
      await topicService.dislikePost(post.id)

      // 成功：保持乐观状态，更新Query缓存
      updatePostsCache(
        optimisticState.likeState,
        optimisticState.likeCount,
        optimisticState.dislikeCount
      )
    } catch (error) {
      console.error('[PostItem] dislike failed for post', post.id, ':', error)
      // 失败：回滚到原始��态
      setLikeState(originalState.likeState)
      setLikeCount(originalState.likeCount)
      setDislikeCount(originalState.dislikeCount)

      // 检查是否是403错误（频率限制）
      if (error instanceof ApiError && error.status === 403) {
        toast.error('操作太快，请稍后再试', {
          description: '请等待几秒后再继续操作',
        })
      }
    } finally {
      setIsLiking(false)
    }
  }

  const handleQuote = () => {
    onQuote(post)
  }

  return (
    <Card id={`post-${post.id}`} className="shadow-md bg-card/50 backdrop-blur-sm scroll-mt-24">
      <CardHeader className="pb-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.isAnonymous ? (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                匿
              </div>
            ) : (
              <Link
                to="/user/id/$id"
                params={{ id: String(post.userId) }}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium hover:bg-muted/70 transition-colors overflow-hidden"
              >
                {portraitUrl ? (
                  <img
                    src={portraitUrl}
                    alt={post.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  post.userName.charAt(0).toUpperCase()
                )}
              </Link>
            )}
            <div>
              <div className="font-medium text-foreground">
                {post.isAnonymous ? (
                  '匿名用户'
                ) : (
                  <Link
                    to="/user/id/$id"
                    params={{ id: String(post.userId) }}
                    className="hover:text-primary transition-colors"
                  >
                    {post.userName}
                  </Link>
                )}
                {post.isLZ && (
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 h-4">
                    楼主
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(post.time), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              #{post.floor}楼
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        {post.contentType === 1 ? (
          <Markdown>{post.content}</Markdown>
        ) : (
          <UbbContainer
            content={post.content}
            className="prose prose-sm dark:prose-invert max-w-none break-words [&_img]:max-w-full [&_img]:h-auto"
          />
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
                likeState === 1 ? 'text-red-500 hover:text-red-600' : 'hover:text-primary'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleDislike}
              disabled={isLiking}
              className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
                likeState === 2 ? 'text-red-500 hover:text-red-600' : 'hover:text-destructive'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{dislikeCount}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleQuote} className="h-7 text-xs px-2">
              <Quote className="w-3 h-3 mr-1" />
              引用
            </Button>
            {!post.isAnonymous && !tracePostId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={enterTraceMode}
                className="h-7 text-xs px-2"
              >
                追踪
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TopicDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[900px]">
      <Skeleton className="w-32 h-6 mb-4 rounded" />
      <Skeleton className="h-40 w-full rounded-lg mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
