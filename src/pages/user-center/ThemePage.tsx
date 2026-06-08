import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import { LegacyThemePresets, type ThemeMode } from "@/config/theme-presets";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { userService } from "@/services/user";

function modeLabel(mode: ThemeMode): string {
  if (mode === "light") return "浅色";
  if (mode === "dark") return "深色";
  return "跟随系统";
}

export function ThemePage() {
  const { mode, legacyThemeId, setMode, setLegacyThemeId } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const handleModeSwitch = (nextMode: ThemeMode) => {
    setMode(nextMode);
    toast.success(`已切换为${modeLabel(nextMode)}模式`);
  };

  const handleLegacyThemeSwitch = async (themeId: number) => {
    setLegacyThemeId(themeId);

    if (user) {
      try {
        await userService.updateTheme(themeId);
        setUser({ ...user, theme: themeId });
      } catch {
        toast.error("皮肤保存到服务器失败，已仅在本地生效");
      }
    }

    const selected = LegacyThemePresets.find((item) => item.id === themeId);
    toast.success(`已切换为「${selected?.name ?? "系统默认"}」`);
  };

  return (
    <Card className="shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          切换皮肤
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">界面模式：{modeLabel(mode)}</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={mode === "light" ? "default" : "outline"}
              onClick={() => handleModeSwitch("light")}
            >
              浅色
            </Button>
            <Button
              variant={mode === "dark" ? "default" : "outline"}
              onClick={() => handleModeSwitch("dark")}
            >
              深色
            </Button>
            <Button
              variant={mode === "system" ? "default" : "outline"}
              onClick={() => handleModeSwitch("system")}
            >
              跟随系统
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">旧版主题色（兼容）</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {LegacyThemePresets.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleLegacyThemeSwitch(theme.id)}
                className={`rounded-md border px-3 py-2 text-left transition-all ${
                  legacyThemeId === theme.id
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="text-sm truncate">{theme.name}</span>
                </div>
                {theme.headerImage && (
                  <div
                    className="mt-2 h-8 w-full rounded-sm border border-border/60"
                    style={{
                      backgroundImage: `url(${theme.headerImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
