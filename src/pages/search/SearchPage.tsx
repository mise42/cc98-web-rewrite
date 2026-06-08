import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Folder, Search, User as UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/common/PaginationControls";
import { ClassicTopicItem } from "@/components/topic/ClassicTopicItem";
import { ErrorState } from "@/components/ui/error-state";
import { topicService } from "@/services/topic";
import { boardService } from "@/services/board";
import { userService } from "@/services/user";
import { ApiError } from "@/services/client";
import type { ITopic, IBoard, IUser } from "@/types/api";

type SearchTab = "topics" | "boards" | "users";

const PAGE_SIZE = 20;

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError && error.isAuthError()) {
    return false;
  }
  return failureCount < 3;
};

export function SearchPage() {
  const navigate = useNavigate({ from: "/search" });
  const queryClient = useQueryClient();

  const { keyword, tab, page, boardId } = useSearch({ from: "/search" });
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const currentTab: SearchTab = tab;
  const currentBoardId = Number.isFinite(boardId) && boardId > 0 ? boardId : 0;
  const trimmedKeyword = keyword.trim();
  const hasKeyword = trimmedKeyword.length > 0;

  const updateSearch = (updates: Partial<{ tab: SearchTab; page: number; boardId: number }>) => {
    navigate({
      to: "/search",
      search: (prev) => ({
        keyword: prev.keyword,
        tab: updates.tab ?? prev.tab,
        page: updates.page ?? prev.page,
        boardId: updates.boardId ?? prev.boardId,
      }),
    });
  };

  const handleTabChange = (nextTab: string) => {
    const normalizedTab: SearchTab =
      nextTab === "boards" || nextTab === "users" ? nextTab : "topics";

    if (normalizedTab === "topics") {
      updateSearch({ tab: normalizedTab, page: 1, boardId: currentBoardId });
    } else {
      updateSearch({ tab: normalizedTab, page: 1, boardId: 0 });
    }
  };

  const handlePageChange = (nextPage: number) => {
    updateSearch({ page: nextPage });
  };

  const {
    data: topics = [],
    isLoading: topicsLoading,
    error: topicsError,
  } = useQuery<ITopic[]>({
    queryKey: ["search", "topics", trimmedKeyword, currentBoardId, currentPage],
    queryFn: () => {
      const from = (currentPage - 1) * PAGE_SIZE;
      return topicService.searchTopics(trimmedKeyword, from, PAGE_SIZE, currentBoardId);
    },
    enabled: currentTab === "topics" && hasKeyword,
    staleTime: 1000 * 30,
    retry: shouldRetry,
  });

  const {
    data: boards = [],
    isLoading: boardsLoading,
    error: boardsError,
  } = useQuery<IBoard[]>({
    queryKey: ["search", "boards", trimmedKeyword],
    queryFn: () => boardService.searchBoards(trimmedKeyword),
    enabled: currentTab === "boards" && hasKeyword,
    staleTime: 1000 * 30,
    retry: shouldRetry,
  });

  const {
    data: userResult,
    isLoading: userLoading,
    error: userError,
  } = useQuery<IUser | null>({
    queryKey: ["search", "users", trimmedKeyword],
    queryFn: async () => {
      try {
        return await userService.getUserByName(trimmedKeyword);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: currentTab === "users" && hasKeyword,
    staleTime: 1000 * 30,
    retry: shouldRetry,
  });

  const activeError =
    currentTab === "topics" ? topicsError : currentTab === "boards" ? boardsError : userError;

  const activeLoading =
    currentTab === "topics" ? topicsLoading : currentTab === "boards" ? boardsLoading : userLoading;

  if (activeLoading) {
    return <SearchSkeleton />;
  }

  if (activeError) {
    return (
      <ErrorState
        error={activeError as Error}
        retry={() =>
          queryClient.invalidateQueries({
            queryKey: ["search", currentTab, trimmedKeyword],
          })
        }
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">搜索</h1>
        {hasKeyword && (
          <span className="text-sm text-muted-foreground">关键词：{trimmedKeyword}</span>
        )}
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
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
                  {topics.map((topic) => (
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
                  {boards.map((board) => (
                    <Link
                      key={board.id}
                      to="/board/$boardId"
                      params={{ boardId: String(board.id) }}
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
                  to="/user/id/$id"
                  params={{ id: String(userResult.id) }}
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
  );
}

function EmptyPrompt({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="text-center text-muted-foreground">{message}</div>
    </div>
  );
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
  );
}
