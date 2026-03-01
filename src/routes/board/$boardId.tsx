import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { BoardDetailPage } from '@/pages/board/BoardDetailPage'
import { useAuthStore } from '@/stores/auth'
import { boardService } from '@/services/board'
import type { IBoard } from '@/types/api'

const boardSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  mode: z.enum(['pagination', 'infinite']).optional().default('pagination'),
  tab: z.enum(['topics', 'essence']).optional().default('topics'),
})

export const Route = createFileRoute('/board/$boardId')({
  validateSearch: boardSearchSchema,
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading } = useAuthStore.getState()

    if (!isLoading && !isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },

  // 修改 loader：返回 board 数据供 head 使用
  loader: async ({ params, context }) => {
    const board = await context.queryClient.ensureQueryData<IBoard>({
      queryKey: ['board', params.boardId],
      queryFn: () => boardService.getBoard(params.boardId),
    })
    return { board }
  },

  // 添加动态标题配置
  head: ({ loaderData }) => {
    const board = loaderData.board as IBoard | undefined
    const boardName = board?.name || '版面详情'

    return {
      meta: [
        {
          title: `${boardName} - CC98 论坛`,
        },
        {
          name: 'description',
          content: board?.description
            ? `${board.name} - ${board.description}`
            : `${boardName} - CC98 论坛`,
        },
      ],
    }
  },

  component: BoardDetailPage,
})
