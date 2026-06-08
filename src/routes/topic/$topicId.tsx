import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { TopicDetailPage } from "@/pages/topic/TopicDetailPage";
import { useAuthStore } from "@/stores/auth";
import { topicService } from "@/services/topic";
import type { ITopic } from "@/types/api";

const topicSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  mode: z.enum(["pagination", "infinite"]).optional().default("pagination"),
});

export const Route = createFileRoute("/topic/$topicId")({
  validateSearch: topicSearchSchema,
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading } = useAuthStore.getState();

    if (!isLoading && !isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },

  // 修改 loader：返回 topic 数据供 head 使用
  loader: async ({ params, context }) => {
    const numericTopicId = parseInt(params.topicId, 10);
    const topic = await context.queryClient.ensureQueryData<ITopic>({
      queryKey: ["topic", numericTopicId],
      queryFn: () => topicService.getTopic(numericTopicId),
    });
    return { topic };
  },

  // 添加动态标题配置
  head: ({ loaderData }) => {
    const topic = loaderData?.topic as ITopic | undefined;
    let topicTitle = topic?.title || "帖子详情";

    // 截断过长的标题（保留 50 个字符）
    if (topicTitle.length > 50) {
      topicTitle = topicTitle.slice(0, 47) + "...";
    }

    return {
      meta: [
        {
          title: `${topicTitle} - CC98 论坛`,
        },
        {
          name: "description",
          content: topic?.content
            ? `${topic.title} - ${topic.content.slice(0, 150)}...`
            : `${topicTitle} - CC98 论坛`,
        },
      ],
    };
  },

  component: TopicDetailPage,
});
