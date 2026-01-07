# AGENTS.md - CC98 Forum Rewrite

This guide is for AI coding agents working on the CC98 Forum Rewrite project.

## Quick Reference

```bash
# Development
bun run dev              # Start dev server (http://localhost:5173)
bun run build            # TypeScript compile + Vite build
bun run preview          # Preview production build

# Testing
bun run test             # Run all unit tests
bun run test:ui          # Run Vitest with UI
bun run test:e2e         # Run all E2E tests

# Code Quality
bun run lint             # ESLint check (max 0 warnings)
bun run lint:fix         # ESLint auto-fix
bun run format           # Prettier format
bun run format:check     # Prettier check
```

## Running Single Tests

### Unit Tests (Vitest)

```bash
# Run specific test file
bun run test path/to/test.test.ts

# Watch mode with filter
bun run test -- --grep "test name pattern"

# Interactive UI mode
bun run test:ui
```

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
- **Build**: Vite 7.2.4 + SWC
- **Router**: React Router v7
- **State**: Zustand 5.0.9 (client state), TanStack Query 5.90.16 (server state)
- **UI**: Ant Design v6.1.4
- **Real-time**: SignalR 10.0.0
- **Testing**: Vitest 4.0.16 (unit), Playwright 1.57.0 (E2E)
- **Package Manager**: Bun

## Code Style Guidelines

### Import Order

```typescript
// 1. External dependencies
import { create } from 'zustand'
import { useState } from 'react'

// 2. Internal dependencies (use path aliases)
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import type { IUser } from '@/types/api'
```

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

### Component/Function Structure

```typescript
// 1. Imports
import { useState } from 'react'

// 2. Type definitions
interface Props {
  title: string
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
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Try-catch with type guards
try {
  await operation()
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
}
```

### Zustand Store Pattern

```typescript
interface State {
  // State
  user: IUser | null
  // Actions
  setUser: (user: IUser) => void
}

export const useStore = create<State>()(
  persist(
    set => ({
      user: null,
      setUser: user => set({ user }),
    }),
    { name: 'storage-name' }
  )
)
```

### Hook Pattern

Create wrapper hooks around stores/services:

```typescript
export function useAuth() {
  const { user, isAuthenticated } = useAuthStore()
  return { user, isAuthenticated }
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
└── routes/         # React Router v7 config
```

### Barrel Exports

Every directory must have an `index.ts` for clean exports:

```typescript
// src/services/index.ts
export { apiClient } from './client'
export * from './auth'
export * from './user'
```

### API Client Pattern

Use the centralized `apiClient` for all API calls - it handles:

- Auto token injection
- 401 passive token refresh
- Consistent error handling

```typescript
import { apiClient } from '@/services/client'
const data = await apiClient.get<IUser>('/user/me')
```

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

## Formatting Rules

Prettier configuration (auto-applied on commit):

- No semicolons
- Single quotes
- 2 spaces indentation
- 100 char line width
- Trailing commas (ES5)
- LF line endings

## Pre-commit Requirements

Husky runs `lint-staged` on every commit:

- All `.ts`/`.tsx` files must pass ESLint (max 0 warnings)
- All `.ts`/`.tsx`/`.css` files must be Prettier-formatted
- Fix issues with: `bun run lint:fix && bun run format`

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
