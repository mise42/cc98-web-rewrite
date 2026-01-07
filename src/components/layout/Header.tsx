import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Dropdown, Input, Badge, Space } from 'antd'
import { UserOutlined, BellOutlined, SearchOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { useMessageStore } from '@/stores/message'

/**
 * Header 组件
 * 包含导航、搜索、用户信息、消息通知等功能
 */
export function Header() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount } = useMessageStore()
  const [searchValue, setSearchValue] = useState('')

  // 导航菜单项
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/boardlist', label: '版面' },
    { path: '/newtopics', label: '新帖' },
    { path: '/recommendedtopics', label: '精选' },
  ]

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'usercenter',
      icon: <UserOutlined />,
      label: <Link to="/usercenter">个人中心</Link>,
    },
    {
      key: 'message',
      icon: <BellOutlined />,
      label: <Link to="/message">消息中心</Link>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => logout(),
    },
  ]

  // 消息下拉菜单
  const messageMenuItems = [
    {
      key: 'reply',
      label: <Link to="/message">回复我的</Link>,
    },
    {
      key: 'mention',
      label: <Link to="/message">@ 我的</Link>,
    },
    {
      key: 'system',
      label: <Link to="/message">系统通知</Link>,
    },
    {
      key: 'private',
      label: <Link to="/message">我的私信</Link>,
    },
  ]

  // 搜索功能
  const handleSearch = () => {
    if (!searchValue.trim()) return

    // 主题搜索（需要从 URL 提取 boardId）
    const boardMatch = location.pathname.match(/\/board\/(\d+)/)
    const boardId = boardMatch ? boardMatch[1] : '0'
    window.location.href = `/search?boardId=${boardId}&keyword=${encodeURIComponent(searchValue)}`
  }

  return (
    <header
      style={{
        background: '#001529',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>CC98</h1>
      </Link>

      {/* 导航菜单 */}
      <nav style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              color: location.pathname === item.path ? '#1890ff' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'all 0.3s',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 搜索框 */}
      <div style={{ marginRight: '1rem' }}>
        <Input.Search
          placeholder="搜索主题、版面、用户"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
        />
      </div>

      {/* 右侧区域 */}
      <Space size="middle">
        {/* 消息通知 */}
        {isAuthenticated && (
          <Dropdown menu={{ items: messageMenuItems }} placement="bottomRight">
            <Badge count={unreadCount} size="small" offset={[-5, 5]}>
              <BellOutlined
                style={{
                  fontSize: '1.2rem',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.5rem',
                }}
              />
            </Badge>
          </Dropdown>
        )}

        {/* 用户信息 / 登录按钮 */}
        {isAuthenticated && user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: 'white' }}>
              {user.portraitUrl ? (
                <img
                  src={user.portraitUrl}
                  alt={user.name}
                  style={{ width: 32, height: 32, borderRadius: '50%' }}
                  onError={e => {
                    console.error('头像加载失败:', user.portraitUrl, e)
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                  onLoad={() => {
                    console.log('头像加载成功:', user.portraitUrl)
                  }}
                />
              ) : (
                <UserOutlined style={{ fontSize: '1.2rem' }} />
              )}
              <span>{user.name}</span>
            </Space>
          </Dropdown>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
            登录
          </Link>
        )}
      </Space>
    </header>
  )
}
