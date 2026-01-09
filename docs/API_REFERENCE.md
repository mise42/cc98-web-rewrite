# CC98 论坛后端 API 参考手册

## 概述

本文档描述 CC98 论坛后端 API 的完整规范，包括所有端点、数据模型、认证机制和错误处理。

**基础 URL**: `https://api-v2.cc98.org`

---

## 1. 用户认证与管理 API

### 1.1 用户信息

| API 端点                     | HTTP 方法 | 功能描述               | 请求参数                 | 响应类型         |
| ---------------------------- | --------- | ---------------------- | ------------------------ | ---------------- |
| `/me`                        | GET       | 获取当前用户信息       | Header: Authorization    | UserInfo         |
| `/me/unread-count`           | GET       | 获取未读消息数         | Header: Authorization    | MessageInfo      |
| `/me/all-message-count`      | GET       | 获取各类消息总数       | Header: Authorization    | MessageCountInfo |
| `/user/basic`                | GET       | 批量获取用户基础信息   | Query: id                | UserInfo[]       |
| `/user/name/{username}`      | GET       | 通过用户名获取用户信息 | Path: username           | UserInfo         |
| `/me/followee/{userId}`      | PUT       | 关注用户               | Path: userId             | boolean          |
| `/me/followee/{userId}`      | DELETE    | 取关用户               | Path: userId             | boolean          |
| `/me/custom-board/{boardId}` | PUT       | 关注版面               | Path: boardId            | void             |
| `/me/custom-board/{boardId}` | DELETE    | 取关版面               | Path: boardId            | void             |
| `/me/followee/topic`         | GET       | 获取关注用户的帖子     | Query: from, size, order | Topic[]          |
| `/me/custom-board/topic`     | GET       | 获取关注版面的帖子     | Query: from, size        | Topic[]          |

### 1.2 用户年度总结

| API 端点                    | HTTP 方法 | 功能描述         | 请求参数   |
| --------------------------- | --------- | ---------------- | ---------- |
| `/me/annual-review-{year}`  | GET       | 获取年度总结数据 | Path: year |
| `/me/make-up-missed-signin` | POST      | 补签             | Body: -    |

---

## 2. 消息与通知 API

### 2.1 私信

| API 端点                        | HTTP 方法 | 功能描述             | 请求参数                    |
| ------------------------------- | --------- | -------------------- | --------------------------- |
| `/message`                      | POST      | 发送私信             | Body: {toUserName, content} |
| `/message/user/{userId}`        | GET       | 获取与指定用户的私信 | Query: from, size           |
| `/message/recent-contact-users` | GET       | 获取最近联系人       | Query: from, size           |

### 2.2 系统通知

| API 端点                        | HTTP 方法 | 功能描述               | 请求参数          |
| ------------------------------- | --------- | ---------------------- | ----------------- |
| `/notification/system`          | GET       | 获取系统通知           | Query: from, size |
| `/notification/reply`           | GET       | 获取回复通知           | Query: from, size |
| `/notification/at`              | GET       | 获取@通知              | Query: from, size |
| `/notification/read-all-reply`  | PUT       | 标记所有回复为已读     | -                 |
| `/notification/read-all-at`     | PUT       | 标记所有@为已读        | -                 |
| `/notification/read-all-system` | PUT       | 标记所有系统消息为已读 | -                 |

---

## 3. 版面管理 API

### 3.1 版面信息

| API 端点           | HTTP 方法 | 功能描述         | 请求参数       |
| ------------------ | --------- | ---------------- | -------------- |
| `/board/{boardId}` | GET       | 获取版面信息     | Path: boardId  |
| `/board/all`       | GET       | 获取所有版面信息 | -              |
| `/board/search`    | GET       | 搜索版面         | Query: keyword |

### 3.2 版面内容

