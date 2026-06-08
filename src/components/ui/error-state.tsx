import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ApiError } from "@/services/client";

interface ErrorStateProps {
  error: Error | null;
  retry?: () => void;
}

export function ErrorState({ error, retry }: ErrorStateProps) {
  const isAuthError = error instanceof ApiError && error.isAuthError();
  const message = error?.message || "未知错误";

  if (isAuthError) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">需要登录</h2>
          <p className="text-muted-foreground mb-6">您没有权限访问此内容，请先登录或注册账号。</p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="text-white">
              <Link to="/login">立即登录</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-destructive mb-2">加载失败</h2>
        <p className="text-muted-foreground mb-6 break-words">{message}</p>
        {retry && (
          <Button onClick={retry} variant="default">
            重试
          </Button>
        )}
      </div>
    </div>
  );
}
