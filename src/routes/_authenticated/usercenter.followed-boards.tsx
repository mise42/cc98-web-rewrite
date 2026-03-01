import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/usercenter/followed-boards')({
  component: () => <Navigate to="/following/boards" />,
})
