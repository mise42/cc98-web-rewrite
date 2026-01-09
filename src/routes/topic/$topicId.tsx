import { createFileRoute } from '@tanstack/react-router'
import { TopicDetailPage } from '@/pages/topic/TopicDetailPage'

export const Route = createFileRoute('/topic/$topicId')({
  component: TopicDetailPage,
})
