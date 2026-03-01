import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/following/')({
  component: () => <Navigate to="/following/users" />,
})
