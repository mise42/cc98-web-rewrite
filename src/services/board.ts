import { apiClient } from './client'
import type { IBoard, IChildBoard, IPost, IRootBoard, ITopic } from '@/types/api'

export const boardService = {
  async getBoard(boardId: string): Promise<IBoard> {
    return apiClient.get<IBoard>(`/board/${boardId}`)
  },

  async getAllBoards(): Promise<IRootBoard[]> {
    return apiClient.get<IRootBoard[]>('/board/all')
  },

  async getChildBoard(boardId: number): Promise<IChildBoard | undefined> {
    const rootBoards = await this.getAllBoards()
    for (const root of rootBoards) {
      const child = root.boards.find(b => b.id === boardId)
      if (child) return child
    }
    return undefined
  },

  /**
   * 获取版块帖子列表
   */
  async getBoardTopics(
    boardId: string,
    page: number = 1,
    pageSize: number = 20,
    type?: number
  ): Promise<ITopic[]> {
    const from = (page - 1) * pageSize
    let url = `/board/${boardId}/topic?from=${from}&size=${pageSize}`
    if (type !== undefined) {
      url += `&type=${type}`
    }
    return apiClient.get<ITopic[]>(url)
  },

  /**
   * 获取版块精华帖子
   */
  async getEssenceTopics(boardId: string, page: number = 1): Promise<IPost[]> {
    return apiClient.get<IPost[]>(`/board/${boardId}/essence?page=${page}`)
  },
}
