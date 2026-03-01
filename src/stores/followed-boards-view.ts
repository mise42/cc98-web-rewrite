import { create } from 'zustand'
import type { ITopic } from '@/types/api'

interface FollowedBoardsViewState {
  viewMode: 'pagination' | 'infinite'
  currentPage: number
  pageSize: number
  allTopics: ITopic[]
  hasMore: boolean
  isLoadingMore: boolean
  setViewMode: (mode: 'pagination' | 'infinite') => void
  setCurrentPage: (page: number) => void
  setAllTopics: (topics: ITopic[]) => void
  appendTopics: (topics: ITopic[]) => void
  setHasMore: (hasMore: boolean) => void
  setIsLoadingMore: (isLoading: boolean) => void
  resetTopics: () => void
}

export const useFollowedBoardsViewStore = create<FollowedBoardsViewState>(set => ({
  viewMode: 'pagination',
  currentPage: 1,
  pageSize: 20,
  allTopics: [],
  hasMore: true,
  isLoadingMore: false,

  setViewMode: mode => {
    set({ viewMode: mode })
    if (mode === 'infinite') {
      set({
        currentPage: 1,
        allTopics: [],
        hasMore: true,
        isLoadingMore: false,
      })
    } else {
      set({
        currentPage: 1,
        allTopics: [],
      })
    }
  },

  setCurrentPage: page => set({ currentPage: page }),
  setAllTopics: topics => set({ allTopics: topics }),
  appendTopics: topics =>
    set(state => ({
      allTopics: [...state.allTopics, ...topics],
    })),
  setHasMore: hasMore => set({ hasMore }),
  setIsLoadingMore: isLoading => set({ isLoadingMore: isLoading }),
  resetTopics: () =>
    set({
      allTopics: [],
      currentPage: 1,
      hasMore: true,
      isLoadingMore: false,
    }),
}))
