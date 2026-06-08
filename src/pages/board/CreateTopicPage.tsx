import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { boardService } from "@/services/board";
import { topicService } from "@/services/topic";
import { FormatToolbar } from "@/components/editor";

interface CreateTopicPageProps {
  boardId: string;
}

export function CreateTopicPage({ boardId }: CreateTopicPageProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<0 | 1>(0); // 0=UBB, 1=Markdown
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: board } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => boardService.getBoard(boardId),
    staleTime: 1000 * 60 * 5,
  });

  async function handleSubmit() {
    if (!title.trim()) {
      setError("请输入帖子标题");
      return;
    }
    if (!content.trim()) {
      setError("请输入帖子内容");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const topic = await topicService.createTopic(Number(boardId), {
        title: title.trim(),
        content: content.trim(),
        contentType,
      });

      // 发帖成功后跳转到帖子详情页
      navigate({
        to: "/topic/$topicId",
        params: { topicId: String(topic.id) },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "发帖失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[900px]">
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: "/board/$boardId", params: { boardId } })}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回 {board?.name ?? "版面"}
        </button>
      </div>

      <Card className="shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-xl">
            发新帖
            {board && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                · {board.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          {/* 标题 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              标题 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入帖子标题"
              maxLength={80}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary"
            />
            <div className="text-xs text-muted-foreground text-right">{title.length}/80</div>
          </div>

          {/* 内容类型切换 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground mr-1">格式：</span>
            <Button
              variant={contentType === 0 ? "default" : "outline"}
              size="sm"
              onClick={() => setContentType(0)}
            >
              UBB
            </Button>
            <Button
              variant={contentType === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setContentType(1)}
            >
              Markdown
            </Button>
          </div>

          {/* 正文 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              正文 <span className="text-destructive">*</span>
            </label>
            <FormatToolbar
              mode={contentType === 0 ? "ubb" : "markdown"}
              value={content}
              onChange={setContent}
              textareaRef={contentEditorRef}
            />
            <textarea
              ref={contentEditorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                contentType === 0
                  ? "支持 UBB 标记，例如 [b]粗体[/b]、[img]图片地址[/img]"
                  : "支持 Markdown 格式，例如 **粗体**、![图片](地址)"
              }
              className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary resize-y"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/board/$boardId", params: { boardId } })}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-1.5">
              <Send className="w-4 h-4" />
              {isSubmitting ? "发布中..." : "发布帖子"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
