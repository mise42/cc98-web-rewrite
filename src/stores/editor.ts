import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 编辑器模式
 */
type EditorMode = 'ubb' | 'markdown'

/**
 * 编辑器状态
 */
interface EditorState {
  mode: EditorMode
  ubbContent: string
  markdownContent: string

  setMode: (mode: EditorMode) => void
  setUbbContent: (content: string) => void
  setMarkdownContent: (content: string) => void
  clearContents: () => void
}

/**
 * 编辑器 Store
 */
export const useEditorStore = create<EditorState>()(
  persist(
    set => ({
      mode: 'ubb',
      ubbContent: '',
      markdownContent: '',

      setMode: mode => set({ mode }),

      setUbbContent: content => set({ ubbContent: content }),

      setMarkdownContent: content => set({ markdownContent: content }),

      clearContents: () => set({ ubbContent: '', markdownContent: '' }),
    }),
    {
      name: 'editor-storage',
    }
  )
)
