import { apiClient } from './client'
import type { IMessageContent, IRecentMessage } from '@/types/api'

/**
 * 消息相关接口
 */
export const messageService = {
  /**
   * 获取最近的对话列表
   */
  async getRecentMessages(): Promise<IRecentMessage[]> {
    return apiClient.get<IRecentMessage[]>('/message/recent')
  },

  /**
   * 获取消息内容
   */
  async getMessageContent(userId: number): Promise<IMessageContent> {
    return apiClient.get<IMessageContent>(`/message/${userId}`)
  },

  /**
   * 发送消息
   */
  async sendMessage(userId: number, content: string): Promise<void> {
    return apiClient.post(`/message/${userId}`, { content })
  },

  /**
   * 标记消息为已读
   */
  async markAsRead(userId: number): Promise<void> {
    return apiClient.post(`/message/${userId}/read`)
  },

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(): Promise<number> {
    return apiClient.get<number>('/message/unread')
  },

  /**
   * 获取系统通知
   */
  async getSystemNotifications(page: number = 1): Promise<{
    list: IMessageContent[]
    total: number
  }> {
    return apiClient.get<{
      list: IMessageContent[]
      total: number
    }>(`/message/system?page=${page}`)
  },
}
