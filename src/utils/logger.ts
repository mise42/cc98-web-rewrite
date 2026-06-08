import log from "loglevel";

// 类型定义
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "silent";

// 根据环境设置默认日志级别
const getDefaultLevel = (): LogLevel => {
  const mode = import.meta.env.MODE;
  return mode === "production" ? "warn" : "debug";
};

log.setDefaultLevel(getDefaultLevel());

// ��持环境变量覆盖
const envLevel = import.meta.env.VITE_LOG_LEVEL as LogLevel;
if (envLevel && ["trace", "debug", "info", "warn", "error", "silent"].includes(envLevel)) {
  log.setLevel(envLevel);
}

// 导出logger和便捷方法
export const logger = log;
export const logTrace = (msg: string, ...data: unknown[]) => logger.trace(msg, ...data);
export const logDebug = (msg: string, ...data: unknown[]) => logger.debug(msg, ...data);
export const logInfo = (msg: string, ...data: unknown[]) => logger.info(msg, ...data);
export const logWarn = (msg: string, ...data: unknown[]) => logger.warn(msg, ...data);
export const logError = (msg: string, ...data: unknown[]) => logger.error(msg, ...data);

// 环境判断工具
export const isDevelopment = import.meta.env.MODE === "development";
export const isProduction = import.meta.env.MODE === "production";
