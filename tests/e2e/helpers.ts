import { test, expect } from '@playwright/test'

/**
 * Mock topic API response
 */
export const mockTopicResponse = (overrides = {}) => ({
  id: 6399262,
  title: '测试主题',
  content: '这是一个测试主题',
  time: '2025-01-10T10:00:00',
  userName: '楼主',
  userId: 1,
  state: 0,
  boardId: 7,
  replyCount: 25,
  hitCount: 1000,
  floorCount: 25,
  isAnonymous: false,
  isLZ: false,
  bestState: 0,
  topState: 0,
  ...overrides,
})

/**
 * Mock board API response
 */
export const mockBoardResponse = (overrides = {}) => ({
  id: 7,
  name: '技术交流',
  description: '技术交流板块',
  parentId: 0,
  topicCount: 1000,
  postCount: 10000,
  todayCount: 50,
  boardMasters: ['admin'],
  ...overrides,
})

/**
 * Mock post API response
 */
export const mockPostResponse = (overrides = {}) => ({
  id: 1,
  content: '测试回复内容',
  contentType: 0,
  floor: 1,
  time: '2025-01-10T10:05:00',
  userName: '测试用户',
  userId: 100,
  isLZ: false,
  likeCount: 5,
  dislikeCount: 1,
  isAnonymous: false,
  isDeleted: false,
  topicId: 6399262,
  boardId: 7,
  ...overrides,
})

/**
 * Setup common API mocks for topic detail page
 */
export async function setupTopicPageMocks(
  page: any,
  options: {
    topic?: any
    board?: any
    posts?: any[]
  } = {}
) {
  const {
    topic = mockTopicResponse(),
    board = mockBoardResponse(),
    posts = [mockPostResponse()],
  } = options

  // Mock topic API
  await page.route(`**/topic/${topic.id}`, async route => {
    const url = route.request().url()
    if (url.includes('api.cc98.top')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(topic),
      })
    } else {
      await route.continue()
    }
  })

  // Mock board API
  await page.route(`**/board/${board.id}`, async route => {
    const url = route.request().url()
    if (url.includes('api.cc98.top')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(board),
      })
    } else {
      await route.continue()
    }
  })

  // Mock posts API
  await page.route(`**/topic/${topic.id}/post*`, async route => {
    const url = route.request().url()
    if (url.includes('api.cc98.top')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(posts),
      })
    } else {
      await route.continue()
    }
  })

  return { topic, board, posts }
}

/**
 * Setup like/dislike API mock
 */
export async function setupLikeMocks(
  page: any,
  options: {
    likeState?: 0 | 1 | 2
    likeCount?: number
    dislikeCount?: number
  } = {}
) {
  const { likeState = 0, likeCount = 5, dislikeCount = 1 } = options

  await page.route('**/post/*/like', async route => {
    const url = route.request().url()
    if (url.includes('api.cc98.top')) {
      const method = route.request().method()
      if (method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            likeCount: likeCount + 1,
            dislikeCount,
            likeState: 1,
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ likeCount, dislikeCount, likeState }),
        })
      }
    } else {
      await route.continue()
    }
  })
}

/**
 * Wait for posts to load on the page
 */
export async function waitForPosts(page: any) {
  await page.waitForSelector('.shadow-md.bg-card\\/50')
}

/**
 * Get post card element by floor number
 */
export function getPostByFloor(page: any, floor: number) {
  return page.locator('.shadow-md').filter({ hasText: `#${floor}楼` })
}

/**
 * Get like button for a specific floor
 */
export function getLikeButton(page: any, floor: number) {
  const post = getPostByFloor(page, floor)
  return post.getByRole('button').filter({ hasText: /^\d+$/ }).first()
}

/**
 * Get dislike button for a specific floor
 */
export function getDislikeButton(page: any, floor: number) {
  const post = getPostByFloor(page, floor)
  return post.locator('button').filter({ hasText: /^\d+$/ }).nth(1)
}

/**
 * Get trace button for a specific floor
 */
export function getTraceButton(page: any, floor: number) {
  const post = getPostByFloor(page, floor)
  return post.getByRole('button', { name: '追踪' })
}

/**
 * Get quote button for a specific floor
 */
export function getQuoteButton(page: any, floor: number) {
  const post = getPostByFloor(page, floor)
  return post.getByRole('button', { name: /引用/ })
}
