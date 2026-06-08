import { test, expect } from "@playwright/test";
import { authenticateUser } from "./test-utils";

test.describe("Topic Detail Page", () => {
  // Mock API responses
  const mockTopic = {
    id: 6399262,
    title: "测试主题",
    content: "这是一个测试主题",
    time: "2025-01-10T10:00:00",
    userName: "楼主",
    userId: 1,
    state: 0,
    boardId: 7,
    replyCount: 25,
    hitCount: 1000,
    floorCount: 25,
    isAnonymous: false,
    isLZ: false,
    bestState: 0,
    topState: 0,
  };

  const mockBoard = {
    id: 7,
    name: "技术交流",
    description: "技术交流板块",
    parentId: 0,
    topicCount: 1000,
    postCount: 10000,
    todayCount: 50,
    boardMasters: ["admin"],
  };

  const mockPosts = [
    {
      id: 1,
      content: "这是第一楼的回复",
      contentType: 0,
      floor: 1,
      time: "2025-01-10T10:05:00",
      userName: "用户A",
      userId: 100,
      isLZ: false,
      likeCount: 5,
      dislikeCount: 1,
      isAnonymous: false,
      isDeleted: false,
      topicId: 6399262,
      boardId: 7,
    },
    {
      id: 2,
      content: "这是第二楼的回复",
      contentType: 0,
      floor: 15,
      time: "2025-01-10T10:10:00",
      userName: "用户B",
      userId: 101,
      isLZ: false,
      likeCount: 3,
      dislikeCount: 0,
      isAnonymous: false,
      isDeleted: false,
      topicId: 6399262,
      boardId: 7,
    },
    {
      id: 3,
      content: "这是第三楼的回复",
      contentType: 0,
      floor: 23,
      time: "2025-01-10T10:15:00",
      userName: "用户C",
      userId: 102,
      isLZ: false,
      likeCount: 10,
      dislikeCount: 2,
      isAnonymous: false,
      isDeleted: false,
      topicId: 6399262,
      boardId: 7,
    },
  ];

  const mockUserPosts = [
    {
      id: 2,
      content: "这是用户B的回复",
      contentType: 0,
      floor: 15,
      time: "2025-01-10T10:10:00",
      userName: "用户B",
      userId: 101,
      isLZ: false,
      likeCount: 3,
      dislikeCount: 0,
      isAnonymous: false,
      isDeleted: false,
      topicId: 6399262,
      boardId: 7,
    },
    {
      id: 4,
      content: "用户B的另一条回复",
      contentType: 0,
      floor: 18,
      time: "2025-01-10T10:20:00",
      userName: "用户B",
      userId: 101,
      isLZ: false,
      likeCount: 7,
      dislikeCount: 0,
      isAnonymous: false,
      isDeleted: false,
      topicId: 6399262,
      boardId: 7,
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Setup login
    await authenticateUser(page);

    // Mock topic API
    await page.route("**/qsh.api.cc98.top/topic/6399262", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockTopic),
      });
    });

    // Mock board API
    await page.route("**/qsh.api.cc98.top/board/7", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBoard),
      });
    });

    // Mock posts API
    await page.route("**/qsh.api.cc98.top/topic/6399262/post*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockPosts),
      });
    });

    // Mock user trace API
    await page.route("**/qsh.api.cc98.top/post/topic/specific-user*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUserPosts),
      });
    });

    // Mock like/dislike API
    await page.route("**/qsh.api.cc98.top/post/*/like", async (route) => {
      const method = route.request().method();
      if (method === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ likeCount: 6, dislikeCount: 1, likeState: 1 }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ likeCount: 5, dislikeCount: 1, likeState: 0 }),
        });
      }
    });
  });

  test("should load topic detail page with posts", async ({ page }) => {
    await page.goto("/topic/6399262");

    // Wait for posts to load
    await page.waitForSelector("#post-1");

    // Check topic title
    await expect(page.getByText("测试主题")).toBeVisible();

    // Check posts are displayed
    const posts = page.locator('[id^="post-"]');
    await expect(posts).toHaveCount(3);

    // Check first post content
    await expect(page.getByText("这是第一楼的回复")).toBeVisible();

    // Check floor numbers
    await expect(page.getByText("#1楼")).toBeVisible();
    await expect(page.getByText("#15楼")).toBeVisible();
    await expect(page.getByText("#23楼")).toBeVisible();
  });

  test("should display correct floor numbers from API", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    // Floor numbers should match API response, not sequential
    await expect(page.getByText("#1楼")).toBeVisible();
    await expect(page.getByText("#15楼")).toBeVisible();
    await expect(page.getByText("#23楼")).toBeVisible();

    // Should NOT see #2楼 or #3楼 (sequential indices)
    await expect(page.getByText("#2楼")).not.toBeVisible();
    await expect(page.getByText("#3楼")).not.toBeVisible();
  });

  test("should toggle between pagination and infinite scroll modes", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    const viewMode = page.getByRole("combobox");

    await expect(viewMode).toContainText("分页浏览");

    await viewMode.click();
    await page.getByRole("option", { name: /无限滚动/ }).click();
    await expect(viewMode).toContainText("无限滚动");

    await viewMode.click();
    await page.getByRole("option", { name: /分页浏览/ }).click();
    await expect(viewMode).toContainText("分页浏览");
  });

  test("should enter and exit trace mode", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    // Find a post with trace button (non-anonymous user)
    const postWithTraceButton = page.locator("#post-2");
    const traceButton = postWithTraceButton.getByRole("button", { name: "追踪" });

    await expect(traceButton).toBeVisible();

    // Click trace button
    await traceButton.click();

    // Should show trace mode banner
    await expect(page.getByText("🔍 追踪中：")).toBeVisible();
    await expect(page.getByText("只显示该用户的回复")).toBeVisible();

    // Should show exit trace button
    const exitButton = page.getByRole("button", { name: "退出追踪" });
    await expect(exitButton).toBeVisible();

    // Pagination should be hidden in trace mode
    await expect(page.locator("text=上一页")).not.toBeVisible();

    // Click exit trace
    await exitButton.click();

    // Trace banner should be gone
    await expect(page.getByText("🔍 追踪中：")).not.toBeVisible();
  });

  test("should not show trace button for anonymous users", async ({ page }) => {
    // Add an anonymous post
    await page.route("**/qsh.api.cc98.top/topic/6399262/post*", async (route) => {
      const anonymousPosts = [
        {
          id: 10,
          content: "匿名回复",
          contentType: 0,
          floor: 5,
          time: "2025-01-10T10:12:00",
          userName: "匿名用户",
          userId: 0,
          isLZ: false,
          likeCount: 0,
          dislikeCount: 0,
          isAnonymous: true,
          isDeleted: false,
          topicId: 6399262,
          boardId: 7,
        },
      ];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(anonymousPosts),
      });
    });

    await page.goto("/topic/6399262");
    await page.waitForSelector("#post-10");

    // Find anonymous post
    const anonymousPost = page.locator("#post-10");
    const traceButton = anonymousPost.getByRole("button", { name: "追踪" });

    // Trace button should not be visible
    await expect(traceButton).not.toBeVisible();
  });

  test("should display like and dislike buttons with counts", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    // Check first post
    const firstPost = page.locator("#post-1");

    // Like button with count
    const likeButton = firstPost.getByRole("button", { name: "5" });
    await expect(likeButton).toBeVisible();

    // Dislike button with count
    const dislikeButton = firstPost.getByRole("button", { name: "1" });
    await expect(dislikeButton).toBeVisible();
  });

  test("should handle like button click", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    const firstPost = page.locator("#post-1");
    const likeButton = firstPost.getByRole("button", { name: "5" });

    // Click like button
    await likeButton.click();

    // Wait for API call
    await page.waitForTimeout(500);

    // Button should be disabled during loading
    // (Implementation may vary, adjust as needed)
  });

  test("should display quote and trace buttons", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    const firstPost = page.locator("#post-1");

    // Quote button
    const quoteButton = firstPost.getByRole("button", { name: /引用/ });
    await expect(quoteButton).toBeVisible();

    // Trace button (for non-anonymous user)
    const traceButton = firstPost.getByRole("button", { name: "追踪" });
    await expect(traceButton).toBeVisible();
  });

  test("should handle quote button click", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    const firstPost = page.locator("#post-1");
    const quoteButton = firstPost.getByRole("button", { name: /引用/ });

    // Click quote button
    await quoteButton.click();

    // Currently logs to console
    // TODO: Update test when quote functionality is fully implemented
  });

  test("should show board link with back button", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    // Check board link
    const boardLink = page.getByRole("link", { name: "返回 技术交流" });
    await expect(boardLink).toBeVisible();

    // Click back to board
    await boardLink.click();
    await expect(page).toHaveURL(/\/board\/7/);
  });

  test("should display topic metadata", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    // Check topic info
    await expect(page.getByText("楼主")).toBeVisible();
    await expect(page.getByText("2025-01-10 10:00")).toBeVisible();
    await expect(page.getByText("1000", { exact: true })).toBeVisible(); // hitCount
    await expect(page.getByText("25", { exact: true })).toBeVisible(); // replyCount
  });

  test("should handle loading state", async ({ page }) => {
    // Slow down the API response
    await page.route("**/qsh.api.cc98.top/topic/6399262", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockTopic),
      });
    });

    await page.goto("/topic/6399262");

    // Should show skeleton initially
    // (Add specific skeleton selectors if needed)
  });

  test("should show empty state when no posts in trace mode", async ({ page }) => {
    // Mock empty user posts
    await page.route("**/qsh.api.cc98.top/post/topic/specific-user*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    // Click trace button
    const traceButton = page.getByRole("button", { name: "追踪" }).first();
    await traceButton.click();

    // Should show empty state message
    await expect(page.getByText("该用户在此帖子中暂无回复")).toBeVisible();
  });

  test("should hide pagination in trace mode", async ({ page }) => {
    await page.goto("/topic/6399262");

    await page.waitForSelector("#post-1");

    // Enter trace mode
    const traceButton = page.getByRole("button", { name: "追踪" }).first();
    await traceButton.click();

    // Pagination controls should be hidden
    await expect(page.locator("text=上一页")).not.toBeVisible();
    await expect(page.locator("text=下一页")).not.toBeVisible();
    await expect(page.locator("text=/第.*页/")).not.toBeVisible();
  });
});
