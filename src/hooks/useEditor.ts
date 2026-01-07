import { useEditorStore } from '@/stores/editor'

/**
 * 编辑器 Hook
 */
export function useEditor() {
  const {
    mode,
    ubbContent,
    markdownContent,
    setMode,
    setUbbContent,
    setMarkdownContent,
    clearContents,
  } = useEditorStore()

  return {
    mode,
    ubbContent,
    markdownContent,
    setMode,
    setUbbContent,
    setMarkdownContent,
    clearContents,
    isUbbMode: mode === 'ubb',
    isMarkdownMode: mode === 'markdown',
  }
}
