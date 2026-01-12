/**
 * 主题内容类型枚举
 */
export enum TopicContentType {
  /** 普通主题帖 */
  Normal = 0,
  /** 投票主题帖 */
  VoteTopic = 1,
  /** 视频主题帖 */
  VideoTopic = 2,
  /** 音频主题帖 */
  AudioTopic = 3,
  /** 图片主题帖 */
  ImageTopic = 4,
}

/**
 * 媒体主题帖里的媒体摘要信息
 */
export interface MediaTopicContent {
  /** 缩略图：用于图片、视频和音频类型的主题帖 */
  thumbnail?: string[]
  /** 时长：用于视频和音频类型的主题帖 */
  duration?: number
  /** 高度：用于视频类型的主题帖 */
  height?: number
  /** 宽度：用于视频类型的主题帖 */
  width?: number
  audio?: string
  video?: string
}

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
  /** 主题内容的类型 */
  contentType?: TopicContentType
  /** 媒体主题的摘要信息 */
  mediaContent?: MediaTopicContent
  /** 主题内容预览（某些API返回） */
  content?: string
}

export interface IRandomRecommendation {
  topic: ITopic
  content: string
}
