import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Spin, Result, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'

/**
 * OAuth2 回调处理页面
 * 处理 OAuth2 授权码模式的回调
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithOAuth } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 从 URL 获取 code 参数
        const params = new URLSearchParams(location.search)
        const code = params.get('code')

        if (!code) {
          throw new Error('未找到授权码')
        }

        // 调用 OAuth 回调处理
        await loginWithOAuth(code)

        setStatus('success')

        // 跳转到首页或原访问页面
        setTimeout(() => {
          const from = localStorage.getItem('logOnRedirectUrl') || '/'
          localStorage.removeItem('logOnRedirectUrl')
          navigate(from, { replace: true })
        }, 1000)
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'OAuth 认证失败')
      }
    }

    handleCallback()
  }, [location.search, loginWithOAuth, navigate])

  // 加载状态
  if (status === 'loading') {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} />
          <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#666' }}>正在登录...</p>
        </div>
      </div>
    )
  }

  // 成功状态
  if (status === 'success') {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Result
          status="success"
          title="登录成功！"
          subTitle="正在跳转..."
          style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}
        />
      </div>
    )
  }

  // 错误状态
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Result
        status="error"
        title="OAuth 认证失败"
        subTitle={errorMessage}
        extra={
          <Button type="primary" onClick={() => navigate('/login', { replace: true })}>
            返回登录页
          </Button>
        }
        style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}
      />
    </div>
  )
}
