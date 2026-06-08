import { test, expect } from "@playwright/test";
import { authenticateUser } from "./test-utils";

test.describe("User menu and user center", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page, "测试用户");

    await page.route("**/qsh.api.cc98.top/me/signin", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            hasSignedInToday: false,
            lastSignInCount: 3,
            lastSignInTime: "2026-02-25T10:00:00Z",
          }),
        });
        return;
      }

      if (method === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "123",
        });
        return;
      }

      await route.continue();
    });

    await page.route("**/qsh.api.cc98.top/topic/me/favorite*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
  });

  test("hover username shows only three top-level menu items", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /测试用户/i }).hover();

    await expect(page.getByText("个人中心")).toBeVisible();
    await expect(page.getByRole("link", { name: "签到" })).toBeVisible();
    await expect(page.getByRole("button", { name: "退出登录" })).toBeVisible();

    await expect(page.getByText("编辑资料")).toHaveCount(0);
    await expect(page.getByText("消息中心")).toHaveCount(0);
    await expect(page.getByText("关注的帖子")).toHaveCount(0);
  });

  test("sign-in menu item should navigate to sign-in center page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /测试用户/i }).hover();
    await page.getByRole("link", { name: "签到" }).click();

    await expect(page).toHaveURL("/usercenter/signin");
    await expect(page.getByRole("heading", { name: "签到", exact: true })).toBeVisible();
    await expect(page.getByText("连续签到")).toBeVisible();
    await expect(page.getByRole("button", { name: "立即签到" })).toBeVisible();
  });

  test("user center contains all requested entry items", async ({ page }) => {
    await page.goto("/usercenter");

    await expect(page.getByRole("button", { name: "编辑资料" })).toBeVisible();
    await expect(page.getByRole("link", { name: "修改资料" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "我的主题" })).toBeVisible();
    await expect(page.getByRole("link", { name: "我的回复" })).toBeVisible();
    await expect(page.getByRole("link", { name: "我的收藏" })).toBeVisible();
    await expect(page.getByRole("link", { name: "关注版面" })).toBeVisible();
    await expect(page.getByRole("link", { name: "关注用户" })).toBeVisible();
    await expect(page.getByRole("link", { name: "我的粉丝" })).toBeVisible();
    await expect(page.getByRole("link", { name: "转账系统" })).toBeVisible();
    await expect(page.getByRole("link", { name: "切换皮肤" })).toBeVisible();
  });
});
