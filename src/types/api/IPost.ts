import type { IAward } from './IAward'
import type { ILikeState } from './ILike'

export interface IPost {
  allowedViewers: unknown
  awardInfo: unknown
  awards: IAward[]
  content: string
  contentType: 0 | 1
  floor: number
  id: number
  ip: string
  isAllowedOnly: boolean
  isAnonymous: boolean
  isBest: boolean
  isDeleted: boolean
  isLZ: boolean
  lastUpdateAuthor: unknown
  lastUpdateTime: unknown
  likeCount: number
  dislikeCount: number
  likeState: ILikeState
  length: number
  parentId: number
  state: number
  time: string
  title: string
  topicId: number
  boardId: number
  userId: number
  userName: string
}
