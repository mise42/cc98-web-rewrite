import { create } from "zustand";
import type { IPost } from "@/types/api";

interface TopicViewState {
  // 视图模式：分页或无限滚动
  viewMode: "pagination" | "infinite";

  // 分页模式状态
  currentPage: number;
  pageSize: number;

  // 无限滚动模式状态
  allPosts: IPost[];
  hasMore: boolean;
  isLoadingMore: boolean;

  // 追踪模式
  tracePostId: number | null;

  // 操作方法
  setViewMode: (mode: "pagination" | "infinite") => void;
  setCurrentPage: (page: number) => void;
  setAllPosts: (posts: IPost[]) => void;
  appendPosts: (posts: IPost[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoadingMore: (isLoading: boolean) => void;
  resetPosts: () => void;
  setTracePost: (postId: number | null) => void;
}

export const useTopicViewStore = create<TopicViewState>((set) => ({
  // 初始状态
  viewMode: "pagination",
  currentPage: 1,
  pageSize: 20,
  allPosts: [],
  hasMore: true,
  isLoadingMore: false,
  tracePostId: null,

  // 设置视图模式
  setViewMode: (mode) => {
    set({ viewMode: mode });
    // 切换模式时重置状态
    if (mode === "infinite") {
      set({ currentPage: 1 });
    } else {
      set({ allPosts: [], hasMore: true });
    }
  },

  // 设置当前页
  setCurrentPage: (page) => set({ currentPage: page }),

  // 设置所有帖子（用于无限滚动初始化）
  setAllPosts: (posts) => set({ allPosts: posts }),

  // 追加帖子（用于无限滚动加载更多）
  appendPosts: (posts) =>
    set((state) => ({
      allPosts: [...state.allPosts, ...posts],
    })),

  // 设置是否还有更多数据
  setHasMore: (hasMore) => set({ hasMore }),

  // 设置加载中状态
  setIsLoadingMore: (isLoading) => set({ isLoadingMore: isLoading }),

  // 重置帖子数据
  resetPosts: () =>
    set({
      allPosts: [],
      currentPage: 1,
      hasMore: true,
      isLoadingMore: false,
    }),

  // 设置追踪帖子
  setTracePost: (postId) => set({ tracePostId: postId }),
}));
