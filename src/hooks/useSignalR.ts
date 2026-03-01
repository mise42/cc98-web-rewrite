import { useEffect } from 'react'
import { signalrService } from '../services/signalr'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'

/**
 * SignalR Hook
 * 自动管理 SignalR 连接生命周期
 */
export function useSignalR() {
  const { isAuthenticated } = useAuthStore()
  const { addMessage, setUnreadCount, setUnreadSummary, clearMessages } = useMessageStore()

  useEffect(() => {
    if (!isAuthenticated) {
      clearMessages()
      signalrService.disconnect()
      return
    }

    // 连接 SignalR
    signalrService.connect().catch(error => {
      console.error('Failed to connect to SignalR:', error)
    })

    // 注册消息处理器
    signalrService.onReceiveMessage(message => {
      addMessage(message)
    })

    signalrService.onUpdateUnreadCount(payload => {
      if (typeof payload === 'number') {
        setUnreadCount(payload)
        return
      }

      if (payload && typeof payload === 'object') {
        setUnreadSummary(payload)
      }
    })

    // 清理函数
    return () => {
      signalrService.disconnect()
    }
  }, [isAuthenticated, addMessage, setUnreadCount, setUnreadSummary, clearMessages])

  return {
    isConnected: signalrService.isConnected,
  }
}
