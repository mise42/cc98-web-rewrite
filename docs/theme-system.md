# Theme System (Token-First + Legacy Adapter)

## Goals

1. Keep a modern design-system workflow (semantic tokens).
2. Stay compatible with legacy CC98 theme ids (`user.theme`).

## Layers

- **Mode layer**: `light | dark | system`
- **Skin layer**: legacy theme preset (`themeId`)

Final runtime theme = `base semantic tokens (mode)` + `legacy skin patch (themeId)`.

## Key files

- `src/config/design-tokens.ts`
  - Defines base semantic token values for light/dark.
- `src/config/theme-presets.ts`
  - Legacy preset list (id, name, primary, headerImage).
- `src/lib/theme.ts`
  - Applies the final token values to CSS variables on `:root`.
- `src/stores/theme.ts`
  - Global theme state (`mode`, `legacyThemeId`).
- `src/hooks/useThemeSync.ts`
  - Synchronizes store state to DOM and system dark-mode changes.

## Runtime CSS vars

Core semantic vars keep component API stable:

- `--color-background`
- `--color-foreground`
- `--color-card`
- `--color-popover`
- `--color-secondary`
- `--color-muted`
- `--color-accent`
- `--color-border`
- `--color-input`
- `--color-destructive`
- `--color-primary`
- `--color-ring`

Skin-related extension vars:

- `--theme-topbar-image` (desktop: legacy header image + overlay)
- `--theme-topbar-image-mobile` (mobile: stronger overlay to reduce texture noise)

## Why this works

Components consume semantic tokens only, so:

- You can add/remove legacy themes without rewriting components.
- You can evolve tokens (e.g. high-contrast mode) independently.
- Legacy server-side `themeId` remains fully supported.
