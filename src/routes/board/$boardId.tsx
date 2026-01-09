import { createFileRoute } from '@tanstack/react-router'
import { BoardDetailPage } from '@/pages/board/BoardDetailPage'

export const Route = createFileRoute('/board/$boardId')({
  component: BoardDetailPage,
})
