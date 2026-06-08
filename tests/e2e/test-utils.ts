import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * 设置已登录的测试用户
 */
export async function authenticateUser(page: Page, username: string = "testuser") {
  const mockUser = {
    id: 1,
    name: username,
    portraitUrl: "",
    signature: "",
    bio: "",
    displayTitle: "",
    emailAddress: "test@example.com",
    registerTime: "2026-01-01T08:00:00Z",
    postCount: 100,
    fanCount: 50,
    followCount: 20,
    wealth: 999,
    prestige: 1000,
    popularity: 500,
    introduction: "E2E user intro",
    boardMasterTitles: [],
    customBoards: [7, 25],
    boards: [],
  };

  // 兼容 useAuthSync：mock /me 请求，避免假 token 被立即踢下线
  await page.route("**/qsh.api.cc98.top/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockUser),
    });
  });

  await page.route("**/qsh.api.cc98.top/me/unread-count", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        atCount: 0,
        replyCount: 0,
        systemCount: 0,
        messageCount: 0,
      }),
    });
  });

  const authState = {
    state: {
      user: mockUser,
      isAuthenticated: true,
    },
    version: 0,
  };

  await page.addInitScript(
    ({ authState, key }) => {
      localStorage.setItem(key, JSON.stringify(authState));
      localStorage.setItem("access_token", "Bearer e2e-test-token");
      localStorage.setItem("refresh_token", "e2e-test-refresh-token");
      localStorage.setItem("token_expires_at", String(Date.now() + 60 * 60 * 1000));
      localStorage.setItem("refresh_token_expires_at", String(Date.now() + 24 * 60 * 60 * 1000));
    },
    { authState, key: "auth-storage" },
  );
}

/**
 * 扩展的测试 fixture，包含登录辅助函数
 */
export const test = base.extend<{
  auth: (username?: string) => Promise<void>;
}>({
  auth: async ({ page }, fn) => {
    const loginHelper = async (username?: string) => {
      await authenticateUser(page, username);
    };
    await fn(loginHelper);
  },
});

export const expect = base.expect;
