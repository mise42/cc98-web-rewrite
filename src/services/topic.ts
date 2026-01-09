import { apiClient } from './client'
import type { ITopic, IPost, IRandomRecommendation } from '@/types/api'

/**
 * 帖子相关接口
 */
export const topicService = {
  /**
   * 获取帖子详情
   */
  async getTopic(topicId: number): Promise<ITopic> {
    return apiClient.get<ITopic>(`/topic/${topicId}`)
  },

  /**
   * 获取帖子回复列表
   */
  async getTopicPosts(topicId: number, page: number = 1, pageSize: number = 20): Promise<IPost[]> {
    return apiClient.get<IPost[]>(`/topic/${topicId}/post?page=${page}&pageSize=${pageSize}`)
  },

  /**
   * 创建新帖子
   */
  async createTopic(boardId: number, data: CreateTopicRequest): Promise<ITopic> {
    return apiClient.post<ITopic>(`/board/${boardId}/topic`, data)
  },

  /**
   * 回复帖子
   */
  async replyTopic(topicId: number, content: string, contentType: 0 | 1): Promise<IPost> {
    return apiClient.post<IPost>(`/topic/${topicId}/post`, {
      content,
      contentType,
    })
  },

  /**
   * 点赞帖子
   */
  async likeTopic(topicId: number): Promise<void> {
    return apiClient.post<void>(`/topic/${topicId}/like`)
  },

  /**
   * 取消点赞
   */
  async dislikeTopic(topicId: number): Promise<void> {
    return apiClient.post<void>(`/topic/${topicId}/dislike`)
  },

  /**
   * 获取热门话题
   */
  async getHotTopics(): Promise<ITopic[]> {
    return apiClient.get<ITopic[]>('/topic/hot')
  },

  async getNewTopics(from: number = 0, size: number = 20): Promise<ITopic[]> {
    return apiClient.get<ITopic[]>(`/topic/new?from=${from}&size=${size}`)
  },

  async getRecommendedTopics(size: number = 10): Promise<IRandomRecommendation[]> {
    return apiClient.get<IRandomRecommendation[]>(`/topic/random-recommendation?size=${size}`)
  },
}

/**
 * 创建帖子请求类型
 */
export interface CreateTopicRequest {
  title: string
  content: string
  contentType: 0 | 1 // 0: UBB, 1: Markdown
}
