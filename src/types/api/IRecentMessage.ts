export interface IRecentMessage {
  /**
   * 联系人 ID
   */
  userId: number;
  /**
   * 最后一条消息发送者 ID
   */
  senderId?: number;
  /**
   * 发信时间
   */
  time: string;
  /**
   * 是否已读
   */
  isRead: boolean;
  /**
   * 最后一条消息
   */
  lastContent: string;
}
