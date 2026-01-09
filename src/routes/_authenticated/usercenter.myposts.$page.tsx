import { createFileRoute } from '@tanstack/react-router'
import { MyPostsPage } from '@/pages/user-center'

export const Route = createFileRoute('/_authenticated/usercenter/myposts/$page')({
  component: MyPostsPage,
})
