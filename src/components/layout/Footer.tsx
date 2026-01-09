import { Link } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const friendLinks = [
    { name: '清华大学学生会', url: 'https://www.tsu.tsinghua.edu.cn/' },
    { name: '北京大学未名BBS', url: 'http://bbs.pku.edu.cn/' },
    { name: '复旦大学日月光华BBS', url: 'https://bbs.fudan.edu.cn/' },
    { name: '上海交通大学饮水思源BBS', url: 'https://bbs.sjtu.edu.cn/' },
  ]

  return (
    <footer className="w-full border-t border-border bg-background py-8 text-sm text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6">
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
                <Separator orientation="vertical" className="h-3 mx-3 bg-border" />
              )}
            </div>
          ))}
        </div>

        <Separator className="w-24 bg-border" />

        <div className="flex flex-col items-center gap-2 text-center">
          <p>&copy; {currentYear} CC98. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-primary transition-colors">
              关于我们
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              联系我们
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              隐私政策
            </Link>
          </div>

          <p className="text-xs text-muted-foreground/60 mt-2">
            CC98 是清华大学学生社区论坛，致力于为清华师生提供交流平台
          </p>
        </div>
      </div>
    </footer>
  )
}
