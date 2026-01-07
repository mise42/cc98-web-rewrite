import * as signalR from '@microsoft/signalr'
import { Constants } from '@/config/constants'
import type { IMessageContent } from '@/types/api'

/**
 * SignalR 服务
 */
class SignalRService {
  private connection: signalR.HubConnection | null = null

  /**
   * 连接到 SignalR Hub
   */
  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    const token = await import('@/lib/token-manager').then(m => m.default.getAccessToken())

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(Constants.signalrUrl, {
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
    console.log('SignalR connected')
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
  onUpdateUnreadCount(callback: (count: number) => void): void {
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
