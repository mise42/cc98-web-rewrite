// 首页数据类型定义

export interface IIndex {
  announcement: string
  hotTopic: IHotTopic[]
  recommendationReading: IMainpageEditableContent[]
  recommendationFunction: IMainpageEditableContent[]
  schoolNews: IMainpageEditableContent[]
  schoolEvent: IMainpageAutoContent[]
  academics: IMainpageAutoContent[]
  study: IMainpageAutoContent[]
  emotion: IMainpageAutoContent[]
  fleaMarket: IMainpageAutoContent[]
  partTimeJob: IMainpageAutoContent[]
  fullTimeJob: IMainpageAutoContent[]
  specialOffer: IMainpageEditableContent[]
  todayCount: number
  topicCount: number
  postCount: number
  userCount: number
  lastUserName: string
  onlineUserCount: number
  lastUpdateTime: string
}

export interface IHotTopic {
  id: number
  title: string
  boardId: number
  boardName: string
  userId: number
  userName: string
  time: string
}

export interface IMainpageEditableContent {
  title: string
  content: string
  /** 兼容旧字段 */
  link?: string
  imageLink?: string
  /** 后端当前字段 */
  url?: string
  imageUrl?: string
}

export interface IMainpageAutoContent {
  id: number
  title: string
}

export interface IAdvertisement {
  id: number
  imageLink: string
  link: string
}
