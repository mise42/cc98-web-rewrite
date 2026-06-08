import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";

const callbackSearchSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: callbackSearchSchema,
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { code, error, error_description } = Route.useSearch();
  const navigate = useNavigate();
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const searchErrorMsg = useMemo(() => {
    if (error) return error_description ?? error;
    if (!code) return "缺少授权码，无法完成登录";
    return null;
  }, [code, error, error_description]);
  const [oauthErrorMsg, setOauthErrorMsg] = useState<string | null>(null);
  const errorMsg = searchErrorMsg ?? oauthErrorMsg;

  useEffect(() => {
    if (searchErrorMsg) {
      return;
    }

    loginWithOAuth(code)
      .then(() => {
        navigate({ to: "/" });
      })
      .catch((err) => {
        setOauthErrorMsg(err instanceof Error ? err.message : "OAuth 认证失败");
      });
  }, [code, loginWithOAuth, navigate, searchErrorMsg]);

  if (errorMsg) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-destructive mb-3">登录失败</h2>
          <p className="text-muted-foreground mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            返回登录页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⟳</div>
        <p className="text-muted-foreground">正在完成登录，请稍候...</p>
      </div>
    </div>
  );
}