| API 端点                                   | HTTP 方法 | 功能描述         | 请求参数              |
| ------------------------------------------ | --------- | ---------------- | --------------------- |
| `/board/{boardId}/topic`                   | GET       | 获取版面主题列表 | Query: from, size     |
| `/board/{boardId}/events`                  | GET       | 获取版面管理记录 | Query: from, size     |
| `/board/{boardId}/tag`                     | GET       | 获取版面标签     | Path: boardId         |
| `/board/{boardId}/big-paper`               | PUT       | 编辑版面公告     | Body: {content}       |
| `/board/{boardId}/stop-post-user`          | GET       | 获取禁发用户列表 | Query: from, size     |
| `/board/{boardId}/stop-post-user/{userId}` | DELETE    | 取消用户禁发     | Path: boardId, userId |

---

## 4. 主题管理 API

### 4.1 主题操作

| API 端点                            | HTTP 方法 | 功能描述          | 请求参数                           |
| ----------------------------------- | --------- | ----------------- | ---------------------------------- |
| `/topic/{topicId}/post`             | GET       | 获取主题帖子列表  | Query: from, size                  |
| `/topic/{topicId}/hot-post`         | GET       | 获取主题热门回复  | -                                  |
| `/topic/{topicId}`                  | DELETE    | 删除主题          | Body: {reason}                     |
| `/topic/{topicId}/top`              | PUT       | 置顶/取消置顶主题 | Body: {topState, duration, reason} |
| `/topic/{topicId}/top`              | DELETE    | 取消置顶主题      | Body: {reason}                     |
| `/topic/{topicId}/lock`             | PUT       | 锁定主题          | Body: {reason, days}               |
| `/topic/{topicId}/lock`             | DELETE    | 解锁主题          | Body: {reason}                     |
| `/topic/{topicId}/up`               | PUT       | 加精主题          | Body: {reason}                     |
| `/topic/{topicId}/moveto/{boardId}` | PUT       | 移动主题          | Body: {reason}                     |
| `/topic/{topicId}/look-ip`          | GET       | 查看主题IP        | -                                  |
| `/topic/{topicId}/event`            | GET       | 获取主题管理记录  | Query: from, size                  |
| `/topic/{topicId}/vote`             | GET       | 获取主题投票信息  | -                                  |

### 4.2 主题查询

| API 端点                            | HTTP 方法 | 功能描述               | 请求参数                      |
| ----------------------------------- | --------- | ---------------------- | ----------------------------- |
| `/topic/new`                        | GET       | 获取全站新帖           | Query: from, size             |
| `/topic/new-media`                  | GET       | 获取全站新帖（含媒体） | Query: from, size             |
| `/topic/random-recommendation`      | GET       | 获取随机精选帖         | Query: size                   |
| `/topic/search`                     | GET       | 搜索主题（全站）       | Query: keyword, from, size    |
| `/topic/search/board/{boardId}`     | GET       | 搜索主题（版面内）     | Query: keyword, from, size    |
| `/topic/search/board/{boardId}/tag` | GET       | 按标签搜索主题         | Query: tag1, tag2, from, size |
| `/topic/toptopics`                  | GET       | 获取版面热门主题       | Query: boardid                |
| `/topic/best/board/{boardId}`       | GET       | 获取版面精华主题       | Query: from, size             |
| `/topic/save/board/{boardId}`       | GET       | 获取版面收藏主题       | Query: from, size             |
| `/topic/me/favorite`                | GET       | 获取收藏的主题         | Query: from, size, order      |
| `/topic/basic`                      | GET       | 批量获取主题基础信息   | Query: topicIds               |
| `/topic/multi-delete`               | PUT       | 批量删除主题           | Body: {id, reason}            |
| `/topic/multi-lock`                 | PUT       | 批量锁定主题           | Body: {id, reason, value}     |

---

## 5. 帖子管理 API

### 5.1 帖子操作

