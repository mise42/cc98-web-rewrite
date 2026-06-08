import { useEffect } from "react";
import { messageService } from "@/services/message";
import { useAuthStore } from "@/stores/auth";
import { useMessageStore } from "@/stores/message";
import { useSignalR } from "./useSignalR";

/**
 * 消息同步 Hook
 * - 拉取初始未读数
 * - 建立 SignalR 实时连接
 */
export function useMessageSync() {
  const { isAuthenticated } = useAuthStore();
  const { setUnreadSummary, clearMessages } = useMessageStore();

  useSignalR();

  useEffect(() => {
    if (!isAuthenticated) {
      clearMessages();
      return;
    }

    let cancelled = false;

    messageService
      .getUnreadCount()
      .then((summary) => {
        if (!cancelled) {
          setUnreadSummary(summary);
        }
      })
      .catch((error) => {
        console.error("Failed to sync unread message count:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setUnreadSummary, clearMessages]);
}
