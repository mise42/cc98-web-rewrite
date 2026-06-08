import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Clock, Folder, Quote } from "lucide-react";
import { userService } from "@/services/user";
import { boardService } from "@/services/board";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { RecentPost } from "@/services/user";

const PAGE_SIZE = 10;

export function MyPostsPage() {
  const params = useParams({ from: "/_authenticated/usercenter/myposts/$page" });
  const page = Number(params.page) || 1;
  const from = (page - 1) * PAGE_SIZE;

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", "me", "posts", page],
    queryFn: () => userService.getRecentPosts(from, PAGE_SIZE),
    staleTime: 1000 * 60,
  });

  const posts = response?.data || [];
  const totalPosts = response?.count || 0;
  const totalPages = Math.ceil(totalPosts / PAGE_SIZE);

  const boardIds = posts.map((p) => p.boardId) || [];
  const { data: boards } = useQuery({
    queryKey: ["boards", "batch", boardIds],
    queryFn: () => Promise.all(boardIds.map((id) => boardService.getBoard(String(id)))),
    enabled: boardIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <MyPostsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">加载失败</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">暂无回复</div>;
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const board = boards?.find((b) => b.id === post.boardId);
        return (
          <PostItem key={post.id} post={post} boardName={board?.name || `版面 ${post.boardId}`} />
        );
      })}

      {page > 1 && (
        <Link
          to="/usercenter/myposts/$page"
          params={{ page: String(page - 1) }}
          className="block text-center text-sm text-muted-foreground hover:text-foreground py-2"
        >
          ← 上一页
        </Link>
      )}

      {page < totalPages && (
        <Link
          to="/usercenter/myposts/$page"
          params={{ page: String(page + 1) }}
          className="block text-center text-sm text-muted-foreground hover:text-foreground py-2"
        >
          下一页 →
        </Link>
      )}
    </div>
  );
}

interface PostItemProps {
  post: RecentPost;
  boardName: string;
}

function PostItem({ post, boardName }: PostItemProps) {
  return (
    <Card className="shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-4 h-4 text-muted-foreground" />
              <Link
                to="/topic/$topicId"
                params={{ topicId: String(post.topicId) }}
                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
              >
                {post.topicTitle}
              </Link>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.content}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" />
                {boardName}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />#{post.floor}楼
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(post.time), "yyyy-MM-dd HH:mm", { locale: zhCN })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MyPostsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-28 w-full rounded-lg" />
      ))}
    </div>
  );
}
