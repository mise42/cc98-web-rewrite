import { Link } from 'react-router'

/**
 * Footer 组件
 * 包含友情链接、版权信息等
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  const friendLinks = [
    { name: '清华大学学生会', url: 'https://www.tsu.tsinghua.edu.cn/' },
    { name: '北京大学未名BBS', url: 'http://bbs.pku.edu.cn/' },
    { name: '复旦大学日月光华BBS', url: 'https://bbs.fudan.edu.cn/' },
    { name: '上海交通大学饮水思源BBS', url: 'https://bbs.sjtu.edu.cn/' },
  ]

  return (
    <footer
      style={{
        background: '#001529',
        color: 'rgba(255, 255, 255, 0.65)',
        padding: '2rem',
        textAlign: 'center',
        marginTop: 'auto',
      }}
    >
      {/* 友情链接 */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>友情链接：</span>
        {friendLinks.map((link, index) => (
          <span key={index}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.65)',
                textDecoration: 'none',
                margin: '0 0.5rem',
              }}
            >
              {link.name}
            </a>
            {index < friendLinks.length - 1 && <span style={{ margin: '0 0.5rem' }}>|</span>}
          </span>
        ))}
      </div>

      {/* 版权信息 */}
      <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
        <p style={{ margin: '0.5rem 0' }}>&copy; {currentYear} CC98. All rights reserved.</p>
        <p style={{ margin: '0.5rem 0' }}>
          <Link to="/about" style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none' }}>
            关于我们
          </Link>
          <span style={{ margin: '0 1rem' }}>|</span>
          <Link
            to="/contact"
            style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none' }}
          >
            联系我们
          </Link>
          <span style={{ margin: '0 1rem' }}>|</span>
          <Link
            to="/privacy"
            style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none' }}
          >
            隐私政策
          </Link>
        </p>
        <p style={{ margin: '0.5rem 0', fontSize: '0.75rem', opacity: 0.5 }}>
          CC98 是清华大学学生社区论坛，致力于为清华师生提供交流平台
        </p>
      </div>
    </footer>
  )
}
