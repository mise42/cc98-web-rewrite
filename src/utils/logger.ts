import log from 'loglevel'

// 类型定义
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'

// 根据环境设置默认日志级别
const getDefaultLevel = (): LogLevel => {
  const mode = process.env.NODE_ENV
  return mode === 'production' ? 'warn' : 'debug'
}

log.setDefaultLevel(getDefaultLevel())

// 支持环境变量覆盖
const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel
if (envLevel && ['trace', 'debug', 'info', 'warn', 'error', 'silent'].includes(envLevel)) {
  log.setLevel(envLevel)
}

// 环境判断工具
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
