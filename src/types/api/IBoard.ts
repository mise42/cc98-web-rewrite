export interface IBoard {
  id: number
  name: string
  description: string
  topicCount: number
  postCount: number
  todayCount: number
  boardMasters: string[]
  isUserCustomBoard?: boolean
  internalState: number
  isLock: boolean
  parentId: number
  anonymousState: number
  canEntry: boolean
  canVote: boolean
  bigPaper: string
}

/**
 * 子版面信息（/board/all 返回的嵌套结构中的子版面）
 */
export interface IChildBoard {
  id: number
  name: string
  masters: string[]
  todayCount: number
  topicCount: number
  postCount: number
}

/**
 * 根版面/区（/board/all 返回的嵌套结构）
 */
export interface IRootBoard {
  id: number
  name: string
  masters: string[]
  boards: IChildBoard[]
}
