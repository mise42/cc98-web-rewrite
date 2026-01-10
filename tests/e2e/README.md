# E2E Testing Documentation

## 概述

本项目使用 Playwright 进行端到端测试。测试覆盖了帖子详情页的核心功能，包括内容渲染、用户交互、视图模式切换等。

## 运行测试

### 运行所有 E2E 测试

```bash
bun run test:e2e
```

### 运行特定测试文件

```bash
bun run playwright test topic-detail.spec.ts
```

### 调试模式（打开浏览器）

```bash
bun run playwright test --debug
```

### 显示测试报告

```bash
bun run playwright show-report
```

### 交互式模式（UI 模式）

```bash
bun run playwright test --ui
```

## 测试覆盖的功能

### 1. 帖子详情页基础功能 (`topic-detail.spec.ts`)

#### ✅ 已实现的测试

- **帖子加载**
  - 加载主题内容和回复列表
  - 显示主题元数据（标题、作者、回复数等）
  - 显示版面链接和返回按钮

- **楼层显示**
  - 正确显示从 API 返回的楼层号（非连续）
  - 验证楼层号不使用索引 +1

- **视图模式切换**
  - 分页模式
  - 无限滚动模式
  - 模式切换交互

- **用户追踪功能**
  - 进入追踪模式
  - 显示追踪提示横幅
  - 退出追踪模式
  - 追踪模式下隐藏分页控件
  - 匿名用户不显示追踪按钮

- **点赞/点踩功能**
  - 显示点赞和点踩按钮
  - 显示点赞/点踩数量
  - 处理点赞点击
  - 处理点踩点击
  - 防止重复点击（禁用状态）

- **引用功能**
  - 显示引用按钮
  - 处理引用点击（基础功能）

- **空状态处理**
  - 追踪模式下无回复时显示提示

- **加载状态**
  - 显示骨架屏

- **错误处理**
  - API 错误处理

## 测试辅助工具

### `tests/e2e/helpers.ts`

提供常用的测试辅助函数：

```typescript
import {
  setupTopicPageMocks,
  setupLikeMocks,
  waitForPosts,
  getPostByFloor,
  getLikeButton,
  getDislikeButton,
  getTraceButton,
  getQuoteButton,
  mockTopicResponse,
  mockPostResponse,
} from './helpers'

// 使用示例
test('my test', async ({ page }) => {
  // 设置 Mock
  await setupTopicPageMocks(page, {
    topic: mockTopicResponse({ title: '自定义标题' }),
    posts: [mockPostResponse({ floor: 5 })]
  })

  // 访问页面
  await page.goto('/topic/6399262')

  // 等待加载
  await waitForPosts(page)

  // 获取元素
  const post = getPostByFloor(page, 5)
  const likeBtn = getLikeButton(page, 5)

  // 断言
  await expect(post).toBeVisible()
})
```

## 编写新测试

### 基本测试模板

```typescript
import { test, expect } from '@playwright/test'
import { setupTopicPageMocks, mockTopicResponse, mockPostResponse, waitForPosts } from '../helpers'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // 1. Setup mocks
    await setupTopicPageMocks(page)

    // 2. Navigate to page
    await page.goto('/topic/6399262')

    // 3. Wait for content
    await waitForPosts(page)

    // 4. Interact with page
    await page.getByRole('button', { name: 'Click Me' }).click()

    // 5. Assertions
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

### 测试最佳实践

1. **使用 Mock 数据**
   - 所有 API 调用应该被 Mock
   - 使用 `helpers.ts` 中的辅助函数
   - 确保测试独立于外部服务

2. **等待元素**
   - 使用 `waitForSelector` 或 `waitForPosts`
   - 避免硬编码延迟

3. **选择器策略**
   - 优先使用语义化选择器（`getByRole`, `getByText`）
   - 避免使用 CSS 类名（可能变化）
   - 使用 `filter` 精确定位元素

4. **测试隔离**
   - 每个测试应该独立运行
   - 使用 `beforeEach` 设置通用 Mock
   - 清理副作用

5. **清晰的断言**
   - 使用 Playwright 的 `expect` API
   - 提供有意义的错误消息
   - 测试用户可见的行为

## 常见场景

### 测试异步操作

```typescript
test('should handle async action', async ({ page }) => {
  await setupTopicPageMocks(page)
  await page.goto('/topic/6399262')

  // 点击按钮
  await page.getByRole('button', { name: 'Like' }).click()

  // 等待 API 完成
  await page.waitForResponse('**/post/*/like')

  // 验证结果
  await expect(page.getByText('Updated')).toBeVisible()
})
```

### 测试表单输入

```typescript
test('should handle form input', async ({ page }) => {
  await page.goto('/login')

  const usernameInput = page.getByLabel('Username')
  const passwordInput = page.getByLabel('Password')
  const submitButton = page.getByRole('button', { name: 'Login' })

  await usernameInput.fill('testuser')
  await passwordInput.fill('password123')
  await submitButton.click()

  await expect(page).toHaveURL('/dashboard')
})
```

### 测试路由导航

```typescript
test('should navigate to board page', async ({ page }) => {
  await setupTopicPageMocks(page)
  await page.goto('/topic/6399262')

  const backLink = page.getByRole('link', { name: /返回.*/ })
  await backLink.click()

  await expect(page).toHaveURL(/\/board\/\d+/)
})
```

### 测试条件渲染

```typescript
test('should show/hide based on state', async ({ page }) => {
  await setupTopicPageMocks(page, {
    posts: [mockPostResponse({ isAnonymous: true })]
  })

  await page.goto('/topic/6399262')

  // 匿名用户不应该看到追踪按钮
  const traceButton = page.getByRole('button', { name: '追踪' })
  await expect(traceButton).not.toBeVisible()
})
```

## 调试测试

### 使用调试模式

```bash
# 逐步执行测试
bun run playwright test --debug
```

### 查看详细日志

```bash
# 显示浏览器控制台
bun run playwright test --project=chromium --debug

# 生成测试报告
bun run playwright test --reporter=html
```

### 截图和录屏

Playwright 在测试失败时自动：
- 截图
- 录制视频
- 保存 trace

查看 trace：

```bash
bun run playwright show-trace trace.zip
```

## 持续集成

测试在以下情况自动运行：

- Pull Request 创建或更新
- 推送到 main 分支
- 手动触发

配置文件：`.github/workflows/e2e.yml`（如果存在）

## 故障排除

### 测试超时

增加超时时间：

```typescript
test.setTimeout(60000) // 60 秒
```

### 测试不稳定

- 使用 `waitForResponse` 而不是固定延迟
- 检查网络条件
- 使用重试机制（已在配置中启用）

### Mock 不工作

确保 URL 匹配：

```typescript
await page.route('**/api.cc98.top/**', async route => {
  // 你的 mock 逻辑
})
```

## 相关资源

- [Playwright 文档](https://playwright.dev/)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [项目 API 文档](../../docs/api.md)

## 待实现的测试

- [ ] 回复编辑器完整功能
- [ ] 引用功能完整流程
- [ ] 文件上传
- [ ] 用户个人中心
- [ ] 消息通知
- [ ] 搜索功能
- [ ] 版面列表和筛选
- [ ] 登录/登出流程