| API 端点                     | HTTP 方法 | 功能描述                   | 请求参数                            |
| ---------------------------- | --------- | -------------------------- | ----------------------------------- |
| `/post/{postId}`             | DELETE    | 删除帖子                   | Body: {reason}                      |
| `/post/topic/{topicId}`      | POST      | 发表回复                   | Body: {content, contentType, title} |
| `/post/topic/user`           | GET       | 获取用户在主题中的帖子     | Query: topicid, userid, from, size  |
| `/post/topic/specific-user`  | GET       | 获取特定用户在主题中的帖子 | Query: topicid, postid, from, size  |
| `/post/topic/anonymous/user` | GET       | 获取匿名用户在主题中的帖子 | Query: topicid, postid, from, size  |
| `/post/{postId}/like`        | PUT       | 点赞/点踩                  | Body: "1" 或 "2"                    |
| `/post/{postId}/like`        | GET       | 获取点赞状态和数量         | -                                   |

### 5.2 帖子评价

| API 端点                   | HTTP 方法 | 功能描述               | 请求参数                                                     |
| -------------------------- | --------- | ---------------------- | ------------------------------------------------------------ |
| `/post/{postId}/rating`    | PUT       | 风评帖子（v1）         | Body: {value, reason}                                        |
| `/post/{postId}/rating-v2` | PUT       | 风评帖子（v2）         | Body: {reasonId, type}                                       |
| `/post/{postId}/awards`    | GET       | 获取帖子奖惩信息       | -                                                            |
| `/post/{postId}/operation` | POST      | 帖子操作（奖惩、禁言） | Body: {operationType, wealth/prestige, reason, stopPostDays} |

### 5.3 帖子基础信息

| API 端点      | HTTP 方法 | 功能描述             | 请求参数       |
| ------------- | --------- | -------------------- | -------------- |
| `/post/basic` | GET       | 批量获取帖子基础信息 | Query: postIds |

---

## 6. 文件上传 API

| API 端点 | HTTP 方法 | 功能描述 | 请求参数        |
| -------- | --------- | -------- | --------------- |
| `/file`  | POST      | 上传文件 | FormData: files |

---

## 7. 配置管理 API

| API 端点                       | HTTP 方法 | 功能描述         | 请求参数 |
| ------------------------------ | --------- | ---------------- | -------- |
| `/config/now`                  | GET       | 获取当前配置信息 | -        |
| `/config/index`                | GET       | 获取首页配置     | -        |
| `/config/index/update`         | PUT       | 更新首页配置     | Body: -  |
| `/config/global/advertisement` | GET       | 获取全局广告     | -        |

---

## 8. 站点管理 API

| API 端点             | HTTP 方法 | 功能描述     | 请求参数 |
| -------------------- | --------- | ------------ | -------- |
| `/announcement`      | GET       | 获取公告列表 | -        |
| `/announcement`      | POST      | 创建公告     | Body: -  |
| `/announcement/{id}` | DELETE    | 删除公告     | Path: id |

---

## 数据模型

### UserInfo (用户信息)

```typescript
{
  id: number
  name: string
  portraitUrl: string
  birthday: string
  fanCount: number
  followCount: number
  gender: number
  lastLogOnTime: string
  popularity: number
  prestige: number
  signatureCode: string
  levelTitle: string
  displayTitle: string
  isFollowing: boolean
}
```

### Topic (主题信息)

```typescript
{
  id: number
  title: string
  content: string
  userId: number
  userName: string
  portraitUrl: string
  boardId: number
  boardName: string
  time: string
  lastPostTime: string
  hitCount: number
  replyCount: number
  floorCount: number
  isAnonymous: boolean
  isLocked: boolean
  topState: number
  tag1: string
  tag2: string
}
```

### Post (帖子信息)

```typescript
{
  id: number
  content: string
  userId: number
  userName: string
  userInfo: UserInfo
  topicId: number
  floor: number
  time: string
  lastUpdateTime: string
  isAnonymous: boolean
  isDeleted: boolean
}
```

