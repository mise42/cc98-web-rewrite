import TokenManager from "@/lib/token-manager";
import { Constants } from "@/config/constants";

// API 客户端错误类
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(`API Error ${String(status)}: ${message}`);
    this.name = "ApiError";
  }

  // 判断是否是认证错误
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  // 判断是否是服务器错误
  isServerError(): boolean {
    return this.status >= 500;
  }

  // 判断是否是客户端错误
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

export function hasStatus(error: unknown): error is { status: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  );
}

// API 客户端类
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 通用请求方法
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit & { retryAuth?: boolean },
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const token = await TokenManager.getAccessToken();

      const response = await fetch(url, {
        ...options,
        headers: Object.assign(
          {},
          { "Content-Type": "application/json", Authorization: token || "" },
          options?.headers,
        ),
      });

      // 处理 401 未授权错误 - 尝试刷新 token（被动刷新策略）
      if (response.status === 401 && options?.retryAuth !== false) {
        try {
          const newToken = await TokenManager.refreshAccessToken();
          if (newToken) {
            // 重试请求，但不再递归
            return this.request<T>(endpoint, { ...options, retryAuth: false as const });
          }
        } catch {
          throw new ApiError(401, "Authentication failed");
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText || response.statusText);
      }

      // 处理空响应体（例如 204 No Content 或某些 200 响应）
      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * GET 请求
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * POST 请求
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT 请求
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  /**
   * PATCH 请求
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * 上传文件
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = await TokenManager.getAccessToken();
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token || "",
        // 不设置 Content-Type，让浏览器自动设置（包含 boundary）
      },
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    // 处理空响应体
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }
}

// 导出单例实例
export const apiClient = new ApiClient(Constants.apiUrl);
