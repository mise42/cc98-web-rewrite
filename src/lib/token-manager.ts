/**
 * Token 管理器
 * 负责管理 OAuth2 access token 和 refresh token
 */
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private static readonly TOKEN_EXPIRES_AT_KEY = 'token_expires_at'
  private static readonly REFRESH_TOKEN_EXPIRES_AT = 'refresh_token_expires_at'

  /**
   * 获取有效的 access token
   * 如果 token 过期或不存在，尝试刷新
   */
  async getAccessToken(): Promise<string | null> {
    // 检查现有的有效 token
    const token = localStorage.getItem(TokenManager.ACCESS_TOKEN_KEY)
    const expiresAt = localStorage.getItem(TokenManager.TOKEN_EXPIRES_AT_KEY)

    if (token && expiresAt) {
      const expiresAtNum = Number(expiresAt)
      // 提前 5 分钟刷新 token
      if (Date.now() < expiresAtNum - 5 * 60 * 1000) {
        return token
      }
    }

    // Token 过期或不存在，尝试刷新
    return this.refreshAccessToken()
  }

  /**
   * 刷新 access token
   */
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(TokenManager.REFRESH_TOKEN_KEY)

    // 检查 refresh token 是否过期
    const refreshExpiresAt = localStorage.getItem(TokenManager.REFRESH_TOKEN_EXPIRES_AT)
    if (refreshExpiresAt && Date.now() > Number(refreshExpiresAt)) {
      // refresh token 也过期了，清除所有 token
      this.clear()
      return null
    }

    if (!refreshToken) {
      return null
    }

    try {
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || '',
        client_secret: process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })

      const response = await fetch(process.env.NEXT_PUBLIC_OPENID_URL + '/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = (await response.json()) as {
        access_token: string
        token_type: string
        expires_in: number
        refresh_token?: string
      }

      if (data.access_token) {
        const token = `${data.token_type} ${data.access_token}`
        this.setAccessToken(token, data.expires_in)

        if (data.refresh_token) {
          this.setRefreshToken(data.refresh_token)
        }

        return token
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clear()
    }

    return null
  }

  /**
   * 设置 access token
   */
  setAccessToken(token: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000
    localStorage.setItem(TokenManager.ACCESS_TOKEN_KEY, token)
    localStorage.setItem(TokenManager.TOKEN_EXPIRES_AT_KEY, String(expiresAt))
  }

  /**
   * 设置 refresh token
   */
  setRefreshToken(token: string, expiresIn: number = 2592000): void {
    // 默认 30 天
    const expiresAt = Date.now() + expiresIn * 1000
    localStorage.setItem(TokenManager.REFRESH_TOKEN_KEY, token)
    localStorage.setItem(TokenManager.REFRESH_TOKEN_EXPIRES_AT, String(expiresAt))
  }

  /**
   * 清除所有 token
   */
  clear(): void {
    localStorage.removeItem(TokenManager.ACCESS_TOKEN_KEY)
    localStorage.removeItem(TokenManager.REFRESH_TOKEN_KEY)
    localStorage.removeItem(TokenManager.TOKEN_EXPIRES_AT_KEY)
    localStorage.removeItem(TokenManager.REFRESH_TOKEN_EXPIRES_AT)
  }

  /**
   * 检查是否有有效的 token
   */
  hasValidToken(): boolean {
    const token = localStorage.getItem(TokenManager.ACCESS_TOKEN_KEY)
    const expiresAt = localStorage.getItem(TokenManager.TOKEN_EXPIRES_AT_KEY)

    if (!token || !expiresAt) {
      return false
    }

    return Date.now() < Number(expiresAt)
  }
}

// 导出单例实例
export default new TokenManager()
