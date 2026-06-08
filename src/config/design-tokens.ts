export interface SemanticColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  destructive: string;
  destructiveForeground: string;
  primaryForeground: string;
}

export const baseLightTokens: SemanticColorTokens = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: "#ffffff",
  cardForeground: "#0a0a0a",
  popover: "#ffffff",
  popoverForeground: "#0a0a0a",
  secondary: "#f3f4f6",
  secondaryForeground: "#1f2937",
  muted: "#f3f4f6",
  mutedForeground: "#6b7280",
  accent: "#f3f4f6",
  accentForeground: "#1f2937",
  border: "#e5e7eb",
  input: "#e5e7eb",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  primaryForeground: "#ffffff",
};

export const baseDarkTokens: SemanticColorTokens = {
  background: "#0b1220",
  foreground: "#e5e7eb",
  card: "#111827",
  cardForeground: "#e5e7eb",
  popover: "#111827",
  popoverForeground: "#e5e7eb",
  secondary: "#1f2937",
  secondaryForeground: "#e5e7eb",
  muted: "#1f2937",
  mutedForeground: "#9ca3af",
  accent: "#1f2937",
  accentForeground: "#f9fafb",
  border: "#374151",
  input: "#374151",
  destructive: "#f87171",
  destructiveForeground: "#111827",
  primaryForeground: "#ffffff",
};
