/**
 * Header 组件（占位符）
 * TODO: 在阶段 3.2 中实现完整的 Header
 */
export function Header() {
  return (
    <header
      style={{
        background: '#001529',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>CC98</h1>
      <nav style={{ marginLeft: '2rem', display: 'flex', gap: '1rem' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none' }}>
          首页
        </a>
        <a href="/boardlist" style={{ color: 'white', textDecoration: 'none' }}>
          版面
        </a>
      </nav>
    </header>
  )
}
