import { apiClient } from './client'
import type { IUser, ISignIn } from '@/types/api'

/**
 * 用户相关接口
 */
export const userService = {
  /**
   * 获取当前用户信息
   * 注意：使用 /me 端点获取当前登录用户
   */
  async getCurrentUser(): Promise<IUser> {
    return apiClient.get<IUser>('/me')
  },

  /**
   * 获取指定用户信息
   */
  async getUser(userId: number): Promise<IUser> {
    return apiClient.get<IUser>(`/user/${userId}`)
  },

  /**
   * 通过用户名获取用户信息
   */
  async getUserByName(userName: string): Promise<IUser> {
    return apiClient.get<IUser>(`/user/name/${encodeURIComponent(userName)}`)
  },

  /**
   * 获取多个用户信息（批量查询）
   */
  async getUsers(userIds: number[]): Promise<(IUser | null)[]> {
    const promises = userIds.map(id => apiClient.get<IUser>(`/user/${id}`).catch(() => null))
    return Promise.all(promises)
  },

  /**
   * 更新用户信息
   */
  async updateUserInfo(data: Partial<IUser>): Promise<IUser> {
    return apiClient.put<IUser>('/me', data)
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<{ portraitUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.upload<{ portraitUrl: string }>('/user/avatar', formData)
  },

  /**
   * 更新签名档
   */
  async updateSignature(signatureCode: string): Promise<void> {
    return apiClient.put('/me', { signatureCode })
  },

  /**
   * 更新用户主题（兼容旧版主题编号）
   */
  async updateTheme(themeId: number): Promise<void> {
    return apiClient.put<void>(`/me/theme?id=${themeId}`)
  },

  /**
   * 关注用户
   */
  async followUser(userId: number): Promise<void> {
    return apiClient.put<void>(`/me/followee/${userId}`)
  },

  /**
   * 取消关注
   */
  async unfollowUser(userId: number): Promise<void> {
    return apiClient.delete<void>(`/me/followee/${userId}`)
  },

  /**
   * 获取当前用户最近发表的主题
   */
  async getRecentTopics(from: number = 0, size: number = 10): Promise<any[]> {
    return apiClient.get<any[]>(`/me/recent-topic?from=${from}&size=${size}`)
  },

  /**
   * 获取当前用户最近的回复
   */
  async getRecentPosts(
    from: number = 0,
    size: number = 10
  ): Promise<{ data: any[]; count: number }> {
    return apiClient.get<{ data: any[]; count: number }>(
      `/me/recent-post?from=${from}&size=${size}`
    )
  },

  /**
   * 获取当前用户的热门回复
   */
  async getHotPosts(from: number = 0, size: number = 10): Promise<{ data: any[]; count: number }> {
    return apiClient.get<{ data: any[]; count: number }>(`/me/hot-post?from=${from}&size=${size}`)
  },

  /**
   * 获取指定用户最近发表的主题
   */
  async getUserRecentTopics(userId: number, from: number = 0, size: number = 10): Promise<any[]> {
    return apiClient.get<any[]>(`/user/${userId}/recent-topic?from=${from}&size=${size}`)
  },

  /**
   * 获取签到状态
   */
  async getSignInStatus(): Promise<ISignIn> {
    return apiClient.get<ISignIn>('/me/signin')
  },

  /**
   * 执行签到，返回本次获得的财富值
   */
  async signIn(): Promise<number> {
    return apiClient.post<number>('/me/signin', {})
  },
}
