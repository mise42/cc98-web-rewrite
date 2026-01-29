import { test as base, type Page } from '@playwright/test'

/**
 * 设置已登录的测试用户
 */
export async function authenticateUser(page: Page, username: string = 'testuser') {
  const mockUser = {
    id: 1,
    name: username,
    portraitUrl: '',
    signature: '',
    bio: '',
    postCount: 100,
    fanCount: 50,
    prestige: 1000,
    popularity: 500,
    boards: [],
  }

  const authState = {
    state: {
      user: mockUser,
      isAuthenticated: true,
    },
    version: 0,
  }

  await page.goto('/')
  await page.evaluate(
    ({ authState, key }) => {
      localStorage.setItem(key, JSON.stringify(authState))
    },
    { authState, key: 'auth-storage' }
  )
}

/**
 * 扩展的测试 fixture，包含登录辅助函数
 */
export const test = base.extend<{
  auth: (username?: string) => Promise<void>
}>({
  auth: async ({ page }, fn) => {
    const loginHelper = async (username?: string) => {
      await authenticateUser(page, username)
    }
    await fn(loginHelper)
  },
})

export const expect = base.expect
