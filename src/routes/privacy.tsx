import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-[700px]">
      <h1 className="text-2xl font-bold mb-6">隐私政策</h1>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5 prose prose-sm dark:prose-invert max-w-none space-y-4">
          <h2 className="text-base font-semibold">信息收集</h2>
          <p>
            CC98 论坛仅收集您注册和使用论坛所必要的信息，包括用户名、邮箱地址等，用于账号管理和身份验证。
          </p>
          <h2 className="text-base font-semibold">信息使用</h2>
          <p>
            您的个人信息仅用于论坛功能的正常运作，不会出售或未经授权地共享给第三方。
          </p>
          <h2 className="text-base font-semibold">Cookie</h2>
          <p>
            本站使用 Cookie 和 localStorage 存储登录凭证，以维持您的登录状态。关闭浏览器或主动退出后，相关数据将被清除。
          </p>
          <h2 className="text-base font-semibold">内容责任</h2>
          <p>
            用户在论坛发布的内容由用户本人负责，请遵守中华人民共和国相关法律法规及浙江大学社区规范。
          </p>
          <div className="pt-2 border-t border-border text-muted-foreground text-xs">
            如有疑问，请通过「联系我们」页面与管理团队联系。
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
