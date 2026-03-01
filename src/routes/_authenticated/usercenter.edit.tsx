import { createFileRoute } from '@tanstack/react-router'
import { EditProfilePage } from '@/pages/user/EditProfilePage'

export const Route = createFileRoute('/_authenticated/usercenter/edit')({
  component: EditProfilePage,
})
