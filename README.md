# CC98 论坛重写项目

这是 CC98 论坛的现代化重写版本，采用最新的技术栈进行重构。

## 技术栈

### 核心框架

- **工具链**: [Vite+](https://viteplus.dev/)（`vp`，使用 Bun 作为包管理后端）
- **构建工具**: Vite 8 + OXC
- **UI 框架**: [React 19](https://react.dev/)
- **路由**: [TanStack Router](https://tanstack.com/router)（文件路由）
- **状态管理**: [Zustand](https://zustand-demo.pmnd.rs/)
- **服务器状态**: [@tanstack/react-query](https://tanstack.com/query/latest)
- **UI 组件库**: [Ant Design v6](https://ant.design/)

### 关键依赖

- **实时通信**: [@microsoft/signalr](https://learn.microsoft.com/en-us/aspnet/core/signalr/)
- **IndexedDB**: [idb](https://github.com/jakearchibald/idb)
- **Markdown 编辑器**: [@cc98/hell-react-mde](https://www.npmjs.com/package/@cc98/hell-react-mde)
- **日期处理**: [date-fns](https://date-fns.org/)
- **类名工具**: [clsx](https://github.com/lukeed/clsx)

### 测试

- **单元测试**: [Vitest](https://vitest.dev/)
- **E2E 测试**: [Playwright](https://playwright.dev/)
- **测试库**: [@testing-library/react](https://testing-library.com/react)

### 开发工具

- **代码检查**: Vite+ 默认 `vp check`（Oxlint + Oxfmt）
- **Git Hooks**: Vite+ `.vite-hooks` + `vp staged`
- **TypeScript**: 严格模式

## 项目结构

```
cc98-web-rewrite/
├── src/
│   ├── routes/          # TanStack Router 文件路由配置
│   ├── pages/           # 页面组件
│   ├── components/      # 通用组件
│   ├── stores/          # Zustand 状态管理
│   ├── services/        # API 客户端
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具库（包含 UBB 解析器）
│   ├── styles/          # 全局样式
│   ├── types/           # TypeScript 类型
│   └── config/          # 配置文件
├── tests/               # 测试文件
│   ├── unit/            # Vitest 单元测试
│   └── e2e/             # Playwright E2E 测试
└── public/              # 静态资源
```

## 开发

### 安装依赖

```bash
vp install
```

### 启动开发服务器

```bash
vp dev --host --port 5173
```

开发服务器将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
vp build
```

### 预览生产构建

```bash
vp preview
```

### 代码检查

```bash
vp check
```

自动修复 Vite+ 默认格式和 lint 问题：

```bash
vp check --fix
```

Git pre-commit hook 由 Vite+ 管理，提交时会运行：

```bash
vp staged
```

## Docker 自部署

### 1. 构建镜像

```bash
docker build -t cc98-web-rewrite .
```

如需覆盖 `VITE_*` 构建变量，可通过 `--build-arg` 传入，例如：

```bash
docker build \
  --build-arg VITE_API_URL=https://your-api.example.com \
  --build-arg VITE_OPENID_URL=https://your-openid.example.com \
  --build-arg VITE_OAUTH_REDIRECT_URI=https://your-domain.com/auth/callback \
  -t cc98-web-rewrite .
```

### 2. 运行容器

```bash
docker run -d --name cc98-web -p 8080:3000 cc98-web-rewrite
```

访问 `http://localhost:8080` 即可。容器内使用 **Hono** 提供静态资源与 SPA 路由回退（`/index.html`），并提供健康检查接口：`/health`。

### 3. 一键远程部署（omarchy）

仓库根目录提供了 `deploy.sh`，用于：本机构建 `linux/amd64` 镜像 → SSH 传输到远端 → `docker compose` 重建服务。

```bash
./deploy.sh \
  --redirect-uri https://omarchy.tail665f63.ts.net:13000/auth/callback \
  --tailnet-health-url https://omarchy.tail665f63.ts.net:13000/health
```

## 测试

### 运行单元测试

```bash
vp test run
```

### 运行 E2E 测试

```bash
bun run test:e2e
```

## 环境变量

参考 `.env.example` 文件创建相应的环境变量文件：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

## 与原项目的主要变化

### 技术栈升级

- ✅ React 16 → React 19
- ✅ Webpack → Vite 8 + OXC
- ✅ Bun scripts → Vite+ (`vp`) toolchain entrypoints
- ✅ Redux → Zustand
- ✅ React Router v4 → TanStack Router（文件路由）
- ✅ Ant Design v3 → Ant Design v6
- ✅ 手动 fetch → TanStack Query
- ✅ jQuery 依赖移除

### 架构改进

- ✅ 函数组件 + Hooks（替代类组件）
- ✅ TypeScript 严格模式
- ✅ CSS Modules（替代 SCSS）
- ✅ 现代化状态管理
- ✅ 完整的测试覆盖

## 开发计划

- [x] 阶段 1：项目基础设施搭建
- [ ] 阶段 2：核心基础设施迁移
- [ ] 阶段 3：核心页面迁移
- [ ] 阶段 4：编辑器迁移
- [ ] 阶段 5：高级功能
- [ ] 阶段 6：测试与优化

## 许可证

本项目基于原始 CC98 论坛项目进行重写。

## 致谢

- 原始项目：[ZJU-CC98/Forum](https://github.com/ZJU-CC98/Forum)
