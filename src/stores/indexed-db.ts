import { create } from 'zustand'

/**
 * IndexedDB 状态
 */
interface IndexedDBState {
  isInitialized: boolean
  isInitializing: boolean
  error: string | null

  init: () => Promise<void>
}

/**
 * IndexedDB Store
 */
export const useIndexedDBStore = create<IndexedDBState>()((set, get) => ({
  isInitialized: false,
  isInitializing: false,
  error: null,

  init: async () => {
    const state = get()
    if (state.isInitialized || state.isInitializing) return

    set({ isInitializing: true })
    try {
      await import('@/lib/indexed-db').then(module => module.db)
      set({ isInitialized: true, isInitializing: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'IndexedDB 初始化失败',
        isInitializing: false,
      })
    }
  },
}))
