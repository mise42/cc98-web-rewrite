export interface ITopic {
  id: number
  boardId: number
  boardName?: string
  title: string
  time: string
  userId: number
  userName: string
  isAnonymous: boolean
  disableHot: boolean
  lastPostTime: string
  state: number
  type: number
  replyCount: number
  hitCount: number
  totalVoteUserCount: number
  lastPostUser: string
  lastPostContent: string
  topState: number
  bestState: number
  isVote: boolean
  isPosterOnly: boolean
  allowedViewerState: number
  likeCount: number
  dislikeCount: number
  highlightInfo: unknown
  tag1: number
  tag2: number
  isInternalOnly: boolean
}

export interface IRandomRecommendation {
  topic: ITopic
  content: string
}
