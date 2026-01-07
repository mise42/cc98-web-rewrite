import { apiClient } from './client'
import type { IUser, IBasicUser } from '@/types/api'

/**
 * 用户相关接口
 */
export const userService = {
  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<IUser> {
    return apiClient.get<IUser>('/user/me')
  },

  /**
   * 获取指定用户信息
   */
  async getUser(userId: number): Promise<IUser> {
    return apiClient.get<IUser>(`/user/${userId}`)
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
    return apiClient.put<IUser>('/user/me', data)
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
    return apiClient.put('/user/me', { signatureCode })
  },

  /**
   * 关注用户
   */
  async followUser(userId: number): Promise<void> {
    return apiClient.post(`/user/${userId}/follow`)
  },

  /**
   * 取消关注
   */
  async unfollowUser(userId: number): Promise<void> {
    return apiClient.post(`/user/${userId}/unfollow`)
  },

  /**
   * 获取用户关注的用户列表
   */
  async getFollowing(userId: number): Promise<IBasicUser[]> {
    return apiClient.get<IBasicUser[]>(`/user/${userId}/following`)
  },

  /**
   * 获取用户的粉丝列表
   */
  async getFans(userId: number): Promise<IBasicUser[]> {
    return apiClient.get<IBasicUser[]>(`/user/${userId}/fans`)
  },
}
