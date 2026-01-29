import { test, expect } from '@playwright/test'
import { authenticateUser } from './test-utils'

test.describe('Basic Page Tests', () => {
  test('should navigate to homepage', async ({ page }) => {
    await page.goto('/')

    // Just check that something loads
    await expect(page).toHaveTitle(/.+/)
  })

  test('should mock API successfully', async ({ page }) => {
    // Login first
    await authenticateUser(page)

    // Setup mock
    await page.route('**/*cc98.top/topic/6399262', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 6399262,
          title: 'Mocked Topic',
          content: 'Test',
          time: '2025-01-10T10:00:00',
          userName: 'TestUser',
          userId: 1,
          state: 0,
          boardId: 7,
          replyCount: 5,
          hitCount: 100,
          floorCount: 5,
          isAnonymous: false,
          isLZ: false,
          bestState: 0,
          topState: 0,
        }),
      })
    })

    await page.route('**/*cc98.top/board/7', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 7,
          name: 'Test Board',
          description: 'Test',
          parentId: 0,
          topicCount: 100,
          postCount: 1000,
          todayCount: 10,
          boardMasters: [],
        }),
      })
    })

    await page.route('**/*cc98.top/topic/6399262/post*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            content: 'Test post',
            contentType: 0,
            floor: 1,
            time: '2025-01-10T10:05:00',
            userName: 'TestUser',
            userId: 1,
            isLZ: false,
            likeCount: 0,
            dislikeCount: 0,
            isAnonymous: false,
            isDeleted: false,
            topicId: 6399262,
            boardId: 7,
          },
        ]),
      })
    })

    // Navigate to topic page
    await page.goto('/topic/6399262', { timeout: 10000 })

    // Wait a bit for page to load
    await page.waitForTimeout(2000)

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-debug.png' })

    // Check URL
    await expect(page).toHaveURL('/topic/6399262')

    // Try to find any text
    const bodyText = await page.textContent('body')
    console.log('Page body text:', bodyText?.substring(0, 200))
  })
})
