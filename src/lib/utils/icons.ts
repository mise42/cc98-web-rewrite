import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Star,
  Search,
  Calendar,
  HelpCircle,
  Megaphone,
  Newspaper,
  Trophy,
  Tag,
  TrendingUp,
  MessageCircle,
  Home,
  Grid3x3,
  Clock,
  Award,
  Heart,
  BookOpen,
  Zap,
  Sparkles,
  Flame,
  Dices,
  BadgeCheck,
  CreditCard,
  Gamepad2,
} from 'lucide-react'

/**
 * 根据功能标题匹配合适的图标
 * @param title - 功能标题
 * @returns 对应的图标组件
 */
export function getIconForFunction(title: string): LucideIcon {
  const t = title.toLowerCase()

  // 抽卡游戏/卡牌游戏
  if (
    t.includes('抽卡') ||
    t.includes('卡牌') ||
    t.includes('卡片') ||
    t.includes('card') ||
    t.includes('gacha')
  ) {
    return CreditCard
  }

  // 认证用户/VIP/大V
  if (
    t.includes('认证') ||
    t.includes('vip') ||
    t.includes('大v') ||
    t.includes('verified') ||
    t.includes('认证用户')
  ) {
    return BadgeCheck
  }

  // 竞猜中心/博彩/下注
  if (
    t.includes('竞猜') ||
    t.includes('博彩') ||
    t.includes('下注') ||
    t.includes('betting') ||
    t.includes('gambling') ||
    t.includes('赌')
  ) {
    return Dices
  }

  // 游戏/娱乐
  if (t.includes('游戏') || t.includes('娱乐') || t.includes('game') || t.includes('play')) {
    return Gamepad2
  }

  // 新帖/最新
  if (t.includes('新') || t.includes('new') || t.includes('latest') || t.includes('最新')) {
    return Sparkles
  }

  // 热门/热门话题
  if (t.includes('热门') || t.includes('hot') || t.includes('热') || t.includes('流行')) {
    return Flame
  }

  // 精华/精选
  if (t.includes('精华') || t.includes('精选') || t.includes('best') || t.includes('star')) {
    return Star
  }

  // 问答/提问
  if (
    t.includes('问答') ||
    t.includes('提问') ||
    t.includes('question') ||
    t.includes('help') ||
    t.includes('疑问')
  ) {
    return HelpCircle
  }

  // 活动/赛事
  if (t.includes('活动') || t.includes('赛事') || t.includes('event') || t.includes('calendar')) {
    return Calendar
  }

  // 公告/通知
  if (
    t.includes('公告') ||
    t.includes('通知') ||
    t.includes('announcement') ||
    t.includes('notice')
  ) {
    return Megaphone
  }

  // 新闻/资讯
  if (t.includes('新闻') || t.includes('资讯') || t.includes('news')) {
    return Newspaper
  }

  // 排行榜/榜单
  if (t.includes('排行') || t.includes('榜单') || t.includes('rank') || t.includes('top')) {
    return Trophy
  }

  // 标签/分类
  if (t.includes('标签') || t.includes('分类') || t.includes('tag') || t.includes('category')) {
    return Tag
  }

  // 趋势/关注
  if (t.includes('趋势') || t.includes('关注') || t.includes('trending') || t.includes('follow')) {
    return TrendingUp
  }

  // 搜索/查找
  if (t.includes('搜索') || t.includes('查找') || t.includes('search') || t.includes('find')) {
    return Search
  }

  // 消息/评论
  if (t.includes('消息') || t.includes('评论') || t.includes('message') || t.includes('comment')) {
    return MessageCircle
  }

  // 首页/主页
  if (t.includes('首页') || t.includes('主页') || t.includes('home') || t.includes('index')) {
    return Home
  }

  // 版块/广场
  if (t.includes('版块') || t.includes('广场') || t.includes('board') || t.includes('forum')) {
    return Grid3x3
  }

  // 最近/时间
  if (t.includes('最近') || t.includes('时间') || t.includes('recent') || t.includes('time')) {
    return Clock
  }

  // 奖励/荣誉
  if (t.includes('奖励') || t.includes('荣誉') || t.includes('award') || t.includes('honor')) {
    return Award
  }

  // 收藏/喜欢
  if (t.includes('收藏') || t.includes('喜欢') || t.includes('favorite') || t.includes('like')) {
    return Heart
  }

  // 攻略/指南/教程/文档
  if (
    t.includes('攻略') ||
    t.includes('指南') ||
    t.includes('guide') ||
    t.includes('文档') ||
    t.includes('教程') ||
    t.includes('学习') ||
    t.includes('tutorial')
  ) {
    return BookOpen
  }

  // 快速/闪电
  if (t.includes('快速') || t.includes('速') || t.includes('quick') || t.includes('fast')) {
    return Zap
  }

  // 默认返回文档图标
  return FileText
}
