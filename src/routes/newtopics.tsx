import { createFileRoute } from '@tanstack/react-router'
import { NewTopicsPage } from '@/pages/topics/NewTopicsPage'

export const Route = createFileRoute('/newtopics')({
  component: NewTopicsPage,
})
