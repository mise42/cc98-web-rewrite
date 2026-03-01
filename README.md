# CC98 论坛重写项目

这是 CC98 论坛的现代化重写版本，采用最新的技术栈进行重构。

## 技术栈

### 核心框架

- **包管理**: [Bun](https://bun.sh/)
- **构建工具**: [Vite](https://vitejs.dev/) + [SWC](https://swc.rs/)
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

- **代码规范**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)
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
├── vendor/              # Git submodule（原始项目参考）
└── public/              # 静态资源
```

## 开发

### 安装依赖

```bash
bun install
```

### 启动开发服务器

```bash
bun run dev
```

开发服务器将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
bun run build
```

### 预览生产构建

```bash
bun run preview
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
docker run -d --name cc98-web -p 8080:80 cc98-web-rewrite
```

访问 `http://localhost:8080` 即可。容器内已配置 SPA 路由回退（`/index.html`）。

## 测试

### 运行单元测试

```bash
bun run test
```

### 运行 E2E 测试

```bash
bun run test:e2e
```

## 代码规范

### 运行 ESLint

```bash
bun run lint
```

### 自动修复

```bash
bun run lint:fix
```

### 格式化代码

```bash
bun run format
```

## 环境变量

参考 `.env.example` 文件创建相应的环境变量文件：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

## Git Submodule

本项目包含一个 git submodule，用于参考原始项目：

```bash
git submodule update --init --recursive
```

## 与原项目的主要变化

### 技术栈升级

- ✅ React 16 → React 19
- ✅ Webpack → Vite + SWC
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
