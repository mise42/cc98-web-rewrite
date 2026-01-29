import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const cc98Links = [
    { name: 'CC98论坛', url: 'https://www.cc98.org' },
    { name: 'bilibili官号', url: 'https://space.bilibili.com/222288454' },
    { name: 'NexusHD高清社区', url: 'https://www.nexushd.org' },
    { name: '雕塑流年', url: '/user/id/517471' },
    { name: 'CC98舞团', url: 'https://space.bilibili.com/695376760' },
    { name: 'CC98竞猜中心', url: 'https://gaming.cc98.org' },
    { name: 'CC98抽卡游戏', url: 'https://card.cc98.org' },
    { name: 'CC98账户管理', url: 'https://account.cc98.org' },
    { name: 'CC98登录中心', url: 'https://openid.cc98.org' },
  ]

  const friendLinks = [
    { name: '浙江大学', url: 'http://www.zju.edu.cn' },
    { name: '浙江大学党委宣传部', url: 'http://xcb.zju.edu.cn' },
    { name: '浙江大学计算机学院', url: 'http://www.cs.zju.edu.cn' },
    { name: 'ZJUers轻首页', url: 'https://zjuers.com' },
    { name: '求是潮', url: 'https://www.qsc.zju.edu.cn' },
    { name: '浙大图助', url: 'http://www.zjulib.com' },
    { name: '浙江大学广播电视网', url: 'https://www.zdgd.zju.edu.cn' },
    { name: '飘渺水云间', url: 'http://www.zju88.org/agent/index.do' },
    { name: '缘网', url: 'http://luckweb.057101.com/bt2/index.asp' },
  ]

  return (
    <footer className="w-full border-t border-border bg-background py-8 text-sm text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <span className="font-semibold text-foreground">CC98运营管理团队：</span>
            {cc98Links.map((link, index) => (
              <div key={index} className="flex items-center">
                {link.url.startsWith('/user') ? (
                  <Link href={link.url} className="hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                )}
                {index < cc98Links.length - 1 && (
                  <span className="mx-2 text-muted-foreground">|</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <span className="font-semibold text-foreground">友情链接：</span>
            {friendLinks.map((link, index) => (
              <div key={index} className="flex items-center">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
                {index < friendLinks.length - 1 && (
                  <span className="mx-2 text-muted-foreground">|</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator className="w-24 bg-border" />

        <div className="flex flex-col items-center gap-2 text-center">
          <p>&copy; {currentYear} CC98. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-primary transition-colors">
              关于我们
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              联系我们
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              隐私政策
            </Link>
            <a href="mailto:contact@cc98.org" className="hover:text-primary transition-colors">
              Email: contact@cc98.org
            </a>
          </div>

          <p className="text-xs text-muted-foreground/60 mt-2">
            CC98 是浙江大学学生社区论坛，致力于为浙大师生提供交流平台
          </p>
        </div>
      </div>
    </footer>
  )
}
