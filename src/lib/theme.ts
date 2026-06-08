import { baseDarkTokens, baseLightTokens } from "@/config/design-tokens";
import { getLegacyThemePreset, type ThemeMode } from "@/config/theme-presets";

function resolveDarkMode(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const safeHex = hex.replace("#", "");
  const normalized =
    safeHex.length === 3
      ? safeHex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : safeHex;

  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function createTopbarBackground(
  primary: string,
  headerImage: string | undefined,
  isDark: boolean,
  density: "desktop" | "mobile",
): string {
  const { r, g, b } = hexToRgb(primary);
  const alphaConfig =
    density === "mobile"
      ? {
          start: isDark ? 0.82 : 0.52,
          end: isDark ? 0.94 : 0.72,
        }
      : {
          start: isDark ? 0.6 : 0.24,
          end: isDark ? 0.82 : 0.5,
        };

  const overlay = `linear-gradient(120deg, rgba(${r}, ${g}, ${b}, ${alphaConfig.start}), rgba(${r}, ${g}, ${b}, ${alphaConfig.end}))`;

  if (!headerImage) {
    return overlay;
  }

  return `${overlay}, url('${headerImage}')`;
}

export function applyTheme(mode: ThemeMode, legacyThemeId: number): void {
  const root = document.documentElement;
  const isDark = resolveDarkMode(mode);
  const preset = getLegacyThemePreset(legacyThemeId);
  const baseTokens = isDark ? baseDarkTokens : baseLightTokens;

  root.classList.toggle("dark", isDark);
  root.dataset.themeMode = mode;
  root.dataset.legacyThemeId = String(preset.id);

  root.style.setProperty("--color-background", baseTokens.background);
  root.style.setProperty("--color-foreground", baseTokens.foreground);
  root.style.setProperty("--color-card", baseTokens.card);
  root.style.setProperty("--color-card-foreground", baseTokens.cardForeground);
  root.style.setProperty("--color-popover", baseTokens.popover);
  root.style.setProperty("--color-popover-foreground", baseTokens.popoverForeground);
  root.style.setProperty("--color-secondary", baseTokens.secondary);
  root.style.setProperty("--color-secondary-foreground", baseTokens.secondaryForeground);
  root.style.setProperty("--color-muted", baseTokens.muted);
  root.style.setProperty("--color-muted-foreground", baseTokens.mutedForeground);
  root.style.setProperty("--color-accent", baseTokens.accent);
  root.style.setProperty("--color-accent-foreground", baseTokens.accentForeground);
  root.style.setProperty("--color-border", baseTokens.border);
  root.style.setProperty("--color-input", baseTokens.input);
  root.style.setProperty("--color-destructive", baseTokens.destructive);
  root.style.setProperty("--color-destructive-foreground", baseTokens.destructiveForeground);

  // Legacy skin patch: 将旧版主题号映射为品牌主色。
  root.style.setProperty("--color-primary", preset.primary);
  root.style.setProperty("--color-primary-foreground", baseTokens.primaryForeground);
  root.style.setProperty("--color-ring", preset.primary);
  root.style.setProperty(
    "--theme-topbar-image",
    createTopbarBackground(preset.primary, preset.headerImage, isDark, "desktop"),
  );
  root.style.setProperty(
    "--theme-topbar-image-mobile",
    createTopbarBackground(preset.primary, preset.headerImage, isDark, "mobile"),
  );
}
