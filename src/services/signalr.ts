import * as signalR from '@microsoft/signalr'
import { Constants } from '@/config/constants'
import tokenManager from '@/lib/token-manager'
import type { IMessageContent } from '@/types/api'

/**
 * SignalR 服务
 */
class SignalRService {
  private connection: signalR.HubConnection | null = null
  private hubUrl: string | null = null
  private isDisabled = false
  private isConnecting = false

  private buildCandidateUrls(): string[] {
    const configured = Constants.signalrUrl?.trim()
    const fallback = Constants.apiUrl
      ? `${Constants.apiUrl.replace(/\/$/, '')}/signalr/notification`
      : undefined

    const candidates = [] as string[]

    // 对常见错误配置 /hub 做容错：优先尝试 /signalr/notification
    if (configured?.includes('/hub')) {
      if (fallback) candidates.push(fallback)
      if (configured) candidates.push(configured)
    } else {
      if (configured) candidates.push(configured)
      if (fallback) candidates.push(fallback)
    }

    return [...new Set(candidates)]
  }

  private async resolveHubUrl(token: string | null): Promise<string | null> {
    if (this.hubUrl) {
      return this.hubUrl
    }

    for (const hubUrl of this.buildCandidateUrls()) {
      const negotiateUrl = `${hubUrl.replace(/\/$/, '')}/negotiate?negotiateVersion=1`

      try {
        const probe = await fetch(negotiateUrl, {
          method: 'POST',
          headers: {
            Authorization: token || '',
          },
        })

        // 404 说明该路径不存在，继续尝试下一个候选
        if (probe.status === 404) {
          continue
        }

        this.hubUrl = hubUrl
        return hubUrl
      } catch {
        // 忽略当前候选，继续尝试
      }
    }

    return null
  }

  /**
   * 连接到 SignalR Hub
   */
  async connect(): Promise<void> {
    if (this.isDisabled || this.isConnecting) {
      return
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    this.isConnecting = true

    try {
      const token = await tokenManager.getAccessToken()
      const hubUrl = await this.resolveHubUrl(token)

      if (!hubUrl) {
        console.warn('SignalR endpoint is unavailable, will retry on next connect attempt')
        return
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token || '',
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            // 指数退避重连策略
            return Math.min(retryContext.previousRetryCount * 1000, 10000)
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      await this.connection.start()
    } finally {
      this.isConnecting = false
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.connection?.stop()
    this.connection = null
  }

  /**
   * 调用 SignalR 方法
   */
  async invoke(methodName: string, ...args: unknown[]): Promise<void> {
    if (!this.connection) {
      throw new Error('SignalR not connected')
    }
    return this.connection.invoke(methodName, ...args)
  }

  /**
   * 检查是否已连接
   */
  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  /**
   * 注册消息处理器
   */
  onReceiveMessage(callback: (message: IMessageContent) => void): void {
    if (!this.connection) {
      console.warn('SignalR not connected, cannot register handler')
      return
    }
    this.connection.on('ReceiveMessage', callback)
  }

  /**
   * 注册未读数更新处理器
   */
  onUpdateUnreadCount(
    callback: (
      payload:
        | number
        | {
            atCount?: number
            replyCount?: number
            systemCount?: number
            messageCount?: number
          }
    ) => void
  ): void {
    if (!this.connection) {
      console.warn('SignalR not connected, cannot register handler')
      return
    }
    this.connection.on('UpdateUnreadCount', callback)
  }

  /**
   * 注册用户状态更新处理器
   */
  onUserStatus(callback: (data: { userId: number; online: boolean }) => void): void {
    if (!this.connection) {
      console.warn('SignalR not connected, cannot register handler')
      return
    }
    this.connection.on('UserStatus', callback)
  }
}

// 导出单例实例
export const signalrService = new SignalRService()
