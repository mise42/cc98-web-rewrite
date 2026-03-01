import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, MessageSquare, ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-[700px]">
      <h1 className="text-2xl font-bold mb-6">联系我们</h1>
      <div className="space-y-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">邮件反馈</div>
                <p className="text-sm text-muted-foreground mt-1">
                  如有问题或建议，欢迎发送邮件至 CC98 运营团队。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">站内反馈</div>
                <p className="text-sm text-muted-foreground mt-1">
                  在论坛「论坛指南」版块发帖，或私信管理员反馈问题。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">官方渠道</div>
                <p className="text-sm text-muted-foreground mt-1">
                  关注 CC98 官方 bilibili 账号获取最新公告与活动信息。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
