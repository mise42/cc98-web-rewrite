import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { userService } from "@/services/user";

import type { IUser } from "@/types/api";

type Gender = 0 | 1;

export function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["user", "me", "info"],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
  });

  // 表单字段本地状态（以 userInfo 初始化）
  const [introduction, setIntroduction] = useState<string | null>(null);
  const [signatureCode, setSignatureCode] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthday, setBirthday] = useState<string | null>(null);
  const [qq, setQq] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updates: Partial<IUser> = {};

      if (introduction !== null) updates.introduction = introduction;
      if (signatureCode !== null) updates.signatureCode = signatureCode;
      if (gender !== null) updates.gender = gender;
      if (birthday !== null) updates.birthday = birthday || null;
      if (qq !== null) updates.qq = qq;

      const promises: Promise<unknown>[] = [];

      if (Object.keys(updates).length > 0) {
        promises.push(userService.updateUserInfo(updates));
      }

      if (avatarFile) {
        promises.push(userService.uploadAvatar(avatarFile));
      }

      await Promise.all(promises);
    },
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError(null);
      queryClient.invalidateQueries({ queryKey: ["user", "me", "info"] });
      setTimeout(() => navigate({ to: "/usercenter" }), 1200);
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : "保存失败，请重试");
      setSaveSuccess(false);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  if (isLoading || !userInfo) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-[700px]">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  // 显示值：本地修改过的优先，否则用 userInfo 原始值
  const displayIntro = introduction ?? userInfo.introduction ?? "";
  const displaySig = signatureCode ?? userInfo.signatureCode ?? "";
  const displayGender = gender ?? (userInfo.gender as Gender);
  const displayBirthday = birthday ?? (userInfo.birthday ? userInfo.birthday.split("T")[0] : "");
  const displayQq = qq ?? userInfo.qq ?? "";
  const displayAvatar = avatarPreview ?? userInfo.portraitUrl;

  return (
    <div className="container mx-auto px-4 py-6 max-w-[700px]">
      <div className="mb-5 flex items-center gap-3">
        <Link
          to="/usercenter"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          个人中心
        </Link>
        <h1 className="text-xl font-bold">编辑资料</h1>
      </div>

      <Card className="shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* 头像 */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold">{userInfo.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                更换头像
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">支持 JPG / PNG，建议 200×200</p>
            </div>
          </div>

          {/* 性别 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">性别</label>
            <div className="flex gap-3">
              {([1, 0] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                    displayGender === g
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {g === 1 ? "男" : "女"}
                </button>
              ))}
            </div>
          </div>

          {/* 生日 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">生日</label>
            <input
              type="date"
              value={displayBirthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* QQ */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">QQ</label>
            <input
              type="text"
              value={displayQq}
              onChange={(e) => setQq(e.target.value)}
              placeholder="请输入 QQ 号"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* 个人简介 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">个人简介</label>
            <textarea
              value={displayIntro}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="介绍一下自己..."
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary resize-y"
            />
          </div>

          {/* 签名档 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">签名档</label>
            <textarea
              value={displaySig}
              onChange={(e) => setSignatureCode(e.target.value)}
              placeholder="支持 UBB 格式的签名档..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary resize-y"
            />
          </div>

          {/* 反馈 */}
          {saveSuccess && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              ✅ 保存成功，正在跳转...
            </div>
          )}
          {saveError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {saveError}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Link to="/usercenter">
              <Button variant="outline" disabled={updateMutation.isPending}>
                取消
              </Button>
            </Link>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="gap-1.5"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "保存中..." : "保存更改"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
