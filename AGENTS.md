# AGENTS.md - CC98 Forum Rewrite

This guide is for AI coding agents working on the CC98 Forum Rewrite project.

## Quick Reference

bash

# Development

vp dev --host --port 5173 # Start dev server with auto route generation
vp build # Vite+ production build
vp preview # Preview production build

# Testing

vp test run # Run all unit tests
vp test --ui # Run Vitest with UI
bun run test:e2e # Run all E2E tests

# Code Quality

vp check # Run Vite+ default format/lint checks
vp check --fix # Auto-fix Vite+ default format/lint issues
vp lint # Run Oxlint through Vite+
vp fmt # Run Oxfmt through Vite+
vp staged # Run Vite+ staged-file checks used by git hooks

````

## Running Single Tests

### Unit Tests (Vitest)

```bash
# Run specific test file
vp test run path/to/test.test.ts

# Watch mode with filter
vp test watch -t "test name pattern"

# Interactive UI mode
vp test --ui
````

### E2E Tests (Playwright)

```bash
# Run specific test file
bun run test:e2e path/to/test.spec.ts

# Run single test by name
bun run test:e2e -- --grep "test name"

# Run in specific browser
bun run test:e2e -- --project=chromium
```

## Tech Stack

- **Framework**: React 19.2.0 + TypeScript (strict mode)
- **Build**: Vite+ 0.1.24 using Vite 8.0.16 + OXC
- **Router**: TanStack Router 1.170.15 (file-based routing)
- **State**: Zustand 5.0.9 (client state), TanStack Query 5.101.0 (server state)
- **UI**: Ant Design v6.1.4
- **Real-time**: SignalR 10.0.0
- **Testing**: Vitest 4.1.8 (unit), Playwright 1.57.0 (E2E)
- **Toolchain**: Vite+ (`vp`) with Bun package-manager backend

## Reference Upstream

- The legacy CC98 frontend is kept next to this rewrite at `../cc98-web-upstream`.
- Use that repository only as an implementation/reference source when matching existing CC98 behavior; do not vendor it back into this repository.

## Code Style Guidelines

### Import Order

```typescript
// 1. External dependencies
import { create } from "zustand";
import { useState } from "react";

// 2. Internal dependencies (use path aliases)
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";
import type { IUser } from "@/types/api";
```

## TanStack Router (File-Based Routing)

This project uses TanStack Router with file-based routing. Routes are automatically generated from files in `src/routes/`.

### File-Based Routing Conventions

```
src/routes/
├── __root.tsx              # Root layout (Header, Footer, ErrorBoundary)
├── index.tsx               # / (home page)
├── login.tsx               # /login
├── about.tsx               # /about
├── _authenticated.tsx      # Protected route layout
├── _authenticated/
│   ├── usercenter.tsx      # /usercenter (protected)
│   └── message.tsx         # /message (protected)
└── posts/
    ├── index.tsx           # /posts
    └── $postId.tsx         # /posts/:postId (dynamic)
```

### Route File Patterns

- `__root.tsx` - Root layout (required)
- `index.tsx` - Index route for the path (`/`)
- `$param.tsx` - Dynamic route parameter (`/posts/$postId` → `/posts/123`)
- `_layout.tsx` - Pathless layout route (logical grouping without path)
- `file.tsx` - Regular route file

### Route Protection

Use `beforeLoad` hook in layout routes to protect child routes:

```typescript
// src/routes/_authenticated.tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});
```

### Navigation

```typescript
import { Link, useNavigate } from '@tanstack/react-router'

// Declarative navigation
<Link to="/posts">Posts</Link>

// Programmatic navigation
const navigate = useNavigate()
navigate({ to: '/posts', search: { page: 2 } })
```

### Route Integration with TanStack Query

```typescript
export const Route = createFileRoute("/posts")({
  loader: ({ context }) => {
    // Preload data before component renders
    return context.queryClient.ensureQueryData(postsQuery);
  },
  component: PostsPage,
});
```

### Auto-Generated Files

- `src/routeTree.gen.ts` - Auto-generated route tree (DO NOT EDIT, but COMMIT to git)
  - **Should be committed to version control** for CI/CD and type stability
  - Regenerated automatically by Vite plugin on file changes during development
  - Ignored by Vite+ format/lint checks because TanStack regenerates it

### Path Aliases (Required)

Use these instead of relative imports:

```typescript
'@/*' → './src/*'
'@components/*' → './src/components/*'
'@pages/*' → './src/pages/*'
'@routes/*' → './src/routes/*'
'@stores/*' → './src/stores/*'
'@services/*' → './src/services/*'
'@hooks/*' → './src/hooks/*'
'@lib/*' → './src/lib/*'
'@styles/*' → './src/styles/*'
'@types/*' → './src/types/*'
'@config/*' → './src/config/*'
```

## Architecture Patterns

### Directory Structure

```
src/
├── components/      # Reusable UI components (by feature)
├── pages/          # Route pages (by feature)
├── services/       # API client & service layer
├── stores/         # Zustand state stores
├── hooks/          # Custom React hooks
├── lib/            # Utilities, token manager, IndexedDB
├── types/          # TypeScript type definitions
├── config/         # Runtime constants
├── styles/         # Global styles, CSS variables
└── routes/         # TanStack Router file-based routes
```

### Component/Function Structure

```typescript
// 1. Imports
import { useState } from "react";

