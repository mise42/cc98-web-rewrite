// 运行时常量配置
// 从环境变量读取

export const Constants = {
  // 应用信息
  appName: import.meta.env.VITE_APP_NAME,
  version: import.meta.env.VITE_APP_VERSION,

  // API 配置
  apiUrl: import.meta.env.VITE_API_URL,
  openIdUrl: import.meta.env.VITE_OPENID_URL,
  imageUploadUrl: import.meta.env.VITE_IMAGE_UPLOAD_URL,

  // OAuth 配置
  oauth: {
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
    clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    tokenEndpoint: `${import.meta.env.VITE_OPENID_URL}/connect/token`,
    authorizeEndpoint: `${import.meta.env.VITE_OPENID_URL}/connect/authorize`,
    scope: 'cc98Api offline_access',
  },

  // SignalR 配置
  signalrUrl: import.meta.env.VITE_SIGNALR_URL,

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
