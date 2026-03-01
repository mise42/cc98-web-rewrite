import { create } from 'zustand'
import type { IMessageContent } from '@/types/api'

interface IUnreadSummary {
  atCount: number
  replyCount: number
  systemCount: number
  messageCount: number
}

const emptySummary: IUnreadSummary = {
  atCount: 0,
  replyCount: 0,
  systemCount: 0,
  messageCount: 0,
}

/**
 * 消息状态
 */
interface MessageState {
  unreadCount: number
  unreadSummary: IUnreadSummary
  messages: IMessageContent[]

  setUnreadCount: (count: number) => void
  setUnreadSummary: (summary: Partial<IUnreadSummary>) => void
  addMessage: (message: IMessageContent) => void
  markAsRead: (messageId: number) => void
  clearMessages: () => void
}

/**
 * 消息 Store
 */
export const useMessageStore = create<MessageState>(set => ({
  unreadCount: 0,
  unreadSummary: emptySummary,
  messages: [],

  setUnreadCount: count => set({ unreadCount: Math.max(0, count) }),

  setUnreadSummary: summary =>
    set(state => {
      const nextSummary: IUnreadSummary = {
        atCount: summary.atCount ?? state.unreadSummary.atCount,
        replyCount: summary.replyCount ?? state.unreadSummary.replyCount,
        systemCount: summary.systemCount ?? state.unreadSummary.systemCount,
        messageCount: summary.messageCount ?? state.unreadSummary.messageCount,
      }

      return {
        unreadSummary: nextSummary,
        unreadCount:
          nextSummary.atCount +
          nextSummary.replyCount +
          nextSummary.systemCount +
          nextSummary.messageCount,
      }
    }),

  addMessage: message =>
    set(state => ({
      messages: [message, ...state.messages],
      unreadCount: state.unreadCount + 1,
      unreadSummary: {
        ...state.unreadSummary,
        messageCount: state.unreadSummary.messageCount + 1,
      },
    })),

  markAsRead: messageId =>
    set(state => ({
      messages: state.messages.map(m => (m.id === messageId ? { ...m, isRead: true } : m)),
      unreadCount: Math.max(0, state.unreadCount - 1),
      unreadSummary: {
        ...state.unreadSummary,
        messageCount: Math.max(0, state.unreadSummary.messageCount - 1),
      },
    })),

  clearMessages: () => set({ messages: [], unreadCount: 0, unreadSummary: emptySummary }),
}))
