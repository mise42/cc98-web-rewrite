export type ThemeMode = 'light' | 'dark' | 'system'

export interface LegacyThemePreset {
  id: number
  name: string
  primary: string
  headerImage?: string
}

/**
 * 对齐旧版 CC98 的主题编号与名称。
 * headerImage 使用旧版头图资源路径（public/static/images/header-image）。
 */
export const LegacyThemePresets: LegacyThemePreset[] = [
  { id: 0, name: '系统默认', primary: '#3b82f6' },
  {
    id: 1,
    name: '冬季',
    primary: '#79b8ca',
    headerImage: '/static/images/header-image/winter.jpg',
  },
  {
    id: 2,
    name: '春季（浅）',
    primary: '#b1d396',
    headerImage: '/static/images/header-image/spring.jpg',
  },
  {
    id: 3,
    name: '春季（深）',
    primary: '#95b675',
    headerImage: '/static/images/header-image/spring.jpg',
  },
  {
    id: 4,
    name: '夏季',
    primary: '#5198d8',
    headerImage: '/static/images/header-image/summer.jpg',
  },
  {
    id: 5,
    name: '秋季（橙）',
    primary: '#f4a460',
    headerImage: '/static/images/header-image/autumn.jpg',
  },
  {
    id: 6,
    name: '秋季（红）',
    primary: '#b22222',
    headerImage: '/static/images/header-image/autumn.jpg',
  },
  {
    id: 7,
    name: '双十一交友',
    primary: '#f07d91',
    headerImage: '/static/images/header-image/singleday.jpg',
  },
  {
    id: 8,
    name: '中秋（暗）',
    primary: '#267681',
    headerImage: '/static/images/header-image/mid_autumn.jpg',
  },
  {
    id: 9,
    name: '中秋（亮）',
    primary: '#34969f',
    headerImage: '/static/images/header-image/mid_autumn.jpg',
  },
  {
    id: 10,
    name: '小雪（暗）',
    primary: '#033975',
    headerImage: '/static/images/header-image/light_snow.jpg',
  },
  {
    id: 11,
    name: '小雪（亮）',
    primary: '#7a92c2',
    headerImage: '/static/images/header-image/light_snow.jpg',
  },
  {
    id: 12,
    name: '春节（暗）',
    primary: '#cd0000',
    headerImage: '/static/images/header-image/spring_festival_dark.jpg',
  },
  {
    id: 13,
    name: '春节（亮）',
    primary: '#d60e24',
    headerImage: '/static/images/header-image/spring_festival_light.jpg',
  },
  {
    id: 14,
    name: '仲春',
    primary: '#468d39',
    headerImage: '/static/images/header-image/zhongchun.jpg',
  },
  {
    id: 15,
    name: '端午',
    primary: '#3578bc',
    headerImage: '/static/images/header-image/dragon_boat_festival.jpg',
  },
  {
    id: 16,
    name: '清明',
    primary: '#6a8471',
    headerImage: '/static/images/header-image/qingming.jpg',
  },
  {
    id: 17,
    name: '秋色之空（暗）',
    primary: '#b77341',
    headerImage: '/static/images/header-image/autumn_2022.jpg',
  },
  {
    id: 18,
    name: '秋色之空（亮）',
    primary: '#eb8e55',
    headerImage: '/static/images/header-image/autumn_2022.jpg',
  },
  {
    id: 19,
    name: '冬日暖雪（暗）',
    primary: '#7d5577',
    headerImage: '/static/images/header-image/winter_2022_dark.jpg',
  },
  {
    id: 20,
    name: '冬日暖雪（亮）',
    primary: '#b57fa3',
    headerImage: '/static/images/header-image/winter_2022.jpg',
  },
  {
    id: 21,
    name: '春樱日和（暗）',
    primary: '#839637',
    headerImage: '/static/images/header-image/spring_2023.jpg',
  },
  {
    id: 22,
    name: '春樱日和（亮）',
    primary: '#abc349',
    headerImage: '/static/images/header-image/spring_2023.jpg',
  },
  {
    id: 23,
    name: '重阳（暗）',
    primary: '#7a6d99',
    headerImage: '/static/images/header-image/chongyang.jpg',
  },
  {
    id: 24,
    name: '重阳（亮）',
    primary: '#8b7aa8',
    headerImage: '/static/images/header-image/chongyang.jpg',
  },
  {
    id: 25,
    name: '金舞迎春（暗）',
    primary: '#c53d37',
    headerImage: '/static/images/header-image/spring_festival_2025.jpg',
  },
  {
    id: 26,
    name: '金舞迎春（亮）',
    primary: '#ff6754',
    headerImage: '/static/images/header-image/spring_festival_2025.jpg',
  },
  {
    id: 27,
    name: '新岁花朝（暗）',
    primary: '#b45447',
    headerImage: '/static/images/header-image/new_year_2026_dark.jpg',
  },
  {
    id: 28,
    name: '新岁花朝（亮）',
    primary: '#df6c5d',
    headerImage: '/static/images/header-image/new_year_2026.jpg',
  },
]

export function getLegacyThemePreset(themeId: number): LegacyThemePreset {
  return LegacyThemePresets.find(item => item.id === themeId) ?? LegacyThemePresets[0]
}
