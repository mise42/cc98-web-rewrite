// 运行时常量配置
// 从环境变量读取

export const Constants = {
  // 应用信息
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  version: process.env.NEXT_PUBLIC_APP_VERSION,

  // API 配置
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  openIdUrl: process.env.NEXT_PUBLIC_OPENID_URL,
  imageUploadUrl: process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL,

  // OAuth 配置
  oauth: {
    clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI,
    tokenEndpoint: `${process.env.NEXT_PUBLIC_OPENID_URL}/connect/token`,
    authorizeEndpoint: `${process.env.NEXT_PUBLIC_OPENID_URL}/connect/authorize`,
    scope: 'cc98-api openid offline_access',
  },

  // SignalR 配置
  signalrUrl: process.env.NEXT_PUBLIC_SIGNALR_URL,
  signalrHubName: 'notification',

  // 本地存储键
  storageKeys: {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    tokenExpiresAt: 'token_expires_at',
    userInfo: 'user_info',
    theme: 'theme',
    editorMode: 'editor_mode',
  },

  // 分页配置
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // 文件上传限制
  upload: {
    maxImageSize: 10 * 1024 * 1024, // 10MB
    maxVideoSize: 100 * 1024 * 1024, // 100MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm'],
  },
} as const

// 类型导出
export type AppConfig = typeof Constants
