import { test, expect } from '@playwright/test'
import { authenticateUser } from './test-utils'

test.describe('Topic Content Rendering', () => {
  test('should render UBB and Markdown content correctly', async ({ page }) => {
    await authenticateUser(page)
    await page.route('**/*cc98.top/topic/1', async route => {
      const url = route.request().url()
      if (url.includes('cc98.top')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            title: 'UBB Rendering Test',
            content: 'Test',
            time: '2023-01-01T12:00:00',
            userName: 'TestUser',
            userId: 1,
            state: 0,
            boardId: 1,
            replyCount: 2,
            hitCount: 100,
            floorCount: 2,
            isAnonymous: false,
            isLZ: true,
            bestState: 0,
            topState: 0,
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.route('**/*cc98.top/topic/1/post*', async route => {
      const url = route.request().url()
      if (url.includes('cc98.top')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              content:
                '[b]Bold[/b]\n[i]Italic[/i]\n[u]Underline[/u]\n[del]Delete[/del]\n[url=https://example.com]Link[/url]\n[color=red]Red Color[/color]\n[size=5]Size 5[/size]\n[quote]This is a quote[/quote]\n[code]console.log("Hello World")[/code]\n[align=center]Centered Text[/align]\n[upload=jpg,0]https://via.placeholder.com/150[/upload]\n[bili]BV1xx411c7mD[/bili]\n[table][tr][td]Cell 1[/td][td]Cell 2[/td][/tr][tr][td]Cell 3[/td][td]Cell 4[/td][/tr][/table]\n[ul][li]Item 1[/li][li]Item 2[/li][/ul]\n[ol][li]Item A[/li][li]Item B[/li][/ol]\n[font face=Arial size=5 color=blue]Custom Font[/font]\n[hr]',
              contentType: 0,
              floor: 1,
              time: '2023-01-01T12:00:00',
              userName: 'TestUser',
              userId: 1,
              isLZ: true,
              likeCount: 0,
              dislikeCount: 0,
              isAnonymous: false,
              isDeleted: false,
            },
            {
              id: 2,
              content: '# Markdown Title\n\n*Italic* **Bold**\n\n- List Item 1\n- List Item 2',
              contentType: 1,
              floor: 2,
              time: '2023-01-01T12:05:00',
              userName: 'MarkdownUser',
              userId: 2,
              isLZ: false,
              likeCount: 0,
              dislikeCount: 0,
              isAnonymous: false,
              isDeleted: false,
            },
          ]),
        })
      } else {
        await route.continue()
      }
    })

    await page.route('**/*cc98.top/board/1', async route => {
      const url = route.request().url()
      if (url.includes('cc98.top')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Test Board',
            description: 'Test Board Description',
            parentId: 0,
            topicCount: 100,
            postCount: 1000,
            todayCount: 10,
            boardMasters: ['Master'],
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/topic/1')

    await page.waitForSelector('.prose')

    const ubbPost = page.locator('.shadow-md', { hasText: '#1楼' })

    await expect(ubbPost.getByText('Bold', { exact: true })).toHaveClass('font-bold')
    await expect(ubbPost.getByText('Italic', { exact: true })).toHaveClass('italic')
    await expect(ubbPost.getByText('Underline', { exact: true })).toHaveClass('underline')
    await expect(ubbPost.getByText('Delete', { exact: true })).toHaveClass('line-through')

    await expect(ubbPost.getByText('Link')).toBeVisible()

    const colorEl = ubbPost.getByText('Red Color')
    await expect(colorEl).toHaveAttribute('style', /color:\s*red/)

    const sizeEl = ubbPost.getByText('Size 5')
    await expect(sizeEl).toHaveAttribute('style', /font-size:\s*24px/)

    await expect(ubbPost.getByText('This is a quote')).toBeVisible()
    await expect(ubbPost.getByText('console.log("Hello World")')).toBeVisible()
    await expect(ubbPost.getByText('Centered Text')).toHaveCSS('text-align', 'center')
    await expect(ubbPost.locator('img[alt="upload image"]').first()).toHaveAttribute(
      'src',
      /via\.placeholder\.com/
    )
    await expect(ubbPost.locator('iframe').first()).toBeVisible()

    await expect(ubbPost.getByText('Cell 1')).toBeVisible()
    await expect(ubbPost.getByText('Cell 2')).toBeVisible()
    await expect(ubbPost.getByText('Item 1')).toBeVisible()
    await expect(ubbPost.getByText('Item A')).toBeVisible()
    await expect(ubbPost.getByText('Custom Font')).toBeVisible()
    await expect(ubbPost.locator('hr').first()).toBeVisible()

    const mdPost = page.locator('.shadow-md', { hasText: '#2楼' })
    await expect(mdPost.getByRole('heading', { name: 'Markdown Title' })).toBeVisible()
    await expect(mdPost.getByText('List Item 1')).toBeVisible()
    await expect(mdPost.getByText('List Item 2')).toBeVisible()
  })
})
