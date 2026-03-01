import { apiClient } from './client'
import type { IMessageContent, IRecentMessage } from '@/types/api'

export interface IUnreadMessageCount {
  atCount: number
  replyCount: number
  systemCount: number
  messageCount: number
}

export interface INotification {
  id: number
  type: number
  isRead: boolean
  time: string
  topicId: number | null
  postId: number | null
  title?: string
  content?: string
  postBasicInfo: {
    id: number
    boardId: number
    floor: number
    userId: number
    userName: string
    isDeleted: boolean
  } | null
}

/**
 * 消息相关接口
 */
export const messageService = {
  /**
   * 获取最近联系人
   */
  async getRecentMessages(from: number = 0, size: number = 20): Promise<IRecentMessage[]> {
    return apiClient.get<IRecentMessage[]>(`/message/recent-contact-users?from=${from}&size=${size}`)
  },

  /**
   * 获取与指定用户的私信
   */
  async getMessageContent(
    userId: number,
    from: number = 0,
    size: number = 20
  ): Promise<IMessageContent[]> {
    return apiClient.get<IMessageContent[]>(`/message/user/${userId}?from=${from}&size=${size}`)
  },

  /**
   * 发送私信
   */
  async sendMessage(toUserName: string, content: string): Promise<void> {
    return apiClient.post('/message', { toUserName, content })
  },

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(): Promise<IUnreadMessageCount> {
    return apiClient.get<IUnreadMessageCount>('/me/unread-count')
  },

  /**
   * 获取消息总数（包含已读）
   */
  async getAllMessageCount(): Promise<IUnreadMessageCount> {
    return apiClient.get<IUnreadMessageCount>('/me/all-message-count')
  },

  /**
   * 获取回复通知
   */
  async getReplyNotifications(from: number = 0, size: number = 20): Promise<INotification[]> {
    return apiClient.get<INotification[]>(`/notification/reply?from=${from}&size=${size}`)
  },

  /**
   * 获取 @ 通知
   */
  async getAtNotifications(from: number = 0, size: number = 20): Promise<INotification[]> {
    return apiClient.get<INotification[]>(`/notification/at?from=${from}&size=${size}`)
  },

  /**
   * 获取系统通知
   */
  async getSystemNotifications(from: number = 0, size: number = 20): Promise<INotification[]> {
    return apiClient.get<INotification[]>(`/notification/system?from=${from}&size=${size}`)
  },

  /**
   * 全部标记为已读
   */
  async markAllReplyAsRead(): Promise<void> {
    return apiClient.put('/notification/read-all-reply')
  },

  async markAllAtAsRead(): Promise<void> {
    return apiClient.put('/notification/read-all-at')
  },

  async markAllSystemAsRead(): Promise<void> {
    return apiClient.put('/notification/read-all-system')
  },
}
