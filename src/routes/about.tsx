import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-[700px]">
      <h1 className="text-2xl font-bold mb-6">关于 CC98</h1>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5 prose prose-sm dark:prose-invert max-w-none space-y-4">
          <p>
            CC98 是浙江大学的校园 BBS 论坛，创建于 1998 年，是浙江大学师生交流、分享的重要平台。
          </p>
          <p>论坛涵盖学习交流、校园生活、娱乐休闲、求职就业等多个版块，拥有数十万注册用户。</p>
          <p>
            本项目为 CC98 论坛前端重写版本，基于 React + Vite + TanStack Router 构建，追求更好的
            用户体验与性能。
          </p>
          <div className="pt-2 border-t border-border text-muted-foreground text-xs">
            <p>
              技术栈：React 19 · TypeScript · Vite · TanStack Router · TanStack Query · Ant Design ·
              Zustand
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
