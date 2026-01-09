import { createFileRoute } from '@tanstack/react-router'
import { MyTopicsPage } from '@/pages/user-center'

export const Route = createFileRoute('/_authenticated/usercenter/mytopics/$page')({
  component: MyTopicsPage,
})
