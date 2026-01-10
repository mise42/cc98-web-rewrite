# E2E 测试实现状态

## ✅ 已完成

1. **测试框架配置** - Playwright 已配置完成
   - 测试目录: `tests/e2e`
   - 配置文件: `playwright.config.ts`
   - 测试命令: `bun run test:e2e`

2. **测试辅助工具**
   - `tests/e2e/test-utils.ts` - 登录辅助函数
   - `tests/e2e/helpers.ts` - 通用Mock和选择器辅助函数

3. **基础测试** - `tests/e2e/basic.spec.ts`
   - ✅ 首页导航
   - ✅ API Mock功能
   - ✅ 认证状态设置

4. **UBB渲染测试** - `tests/e2e/ubb-rendering.spec.ts`
   - ✅ UBB标签渲染
   - ✅ Markdown渲染

## ⚠️ 部分完成

**帖子详情页测试** - `tests/e2e/topic-detail.spec.ts`

测试用例已编写但需要调整。当前问题：
- 认证和路由的时序问题
- 需要改进测试等待策略

### 已编写的测试用例

1. ✅ 帖子加载和显示
2. ✅ 楼层号正确显示（非连续）
3. ✅ 视图模式切换（分页/无限滚动）
4. ✅ 追踪模式（进入/退出）
5. ✅ 匿名用户不显示追踪按钮
6. ✅ 点赞/点踩按钮显示
7. ✅ 引用按钮显示
8. ✅ 返回版面链接
9. ✅ 主题元数据显示
10. ✅ 空状态处理
11. ✅ 追踪模式下隐藏分页

### 测试覆盖的功能点

#### 帖子内容显示
- 主题标题、内容
- 回复列表
- 用户信息
- 时间戳
- 楼层号

#### 交互功能
- 点赞按钮
- 点踩按钮
- 引用按钮
- 追踪按钮
- 退出追踪

#### 视图模式
- 分页模式
- 无限滚动模式
- 模式切换

#### 特殊状态
- 追踪模式
- 空状态
- 加载状态

## 运行测试

### 运行所有 E2E 测试
```bash
bun run test:e2e
```

### 运行特定测试文件
```bash
# 基础测试
bun run playwright test basic.spec.ts

# UBB渲染测试
bun run playwright test ubb-rendering.spec.ts

# 帖子详情测试
bun run playwright test topic-detail.spec.ts
```

### 调试模式
```bash
# 带浏览器界面
bun run playwright test --debug

# UI模式
bun run playwright test --ui
```

### 查看测试报告
```bash
# HTML报告
bun run playwright show-report

# Trace文件
bun run playwright show-trace test-results/trace.zip
```

## 当前问题

### 1. 认证状态设置
**问题**: 部分测试因为认证重定向而失败
**解决方案**: 已创建 `loginAs()` 辅助函数，需要在每个测试开始时调用

**使用方法**:
```typescript
import { loginAs } from './test-utils'

test('my test', async ({ page }) => {
  // 1. 先设置登录状态
  await loginAs(page)

  // 2. 设置Mock
  await page.route('**/api.cc98.top/**', ...)

  // 3. 访问页面
  await page.goto('/topic/6399262')

  // 4. 测试断言
  await expect(...)
})
```

### 2. 测试等待策略
**问题**: 某些测试超时等待元素
**建议**:
- 使用 `waitForResponse` 等待API完成
- 使用 `waitForSelector` 等待DOM元素
- 避免硬编码延迟 `waitForTimeout`

## 测试最佳实践

### 1. Mock策略
```typescript
// Mock API响应
await page.route('**/api.cc98.top/topic/6399262', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData),
  })
})
```

### 2. 认证处理
```typescript
// 设置测试用户
await loginAs(page, 'testuser')
```

### 3. 元素选择
```typescript
// 好的做法 - 语义化选择器
await page.getByRole('button', { name: '追踪' }).click()
await page.getByText('测试主题')

// 避免 - 脆弱的CSS选择器
await page.locator('.shadow-md.bg-card\\/50')
```

### 4. 断言
```typescript
// 清晰的断言
await expect(page.getByText('加载中...')).toBeVisible()
await expect(page).toHaveURL('/topic/6399262')
```

## 下一步

### 优先级1: 修复现有测试
1. 调整 `topic-detail.spec.ts` 的测试等待逻辑
2. 确保所有Mock在正确的时机设置
3. 添加更详细的错误日志

### 优先级2: 添加新测试
1. 完整的点赞/点踩流程测试
2. 引用功能完整流程测试（需要编辑器）
3. 分页功能详细测试
4. 无限滚动功能测试

### 优先级3: 测试增强
1. 添加视觉回归测试
2. 性能测试
3. 可访问性测试
4. 跨浏览器测试

## 参考资源

- [Playwright 文档](https://playwright.dev/)
- [测试辅助函数](./helpers.ts)
- [测试工具](./test-utils.ts)
- [测试README](./README.md)

## 测试数据

### Mock数据结构

**主题数据**:
```typescript
{
  id: 6399262,
  title: '测试主题',
  content: '内容',
  time: '2025-01-10T10:00:00',
  userName: '楼主',
  userId: 1,
  replyCount: 25,
  hitCount: 1000,
  // ...更多字段
}
```

**回复数据**:
```typescript
{
  id: 1,
  content: '回复内容',
  contentType: 0,
  floor: 1,
  userName: '用户A',
  userId: 100,
  likeCount: 5,
  dislikeCount: 1,
  // ...更多字段
}
```

### 认证状态
```typescript
const authState = {
  state: {
    user: {
      id: 1,
      name: 'testuser',
      // ...更多字段
    },
    isAuthenticated: true,
  },
  version: 0,
}

localStorage.setItem('auth-storage', JSON.stringify(authState))
```

## 注意事项

1. **测试独立性**: 每个测试应该独立运行，不依赖其他测试
2. **Mock优先**: 所有外部API调用都应该被Mock
3. **清理状态**: 测试后清理副作用（导航、localStorage等）
4. **超时设置**: 合理设置测试超时时间
5. **错误处理**: 添加适当的错误处理和日志

## CI/CD集成

测试可以在以下时机运行：
- Pull Request创建时
- 代码推送到main分支时
- 每日定时运行

配置文件: `.github/workflows/e2e.yml` (如果存在)
