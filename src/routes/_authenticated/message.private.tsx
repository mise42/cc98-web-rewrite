import { createFileRoute } from '@tanstack/react-router'
import { MessageCenterPage } from '@/pages/message'

export const Route = createFileRoute('/_authenticated/message/private')({
  component: () => <MessageCenterPage activeTab="private" />,
})
