import { apiClient } from './client'
import type { IBoard } from '@/types/api'

/**
 * 版块相关接口
 */
export const boardService = {
  /**
   * 获取版块详情
   */
  async getBoard(boardId: string): Promise<IBoard> {
    return apiClient.get<IBoard>(`/board/${boardId}`)
  },

  /**
   * 获取所有版块列表
   */
  async getAllBoards(): Promise<IBoard[]> {
    return apiClient.get<IBoard[]>('/board')
  },

  /**
   * 获取版块帖子列表
   */
  async getBoardTopics(
    boardId: string,
    page: number = 1,
    pageSize: number = 20,
    type?: number
  ): Promise<{ list: IBoard[]; total: number }> {
    let url = `/board/${boardId}/topic?page=${page}&pageSize=${pageSize}`
    if (type !== undefined) {
      url += `&type=${type}`
    }
    return apiClient.get<{ list: IBoard[]; total: number }>(url)
  },

  /**
   * 获取版块精华帖子
   */
  async getEssenceTopics(boardId: string, page: number = 1): Promise<IPost[]> {
    return apiClient.get<IPost[]>(`/board/${boardId}/essence?page=${page}`)
  },
}