// 2. Type definitions
interface Props {
  title: string;
}

// 3. Component/Function
export function Component({ title }: Props) {
  // Implementation
}
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`, `useAuth.ts`)
- **Utilities**: kebab-case (`token-manager.ts`, `indexed-db.ts`)
- **Interfaces**: PascalCase with I prefix (`IUser`, `ITopic`) - API types only
- **Constants**: PascalCase (`Constants`, `ApiClient`)
- **Functions**: camelCase (`getUserInfo`, `handleSubmit`)

### TypeScript Conventions

- Always use strict mode (enabled)
- Use `type` for aliases, `interface` for object shapes
- Prefer explicit return types on exported functions
- Use JSDoc comments for public APIs:

```typescript
/**
 * 获取当前登录用户信息
 * @returns 用户信息对象
 */
async getCurrentUser(): Promise<IUser>
```

### Error Handling

```typescript
// Custom error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Try-catch with type guards
try {
  await operation();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle specific error
  } else if (error instanceof Error) {
    // Handle generic error
  }
}
```

### Service Layer Pattern

All services are singleton objects with async methods:

```typescript
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Implementation
  },

  async logout(): Promise<void> {
    // Implementation
  },
};
```

### Zustand Store Pattern

```typescript
interface State {
  // State
  user: IUser | null;
  // Actions
  setUser: (user: IUser) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: "storage-name" },
  ),
);
```

### Hook Pattern

Create wrapper hooks around stores/services:

```typescript
export function useAuth() {
  const { user, isAuthenticated } = useAuthStore();
  return { user, isAuthenticated };
}
```

## Architecture Patterns

### Directory Structure

```
src/
├── components/      # Reusable UI components (by feature)
├── pages/          # Route pages (by feature)
├── services/       # API client & service layer
├── stores/         # Zustand state stores
├── hooks/          # Custom React hooks
├── lib/            # Utilities, token manager, IndexedDB
├── types/          # TypeScript type definitions
├── config/         # Runtime constants
├── styles/         # Global styles, CSS variables
└── routes/         # TanStack Router file-based routes
```

### Barrel Exports

Every directory must have an `index.ts` for clean exports:

```typescript
// src/services/index.ts
export { apiClient } from "./client";
export * from "./auth";
export * from "./user";
```

### API Client Pattern

Use the centralized `apiClient` for all API calls - it handles:

- Auto token injection
- 401 passive token refresh
- Consistent error handling

```typescript
import { apiClient } from "@/services/client";
const data = await apiClient.get<IUser>("/user/me");
```

### API Reference

See **[API_REFERENCE.md](API_REFERENCE.md)** for complete backend API documentation including:

- All API endpoints with request/response types
- Data models (UserInfo, Topic, Post, BoardInfo, etc.)
- Authentication mechanism (OAuth 2.0 Bearer Token)
- Pagination format (`from`, `size` parameters)
- Error handling and HTTP status codes

## Testing Guidelines

### Test Structure

- Place tests alongside source: `Component.test.tsx`
- Or in `tests/unit/` directory
- Use `@testing-library/react` for component testing
- Auto-cleanup is enabled in `tests/setup.ts`

### Best Practices

- Test user behavior, not implementation details
- Use descriptive test names
- Mock external dependencies (API, SignalR)
- Keep tests focused and independent

## Visual Verification with Playwright

**IMPORTANT**: After completing UI changes, always verify the result visually using Playwright MCP:

1. Navigate to the page: `playwright_browser_navigate` to `http://localhost:5173/{route}`
2. Take a snapshot: `playwright_browser_snapshot` to capture the accessibility tree
3. Take a screenshot if needed: `playwright_browser_take_screenshot`
4. Verify elements are rendering correctly
5. Close when done: `playwright_browser_close`

This ensures UI changes work as expected before marking tasks complete.

## Important Notes

- ❌ NO jQuery (removed from codebase)
- ❌ NO class components (use functional components + hooks only)
- ❌ NO relative imports beyond sibling level (use path aliases)
- ✅ Use async/await (not promise chaining)
- ✅ Use URLSearchParams (not $.param)
- ✅ Use clsx for conditional classes
- ✅ Use `as const` for immutable objects

## Environment Variables

Required in `.env` files:

```bash
VITE_API_URL=https://qsh.api.cc98.top
VITE_OPENID_URL=https://qsh.openid.cc98.top
VITE_OAUTH_CLIENT_ID=your-client-id
VITE_OAUTH_CLIENT_SECRET=your-secret
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_SIGNALR_URL=https://qsh.api.cc98.top/hub
```
