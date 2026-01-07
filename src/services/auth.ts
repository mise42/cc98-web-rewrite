import { apiClient } from './client'
import TokenManager from '@/lib/token-manager'
import { Constants } from '@/config/constants'
import type { IUser } from '@/types/api'

/**
 * 认证服务接口
 */
export interface LoginCredentials {
  username: string
  password: string
}

/**
 * OAuth Token 响应类型
 */
interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  user: IUser
  token: string
}

/**
 * 认证服务
 */
export const authService = {
  /**
   * 用户名密码登录
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const params = new URLSearchParams({
      client_id: Constants.oauth.clientId,
      client_secret: Constants.oauth.clientSecret,
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
      scope: Constants.oauth.scope,
    })

    const response = await fetch(Constants.oauth.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || '登录失败')
    }

    const data: TokenResponse = await response.json()
    const token = `${data.token_type} ${data.access_token}`

    // 保存 tokens
    TokenManager.setAccessToken(token, data.expires_in)
    TokenManager.setRefreshToken(data.refresh_token)

    // 获取用户信息
    const user = await this.getCurrentUser()

    return { user, token }
  },

  /**
   * OAuth 授权码模式回调处理
   */
  async handleOAuthCallback(code: string, redirectUri?: string): Promise<LoginResponse> {
    const params = new URLSearchParams({
      client_id: Constants.oauth.clientId,
      client_secret: Constants.oauth.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri || Constants.oauth.redirectUri,
      scope: Constants.oauth.scope,
    })

    const response = await fetch(Constants.oauth.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'OAuth 认证失败')
    }

    const data: TokenResponse = await response.json()
    const token = `${data.token_type} ${data.access_token}`

    // 保存 tokens
    TokenManager.setAccessToken(token, data.expires_in)
    TokenManager.setRefreshToken(data.refresh_token)

    // 获取用户信息
    const user = await this.getCurrentUser()

    return { user, token }
  },

  /**
   * 发起 OAuth2 授权码模式登录
   */
  loginWithOAuth(): void {
    const params = new URLSearchParams({
      client_id: Constants.oauth.clientId,
      redirect_uri: Constants.oauth.redirectUri,
      response_type: 'code',
      scope: Constants.oauth.scope,
    })
    const authUrl = `${Constants.oauth.authorizeEndpoint}?${params.toString()}`
    window.location.href = authUrl
  },

  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(): Promise<IUser> {
    return apiClient.get<IUser>('/user/me')
  },

  /**
   * 登出
   */
  async logout(): Promise<void> {
    TokenManager.clear()
  },

  /**
   * 刷新用户信息
   */
  async refreshUserInfo(): Promise<IUser> {
    return this.getCurrentUser()
  },
}
