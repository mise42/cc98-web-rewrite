import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, ChevronDown, ChevronRight, MessageSquare, FileText } from "lucide-react";
import { boardService } from "@/services/board";
import type { IChildBoard, IRootBoard } from "@/types/api";

const NO_IMAGE_AREA_IDS = new Set([2, 29, 35, 37, 33, 604]);

export function BoardListPage() {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const {
    data: rootBoards,
    isLoading,
    error,
    refetch,
  } = useQuery<IRootBoard[]>({
    queryKey: ["boards", "all"],
    queryFn: () => boardService.getAllBoards(),
    staleTime: 1000 * 60 * 5,
  });

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!rootBoards) return;
    setExpandedGroups(new Set(rootBoards.map((g) => g.id)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  if (isLoading) {
    return <BoardListSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-4">加载失败</h2>
          <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!rootBoards || rootBoards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">暂无版块数据</div>
      </div>
    );
  }

  const totalBoards = rootBoards.reduce((sum, root) => sum + root.boards.length, 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">版面列表</h1>
          <Badge variant="secondary" className="text-xs">
            {totalBoards} 个版块
          </Badge>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-md transition-colors"
          >
            全部展开
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-md transition-colors"
          >
            全部收起
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {rootBoards.map((rootBoard) => (
          <RootBoardCard
            key={rootBoard.id}
            rootBoard={rootBoard}
            isExpanded={expandedGroups.has(rootBoard.id)}
            onToggle={() => toggleGroup(rootBoard.id)}
            useNoImageStyle={NO_IMAGE_AREA_IDS.has(rootBoard.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface RootBoardCardProps {
  rootBoard: IRootBoard;
  isExpanded: boolean;
  onToggle: () => void;
  useNoImageStyle: boolean;
}

function RootBoardCard({ rootBoard, isExpanded, onToggle, useNoImageStyle }: RootBoardCardProps) {
  const hasChildren = rootBoard.boards.length > 0;

  return (
    <Card className="shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader
        className={`pb-3 cursor-pointer hover:bg-muted/30 transition-colors ${hasChildren ? "" : "cursor-default"}`}
        onClick={hasChildren ? onToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasChildren && (
              <span className="text-muted-foreground">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </span>
            )}
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {rootBoard.name}
            </CardTitle>
          </div>
          {rootBoard.masters && rootBoard.masters.length > 0 && (
            <div className="text-sm text-muted-foreground">
              主管：{rootBoard.masters.join("、")}
            </div>
          )}
        </div>
      </CardHeader>

      {hasChildren && isExpanded && (
        <CardContent className="p-0 border-t border-border">
          {useNoImageStyle ? (
            <div className="flex flex-wrap gap-2 p-4">
              {rootBoard.boards.map((board) => (
                <NoImageBoardItem key={board.id} board={board} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {rootBoard.boards.map((board) => (
                <BoardItem key={board.id} board={board} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface BoardItemProps {
  board: IChildBoard;
}

function BoardItem({ board }: BoardItemProps) {
  const imageUrl = `/static/images/_${board.name}.png`;
  const fallbackUrl = `/static/images/_CC98.png`;

  return (
    <Link
      to="/board/$boardId"
      params={{ boardId: String(board.id) }}
      className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/30 transition-colors group"
    >
      <div className="w-14 h-14 mb-2 relative rounded-full bg-primary p-2 shadow-sm ring-1 ring-primary/25 group-hover:bg-primary/90 transition-colors">
        <img
          src={imageUrl}
          alt={board.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.dataset.fallback) {
              target.dataset.fallback = "true";
              target.src = fallbackUrl;
            }
          }}
        />
      </div>
      <span className="font-medium text-foreground group-hover:text-primary transition-colors text-center text-sm">
        {board.name}
      </span>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <span className="flex items-center gap-0.5">
          <FileText className="w-3 h-3" />
          {board.todayCount}
        </span>
        <span className="flex items-center gap-0.5">
          <MessageSquare className="w-3 h-3" />
          {board.postCount}
        </span>
      </div>
    </Link>
  );
}

function NoImageBoardItem({ board }: BoardItemProps) {
  return (
    <Link
      to="/board/$boardId"
      params={{ boardId: String(board.id) }}
      className="px-3 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 text-sm text-foreground hover:text-primary transition-colors"
    >
      {board.name}
    </Link>
  );
}

function BoardListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-32 h-8 rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
