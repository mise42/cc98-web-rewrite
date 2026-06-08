import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TopicViewMode = "classic" | "card" | "media-only";

interface TopicViewModeState {
  mode: TopicViewMode;
  setMode: (mode: TopicViewMode) => void;
}

export const useTopicViewModeStore = create<TopicViewModeState>()(
  persist(
    (set) => ({
      mode: "classic", // 默认经典模式
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "topic-view-mode-storage", // localStorage key
    },
  ),
);
