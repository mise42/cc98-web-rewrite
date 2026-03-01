# Spec: 用户菜单与个人中心功能增强

## 背景

当前用户反馈：

1. 首页右上角用户名菜单需要改为 **hover 展开**，且一级菜单只保留：
   - 个人中心
   - 签到
   - 退出登录
2. 点击个人中心后，需要有明确入口支持：
   - 修改资料
   - 我的主题
   - 我的回复
   - 关注版面
   - 关注用户
   - 我的粉丝
   - 转账系统
   - 切换皮肤

## 目标

- 统一用户入口信息架构，减少菜单层级。
- 在个人中心提供一屏可达的核心操作入口。
- 对暂未完全开放后端能力的功能，提供可用的前端交互与明确提示。

## 范围

### In Scope

- Header 用户菜单交互改造（click -> hover）
- 一级菜单项收敛（仅 3 项）
- 个人中心快捷入口扩展到 8 项（编辑资料保留在左侧资料卡片按钮）
- 新增 4 个个人中心子页面：
  - 关注版面
  - 我的粉丝
  - 转账系统
  - 切换皮肤
- 补充关注版面帖子流能力（`/me/custom-board/topic`）

### Out of Scope

- 后端未开放接口的真实业务落库（如真实转账）
- 粉丝/关注用户全量关系图谱功能

## 详细设计

### 1) Header 用户菜单

- 触发方式：鼠标 hover 用户名区域展开菜单。
- 菜单仅保留三项：
  1. 个人中心（跳转 `/usercenter`）
  2. 签到（跳转 `/usercenter/signin` 签到中心）
  3. 退出登录（调用现有 logout）

#### 验收标准

- 菜单展开不依赖点击。
- 不再出现“编辑资料/消息中心/关注的帖子”等其他一级菜单项。
- 点击“签到”应跳转到签到中心页面，展示连续签到与签到状态。

### 2) 个人中心快捷入口

左侧资料卡片提供：

- 编辑资料 -> `/usercenter/edit`

新增 8 个快捷卡片入口：

1. 我的主题 -> `/usercenter/mytopics/1`
2. 我的回复 -> `/usercenter/myposts/1`
3. 我的收藏 -> `/usercenter/favorites/1`
4. 关注版面 -> `/usercenter/followed-boards`
5. 关注用户 -> `/following-topics`
6. 我的粉丝 -> `/usercenter/fans`
7. 转账系统 -> `/usercenter/transfer`
8. 切换皮肤 -> `/usercenter/theme`

#### 验收标准

- 左侧“编辑资料”按钮可见且可点击。
- 8 个快捷入口卡片全部可见且可点击。
- 路由全部可访问且有有效页面内容。

### 3) 新增页面说明

#### 3.1 关注版面

- 展示当前用户关注版面（来自 `user.customBoards`）。
- 展示关注版面的主题动态（`GET /me/custom-board/topic?from=&size=`）。

#### 3.2 我的粉丝

- 展示粉丝总数（`user.fanCount`）。
- 若列表接口不可用，显示“仅可展示统计”提示，不报错。

#### 3.3 转账系统

- 提供收款用户名、金额、备注的表单交互。
- 前端进行基础校验；后端接口未开放时给出明确提示。

#### 3.4 切换皮肤

- 支持浅色/深色/跟随系统三种模式。
- 本地持久化（localStorage）。
- 即时应用到文档根节点 `dark` class。

## 技术实现摘要

- `Header.tsx`：菜单触发改为 hover，收敛菜单项。
- `UserCenterPage.tsx`：快捷入口扩展为 8 项（编辑资料保留左侧按钮）。
- `boardService.ts`：新增关注版面相关方法。
- 新增路由：
  - `/_authenticated/usercenter/followed-boards`
  - `/_authenticated/usercenter/fans`
  - `/_authenticated/usercenter/transfer`
  - `/_authenticated/usercenter/theme`

## 测试计划

### 单元测试

1. Header 菜单 hover 行为
   - hover 后出现 3 项：个人中心/签到/退出登录
   - 不出现其他一级菜单项
2. 个人中心快捷入口
   - 校验左侧“编辑资料”按钮可见
   - 渲染并校验 8 项快捷入口文案

### 集成/端到端测试

1. 登录态下首页 hover 用户名，验证菜单项。
2. 进入 `/usercenter` 验证左侧“编辑资料”按钮与 8 个快捷入口。
3. 点击新入口验证路由可达。
