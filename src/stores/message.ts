import { create } from 'zustand'
import type { IMessageContent } from '@/types/api'

/**
 * 消息状态
 */
interface MessageState {
  unreadCount: number
  messages: IMessageContent[]

  setUnreadCount: (count: number) => void
  addMessage: (message: IMessageContent) => void
  markAsRead: (messageId: number) => void
  clearMessages: () => void
}

/**
 * 消息 Store
 */
export const useMessageStore = create<MessageState>(set => ({
  unreadCount: 0,
  messages: [],

  setUnreadCount: count => set({ unreadCount: count }),

  addMessage: message =>
    set(state => ({
      messages: [message, ...state.messages],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: messageId =>
    set(state => ({
      messages: state.messages.map(m => (m.id === messageId ? { ...m, isRead: true } : m)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  clearMessages: () => set({ messages: [], unreadCount: 0 }),
}))
