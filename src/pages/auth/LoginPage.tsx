import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Form, Input, Button, Card, message, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'

/**
 * 登录页组件
 * 支持用户名密码登录和 OAuth2 登录
 */
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithOAuth, isAuthenticated, isLoading } = useAuth()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 如果已登录，跳转到首页或原访问页面
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, location])

  // 用户名密码登录
  const handlePasswordLogin = async (values: { username: string; password: string }) => {
    try {
      setIsSubmitting(true)
      await login(values.username, values.password)
      message.success('登录成功！')
      // 跳转逻辑在 useEffect 中处理
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || '登录失败，请检查用户名和密码')
      } else {
        message.error('登录失败，请稍后重试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // OAuth2 登录
  const handleOAuthLogin = async () => {
    try {
      setIsSubmitting(true)
      // 直接调用 authService 的 loginWithOAuth 方法
      await authService.loginWithOAuth()
      // OAuth2 会跳转到外部登录页面，不需要处理跳转
    } catch (error) {
      message.error('OAuth2 登录失败，请稍后重试')
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
      }}
    >
      <Card
        title={
          <Space>
            <LoginOutlined />
            <span>用户登录</span>
          </Space>
        }
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <Form form={form} onFinish={handlePasswordLogin} autoComplete="off" layout="vertical">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              block
              icon={<LoginOutlined />}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <Button
          size="large"
          onClick={handleOAuthLogin}
          loading={isSubmitting}
          block
          style={{ marginBottom: '1rem' }}
        >
          使用 OAuth2 登录
        </Button>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#999' }}>
          还没有账号？
          <a href="https://account.cc98.org/" target="_blank" rel="noopener noreferrer">
            立即注册
          </a>
        </div>
      </Card>
    </div>
  )
}
