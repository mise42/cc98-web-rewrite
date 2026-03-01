import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { FollowedBoardsPage } from '@/pages/user-center'

const followingBoardsSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  mode: z.enum(['pagination', 'infinite']).optional().default('pagination'),
})

export const Route = createFileRoute('/_authenticated/following/boards')({
  validateSearch: followingBoardsSearchSchema,
  component: FollowedBoardsPage,
})
