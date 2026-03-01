import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SearchPage } from '@/pages/search/SearchPage'

const searchPageSchema = z.object({
  keyword: z.string().optional().default(''),
  tab: z.enum(['topics', 'boards', 'users']).optional().default('topics'),
  page: z.coerce.number().int().positive().optional().default(1),
  boardId: z.coerce.number().int().nonnegative().optional().default(0),
})

export const Route = createFileRoute('/search')({
  validateSearch: searchPageSchema,
  head: () => ({
    meta: [
      {
        title: '搜索 - CC98 论坛',
      },
    ],
  }),
  component: SearchPage,
})
