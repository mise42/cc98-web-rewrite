import { createFileRoute } from '@tanstack/react-router'
import { BoardListPage } from '@/pages/board/BoardListPage'

export const Route = createFileRoute('/boardlist')({
  component: BoardListPage,
})
