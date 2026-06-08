import React, { type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/Header";
import { UserCenterPage } from "@/pages/user/UserCenterPage";
import { useAuth } from "@/hooks/useAuth";
import { useMessageStore } from "@/stores/message";
import tokenManager from "@/lib/token-manager";
import { userService } from "@/services/user";
import type { IUser } from "@/types/api";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/stores/message", () => ({
  useMessageStore: vi.fn(),
}));

vi.mock("@/lib/token-manager", () => ({
  default: {
    hasSession: vi.fn(),
  },
}));

vi.mock("@/services/user", () => ({
  userService: {
    getCurrentUser: vi.fn(),
    getSignInStatus: vi.fn(),
    signIn: vi.fn(),
  },
}));

const mockUser: IUser = {
  id: 1,
  name: "测试用户",
  gender: 1,
  birthday: null,
  photourl: "",
  introduction: "",
  signatureCode: "",
  isFollowing: false,
  emailAddress: "test@example.com",
  qq: "",
  postCount: 1,
  prestige: 1,
  displayTitle: "",
  privilege: "",
  registerTime: "2024-01-01T00:00:00Z",
  lastLogOnTime: "2024-01-01T00:00:00Z",
  customTitle: "",
  lockState: 0,
  popularity: 1,
  userTitleIds: [],
  displayTitleId: 0,
  fanCount: 10,
  wealth: 100,
  portraitUrl: "",
  customBoards: [],
  followCount: 5,
  theme: 0,
  levelTitle: "",
  boardMasterTitles: [],
  deleteCount: 0,
};

function mockAuthenticatedUser() {
  vi.mocked(useAuth).mockReturnValue({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    loginWithOAuth: vi.fn(),
    logout: vi.fn(),
  });
}

function mockEmptyMessageStore() {
  vi.mocked(useMessageStore).mockReturnValue({
    unreadCount: 0,
    unreadSummary: {
      replyCount: 0,
      atCount: 0,
      systemCount: 0,
      messageCount: 0,
    },
    messages: [],
    setUnreadCount: vi.fn(),
    setUnreadSummary: vi.fn(),
    addMessage: vi.fn(),
    markAsRead: vi.fn(),
    clearMessages: vi.fn(),
  });
}

function renderWithQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("用户菜单与个人中心", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("用户名 hover 后一级菜单只展示 个人中心/签到/退出登录", async () => {
    mockAuthenticatedUser();
    mockEmptyMessageStore();

    vi.mocked(tokenManager.hasSession).mockReturnValue(true);
    vi.mocked(userService.getSignInStatus).mockResolvedValue({
      hasSignedInToday: false,
      lastSignInCount: 1,
      lastSignInTime: "2024-01-01T00:00:00Z",
    });

    render(<Header />);

    const userButton = screen.getByRole("button", { name: /测试用户/i });
    fireEvent.mouseEnter(userButton);

    expect(await screen.findByText("个人中心")).toBeInTheDocument();
    expect(screen.getByText("签到")).toBeInTheDocument();
    expect(screen.getByText("退出登录")).toBeInTheDocument();

    // 不应出现其他一级菜单项
    expect(screen.queryByText("编辑资料")).not.toBeInTheDocument();
    expect(screen.queryByText("消息中心")).not.toBeInTheDocument();
    expect(screen.queryByText("关注的帖子")).not.toBeInTheDocument();
  });

  it("菜单签到项跳转到签到页面", async () => {
    mockAuthenticatedUser();
    mockEmptyMessageStore();

    vi.mocked(tokenManager.hasSession).mockReturnValue(true);
    vi.mocked(userService.getSignInStatus).mockResolvedValue({
      hasSignedInToday: false,
      lastSignInCount: 1,
      lastSignInTime: "2024-01-01T00:00:00Z",
    });

    render(<Header />);

    const userButton = screen.getByRole("button", { name: /测试用户/i });
    fireEvent.mouseEnter(userButton);

    const signInLink = await screen.findByRole("link", { name: "签到" });
    expect(signInLink).toHaveAttribute("href", "/usercenter/signin");
  });

  it("个人中心快捷入口为 8 项，编辑资料仅保留左侧按钮", async () => {
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    vi.mocked(userService.getSignInStatus).mockResolvedValue({
      hasSignedInToday: false,
      lastSignInCount: 1,
      lastSignInTime: "2024-01-01T00:00:00Z",
    });

    renderWithQuery(<UserCenterPage />);

    expect(await screen.findByText("编辑资料")).toBeInTheDocument();
    expect(screen.queryByText("修改资料")).not.toBeInTheDocument();
    expect(screen.getAllByText("我的主题").length).toBeGreaterThan(0);
    expect(screen.getByText("我的回复")).toBeInTheDocument();
    expect(screen.getByText("我的收藏")).toBeInTheDocument();
    expect(screen.getByText("关注版面")).toBeInTheDocument();
    expect(screen.getByText("关注用户")).toBeInTheDocument();
    expect(screen.getByText("我的粉丝")).toBeInTheDocument();
    expect(screen.getByText("转账系统")).toBeInTheDocument();
    expect(screen.getByText("切换皮肤")).toBeInTheDocument();
  });
});
