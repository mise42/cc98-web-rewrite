import { createFileRoute } from '@tanstack/react-router'
import { configService } from '@/services/config'
import { HomePage } from '@/pages/home/HomePage'

// 定义 Query Options
export const homeQueryOptions = () => ({
  queryKey: ['config', 'index'],
  queryFn: () => configService.getIndex(),
  staleTime: 1000 * 60, // 1 分钟
})

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    // 在路由级别预加载数据
    await context.queryClient.ensureQueryData(homeQueryOptions())
  },
  head: () => ({
    meta: [
      {
        title: 'CC98 论坛',
      },
    ],
  }),
  component: HomePage,
})
