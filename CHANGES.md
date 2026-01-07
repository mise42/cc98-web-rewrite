# 更新日志

## [2.0.0] - 2025-01-07

### 新增
- ✅ 初始化 CC98 论坛重写项目
- ✅ 配置完整的项目结构和开发环境
- ✅ 集成现代化技术栈

### 变更
- 🔄 项目名称从 `my-spa-app` 更改为 `cc98-web-rewrite`
- 🔄 使用 `@vitejs/plugin-react-swc` 替代 `@vitejs/plugin-react`（使用 SWC 编译器）
- 🔄 添加 Node.js 类型定义以支持配置文件

### 技术栈
- **包管理**: Bun
- **构建工具**: Vite + SWC
- **UI 框架**: React 19
- **路由**: React Router v7
- **状态管理**: Zustand
- **服务器状态**: TanStack Query
- **UI 组件库**: Ant Design v6
- **测试**: Vitest + Playwright

### 项目结构
```
cc98-web-rewrite/
├── src/
│   ├── routes/          # 路由配置
│   ├── pages/           # 页面组件
│   ├── components/      # 通用组件
│   ├── stores/          # Zustand 状态管理
│   ├── services/        # API 客户端
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具库（含 UBB 解析器）
│   ├── styles/          # CSS Modules 样式
│   ├── types/           # TypeScript 类型
│   └── config/          # 配置文件
├── tests/               # 测试文件
├── vendor/              # Git submodule（原始项目)
└── public/              # 静态资源
```

### 开发命令
```bash
# 启动开发服务器
bun run dev

# 构建生产版本
bun run build

# 运行测试
bun run test
bun run test:e2e

# 代码检查和格式化
bun run lint
bun run format
```

### Git 提交历史
- `94ef443` - chore: update project name and switch to SWC
- `14d208c` - feat: initialize CC98 forum rewrite project
