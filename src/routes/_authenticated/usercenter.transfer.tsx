import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { TransferPage } from '@/pages/user-center'

function UserCenterTransferRoute() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[900px]">
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/usercenter"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          个人中心
        </Link>
        <h1 className="text-xl font-bold">转账系统</h1>
      </div>
      <TransferPage />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/usercenter/transfer')({
  component: UserCenterTransferRoute,
})