### MessageInfo (消息统计)

```typescript
{
  atCount: number
  replyCount: number
  systemCount: number
  total: number
}
```

### BoardInfo (版面信息)

```typescript
{
  id: number
  name: string
  description: string
  parentId: number
}
```

---

## 认证机制

### OAuth 2.0 Bearer Token 认证

系统使用 OAuth 2.0 标准进行身份认证：

1. **Token 获取**
   - 用户登录后获得 `access_token` 和 `refresh_token`
   - Token 存储在 `localStorage` 中（通过 Zustand auth-storage 持久化）

2. **Token 使用**
   - 每个 API 请求需要在 Header 中携带：
     ```
     Authorization: Bearer {access_token}
     ```

3. **Token 刷新**
   - 当 `access_token` 过期时，使用 `refresh_token` 自动刷新
   - 刷新失败时跳转到登录页面

### 请求头格式

```typescript
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

---

## 错误处理

### HTTP 状态码

| 状态码 | 含义                  | 描述                |
| ------ | --------------------- | ------------------- |
| 200    | OK                    | 请求成功            |
| 400    | Bad Request           | 请求参数错误        |
| 401    | Unauthorized          | 未认证或 token 过期 |
| 403    | Forbidden             | 无权限访问          |
| 404    | Not Found             | 资源不存在          |
| 500    | Internal Server Error | 服务器错误          |

### 前端错误处理

前端使用 TanStack Query 统一管理 API 请求的加载（isLoading）和错误（isError）状态。

全局错误处理策略：

- **401 Unauthorized**: 自动清除认证状态并跳转登录页（带重定向参数）
- **网络错误**: 显示 Toast 提示（Sonner）
- **组件级错误**: 使用 Error Boundary 捕获并显示错误 UI
- **表单错误**: 显示在对应的输入框下方或 Toast 提示

主要错误类型处理：

- `LogOut`: 未登录，自动重定向到登录页
- `Unauthorized`: 无权限，显示错误提示
- `NotFound`: 资源不存在，显示 404 组件
- `ServerError`: 服务器错误，显示重试按钮

---

## 分页规范

所有列表类 API 都采用分页返回：

### 请求参数

- `from`: 起始位置（从 0 开始）
- `size`: 每页数量（通常为 20）

### 示例

```
GET /topic/new?from=0&size=20
GET /board/123/topic?from=20&size=20
```

---

## 注意事项

1. **匿名用户**
   - 匿名用户的 `userId` 为 `null`
   - 匿名用户的 `userName` 会显示为 "匿名{大写字母}"

2. **时间格式**
   - 后端返回 ISO 8601 格式的 UTC 时间
   - 前端使用 `date-fns` 库转换为本地时间显示

3. **内容过滤**
   - 所有用户生成的内容都会经过 XSS 过滤
   - 支持 UBB 代码（自定义解析引擎）和 Markdown（react-markdown）

4. **缓存策略**
   - 使用 TanStack Query 进行自动缓存管理
   - 版面列表、配置信息等静态数据配置了较长的 staleTime
   - 用户操作（如点赞、回复）后会自动失效相关查询以刷新数据

5. **批量查询**
   - 用户信息批量查询：`/user/basic?id=1&id=2&id=3`
   - 主题信息批量查询：`/topic/basic?topicIds=1,2,3`
   - 帖子信息批量查询：`/post/basic?postIds=1,2,3`

---

## 版本历史

### 后端 API 版本

- **v1.0**: 基础 API 设计
- **v2.0**: 新增风评 v2 接口 (`/post/{postId}/rating-v2`)

---

## 相关文档

- **[架构说明](ARCHITECTURE.md)** - 项目架构和技术栈
- **[路由配置](ROUTING.md)** - 前端路由映射
- **[重构文档](REFACTORING.md)** - 重构进度和计划
