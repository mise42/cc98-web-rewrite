'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Folder, Search, User as UserIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationControls } from '@/components/common/PaginationControls'
import { ClassicTopicItem } from '@/components/topic/ClassicTopicItem'
import { ErrorState } from '@/components/ui/error-state'
import { topicService } from '@/services/topic'
import { boardService } from '@/services/board'
import { userService } from '@/services/user'
import { ApiError } from '@/services/client'
import type { ITopic, IBoard, IUser } from '@/types/api'

type SearchTab = 'topics' | 'boards' | 'users'

const PAGE_SIZE = 20

const normalizeTab = (value: string | null): SearchTab => {
  if (value === 'boards' || value === 'users') return value
  return 'topics'
}

const shouldRetry = (failureCount: number, error: unknown) => {
  if (error instanceof ApiError && error.isAuthError()) {
    return false
  }
  return failureCount < 3
}

export function SearchPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()

  const keyword = (searchParams.get('keyword') ?? '').trim()
  const tab = normalizeTab(searchParams.get('tab'))
  const pageParam = Number(searchParams.get('page') ?? '1')
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const boardIdParam = Number(searchParams.get('boardId') ?? '0')
  const boardId = Number.isFinite(boardIdParam) && boardIdParam > 0 ? boardIdParam : 0
  const hasKeyword = keyword.length > 0

  const updateSearchParams = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key)
        return
      }
      params.set(key, String(value))
    })
    const query = params.toString()
    router.push(query ? `/search?${query}` : '/search')
  }

  const handleTabChange = (nextTab: string) => {
    const normalized = normalizeTab(nextTab)
    if (normalized === 'topics') {
      updateSearchParams({ tab: normalized, boardId: boardId || 0, page: 1 })
    } else {
      updateSearchParams({ tab: normalized, boardId: undefined, page: undefined })
    }
  }

  const handlePageChange = (page: number) => {
    updateSearchParams({ page })
  }

  const {
    data: topics = [],
    isLoading: topicsLoading,
    error: topicsError,
  } = useQuery<ITopic[]>({
    queryKey: ['search', 'topics', keyword, boardId, currentPage],
    queryFn: () => {
      const from = (currentPage - 1) * PAGE_SIZE
      return topicService.searchTopics(keyword, from, PAGE_SIZE, boardId)
    },
    enabled: tab === 'topics' && hasKeyword,
    staleTime: 1000 * 30,
    retry: shouldRetry,
  })

  const {
    data: boards = [],
    isLoading: boardsLoading,
    error: boardsError,
  } = useQuery<IBoard[]>({
    queryKey: ['search', 'boards', keyword],
    queryFn: () => boardService.searchBoards(keyword),
    enabled: tab === 'boards' && hasKeyword,
    staleTime: 1000 * 30,
    retry: shouldRetry,
  })

  const {
    data: userResult,
    isLoading: userLoading,
    error: userError,
  } = useQuery<IUser | null>({
    queryKey: ['search', 'users', keyword],
    queryFn: async () => {
      try {
        return await userService.getUserByName(keyword)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null
        }
        throw error
      }
    },
    enabled: tab === 'users' && hasKeyword,
    staleTime: 1000 * 30,
    retry: shouldRetry,
  })

  const isTooFrequent = topicsError instanceof ApiError && topicsError.status === 403

  const activeError = tab === 'topics' ? topicsError : tab === 'boards' ? boardsError : userError

  const activeLoading =
    tab === 'topics' ? topicsLoading : tab === 'boards' ? boardsLoading : userLoading

  if (activeLoading) {
    return <SearchSkeleton />
  }

  if (activeError) {
    if (isTooFrequent) {
      return (
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-destructive/10 rounded-full">
                <Search className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-destructive mb-2">搜索过于频繁</h2>
            <p className="text-muted-foreground mb-6">请稍后再试，或缩短关键词范围。</p>
          </div>
        </div>
      )
    }

    return (
      <ErrorState
        error={activeError as Error}
        retry={() =>
          queryClient.invalidateQueries({
            queryKey: ['search', tab, keyword],
          })
        }
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">搜索</h1>
        {hasKeyword && <span className="text-sm text-muted-foreground">关键词：{keyword}</span>}
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="topics">主题</TabsTrigger>
          <TabsTrigger value="boards">版面</TabsTrigger>
          <TabsTrigger value="users">用户</TabsTrigger>
        </TabsList>

        <TabsContent value="topics">
          {!hasKeyword ? (
            <EmptyPrompt message="请输入关键词后搜索主题" />
          ) : topics.length === 0 ? (
            <EmptyPrompt message="没有找到相关主题" />
          ) : (
            <Card className="shadow-md bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {topics.map(topic => (
                    <ClassicTopicItem key={topic.id} topic={topic} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {hasKeyword && topics.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalCount={(topics.length === PAGE_SIZE ? currentPage + 1 : currentPage) * PAGE_SIZE}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
              scrollToTop={true}
            />
          )}
        </TabsContent>

        <TabsContent value="boards">
          {!hasKeyword ? (
            <EmptyPrompt message="请输入关键词后搜索版面" />
          ) : boards.length === 0 ? (
            <EmptyPrompt message="没有找到相关版面" />
          ) : (
            <Card className="shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  版面结果
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {boards.map(board => (
                    <Link
                      key={board.id}
                      href={`/board/${board.id}`}
                      className="block px-6 py-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="font-medium text-foreground">{board.name}</div>
                      {board.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {board.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users">
          {!hasKeyword ? (
            <EmptyPrompt message="请输入用户名后搜索用户" />
          ) : !userResult ? (
            <EmptyPrompt message="没有找到相关用户" />
          ) : (
            <Card className="shadow-md bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Link
                  href={`/user/id/${userResult.id}`}
                  className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                >
                  {userResult.portraitUrl ? (
                    <img
                      src={userResult.portraitUrl}
                      alt={userResult.name}
                      className="h-12 w-12 rounded-full border border-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-semibold text-foreground">{userResult.name}</div>
                    <div className="text-sm text-muted-foreground">
                      发帖数 {userResult.postCount} · 威望 {userResult.prestige}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyPrompt({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="text-center text-muted-foreground">{message}</div>
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-24 h-8 rounded" />
      </div>
      <Card className="shadow-md bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="px-6 py-4">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SearchPage
