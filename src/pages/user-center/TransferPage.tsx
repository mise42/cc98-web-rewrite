import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function TransferPage() {
  const [toUserName, setToUserName] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (!toUserName.trim()) {
      toast.error('请输入收款用户名')
      return
    }

    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('请输入正确的转账金额')
      return
    }

    toast.info('转账系统后端接口暂未开放，已完成表单校验')
  }

  return (
    <Card className="shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">转账系统</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">收款用户名</label>
          <input
            value={toUserName}
            onChange={e => setToUserName(e.target.value)}
            placeholder="请输入用户名"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">金额</label>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="请输入金额"
            type="number"
            min="1"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">备注</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="转账说明（可选）"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          注：当前版本仅提供交互与校验，正式转账能力待后端接口开放。
        </div>

        <Button onClick={handleSubmit}>发起转账</Button>
      </CardContent>
    </Card>
  )
}
