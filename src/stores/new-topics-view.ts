import { create } from "zustand";
import type { ITopic } from "@/types/api";

interface NewTopicsViewState {
  // 视图模式：分页或无限滚动
  viewMode: "pagination" | "infinite";

  // 分页模式状态
  currentPage: number;
  pageSize: number;

  // 无限滚动模式状态
  allTopics: ITopic[];
  hasMore: boolean;
  isLoadingMore: boolean;

  // 操作方法
  setViewMode: (mode: "pagination" | "infinite") => void;
  setCurrentPage: (page: number) => void;
  setAllTopics: (topics: ITopic[]) => void;
  appendTopics: (topics: ITopic[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoadingMore: (isLoading: boolean) => void;
  resetTopics: () => void;
}

/**
 * 新帖页面的视图状态管理
 *
 * 管理新帖页面的分页/无限滚动模式切换和状态
 */
export const useNewTopicsViewStore = create<NewTopicsViewState>((set) => ({
  // 初始状态
  viewMode: "pagination",
  currentPage: 1,
  pageSize: 20,
  allTopics: [],
  hasMore: true,
  isLoadingMore: false,

  // 设置视图模式
  setViewMode: (mode) => {
    set({ viewMode: mode });
    // 切换模式时重置状态
    if (mode === "infinite") {
      set({
        currentPage: 1,
        allTopics: [],
        hasMore: true,
        isLoadingMore: false,
      });
    } else {
      set({
        currentPage: 1,
        allTopics: [],
      });
    }
  },

  // 设置当前页
  setCurrentPage: (page) => set({ currentPage: page }),

  // 设置所有帖子（用于无限滚动初始化）
  setAllTopics: (topics) => set({ allTopics: topics }),

  // 追加帖子（用于无限滚动加载更多）
  appendTopics: (topics) =>
    set((state) => ({
      allTopics: [...state.allTopics, ...topics],
    })),

  // 设置是否还有更多数据
  setHasMore: (hasMore) => set({ hasMore }),

  // 设置加载中状态
  setIsLoadingMore: (isLoading) => set({ isLoadingMore: isLoading }),

  // 重置帖子数据
  resetTopics: () =>
    set({
      allTopics: [],
      currentPage: 1,
      hasMore: true,
      isLoadingMore: false,
    }),
}));
