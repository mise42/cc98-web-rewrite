# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server (http://localhost:5173)
bun run dev

# Build production version
bun run build

# Preview production build
bun run preview

# Testing
bun run test              # Run all unit tests (Vitest)
bun run test:ui           # Run Vitest with UI
bun run test:e2e          # Run E2E tests (Playwright)

# Code quality
bun run lint              # ESLint check (max 0 warnings)
bun run lint:fix          # ESLint auto-fix
bun run format            # Prettier format
bun run format:check      # Prettier check
```

### Running Single Tests

```bash
# Unit tests - specific file
bun run test path/to/test.test.ts

# Unit tests - watch mode with filter
bun run test -- --grep "test name pattern"

# E2E tests - specific file
bun run test:e2e path/to/test.spec.ts

# E2E tests - specific browser
bun run test:e2e -- --project=chromium
```

## Architecture Overview

This is a modern rewrite of the CC98 forum using React 19, TypeScript, and TanStack Router.

### Tech Stack

- **Build**: Vite 7.2.4 + SWC (fast compilation)
- **Framework**: React 19.2.0 + TypeScript (strict mode)
- **Router**: TanStack Router 1.145.7 (file-based routing)
- **State Management**: Zustand 5.0.9 (client), TanStack Query 5.90.16 (server)
- **Real-time**: SignalR 10.0.0
- **Testing**: Vitest 4.0.16 (unit), Playwright 1.57.0 (E2E)
- **Package Manager**: Bun

### Key Architectural Patterns

**File-Based Routing**: Routes are auto-generated from `src/routes/` directory structure. The route tree (`routeTree.gen.ts`) is auto-generated but **must be committed** to git.

**Authentication Flow**: OAuth2 with token refresh. Tokens stored in localStorage, managed by `TokenManager` singleton. Protected routes use `beforeLoad` hook in `_authenticated.tsx` layout.

**API Layer**: Centralized `ApiClient` class handles all HTTP requests with automatic token injection and passive 401 token refresh. Services are singleton objects exported from `src/services/`.

**State Management**: Zustand for auth state (persisted to localStorage). TanStack Query for server state caching and synchronization.

## Path Aliases

Use these instead of relative imports (configured in vite.config.ts):

```
@/*            → ./src/*
@components/*  → ./src/components/*
@pages/*       → ./src/pages/*
@routes/*      → ./src/routes/*
@stores/*      → ./src/stores/*
@services/*    → ./src/services/*
@hooks/*       → ./src/hooks/*
@lib/*         → ./src/lib/*
@styles/*      → ./src/styles/*
@types/*       → ./src/types/*
@config/*      → ./src/config/*
```

## Routing with TanStack Router

This project uses TanStack Router's file-based routing system.

### Route File Patterns

- `__root.tsx` - Root layout (wraps all routes with Header/Footer)
- `index.tsx` - Index route for path (`/`)
- `$param.tsx` - Dynamic parameter (`/topic/$topicId` → `/topic/123`)
- `_authenticated.tsx` - Protected route layout (checks auth)
- `_authenticated/file.tsx` - Protected route under auth layout

### Protected Routes

Routes requiring authentication must be placed under `_authenticated/` directory or implement `beforeLoad`:

```typescript
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { isAuthenticated, isLoading } = useAuthStore.getState()
    if (!isLoading && !isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
})
```

### Route Loading with TanStack Query

Use the `loader` function to preload data before component renders:

```typescript
export const Route = createFileRoute('/board/$boardId')({
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ['board', params.boardId],
      queryFn: () => boardService.getBoard(params.boardId),
    })
  },
  component: BoardDetailPage,
})
```

## Authentication & Authorization

**OAuth2 Flow**: Password grant or authorization code flow. Tokens managed by `TokenManager` in `src/lib/token-manager.ts`.

**Token Storage**: Access token (expires ~1 hour) and refresh token (expires 30 days) stored in localStorage.

**Automatic Token Refresh**: The `ApiClient` automatically refreshes tokens on 401 responses using a passive refresh strategy.

**Protected Resources**: Use `_authenticated` layout route or check `useAuthStore()` state.

## Service Layer Pattern

All services export singleton objects with async methods:

```typescript
// src/services/board.ts
export const boardService = {
  async getBoard(boardId: string): Promise<IBoard> {
    return apiClient.get<IBoard>(`/board/${boardId}`)
  },

  async getBoardTopics(boardId: string, page: number): Promise<{list: ITopic[]; total: number}> {
    return apiClient.get(`/board/${boardId}/topic?page=${page}`)
  }
}
```

Always use the centralized `apiClient` from `src/services/client.ts` for API calls.

## Code Style

**Import Order**: External dependencies → Internal dependencies (use path aliases) → Types

**Naming Conventions**:
- Components: PascalCase (`UserProfile.tsx`)
- Utilities: kebab-case (`token-manager.ts`)
- API Types: PascalCase with I prefix (`IUser`, `ITopic`)
- Functions: camelCase (`getUserInfo`)

**TypeScript**: Use `type` for aliases, `interface` for object shapes. Explicit return types on exported functions.

**Formatting** (auto-applied by Prettier):
- No semicolons
- Single quotes
- 2 space indentation
- 100 char line width

## Important Constraints

- ❌ NO jQuery (removed from codebase)
- ❌ NO class components (functional components + hooks only)
- ❌ NO relative imports beyond sibling level (use path aliases)
- ✅ Use async/await (not promise chaining)
- ✅ Use `clsx` for conditional classes
- ✅ Use `as const` for immutable objects

## API Proxy Configuration

Development server proxies API requests to backend:

- `/api/*` → `https://qsh.api.cc98.top`
- `/openid/*` → `https://qsh.openid.cc98.top`
- `/hub/*` → SignalR WebSocket endpoint

## Git Hooks

Husky + lint-staged runs on every commit:
- ESLint with auto-fix on `.ts`/`.tsx` files
- Prettier format on `.ts`/`.tsx`/`.css` files

See `AGENTS.md` for more detailed architectural patterns and conventions.
