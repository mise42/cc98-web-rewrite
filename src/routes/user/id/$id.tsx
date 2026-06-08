import { createFileRoute } from "@tanstack/react-router";
import { UserDetailPage } from "@/pages/user/UserDetailPage";

export const Route = createFileRoute("/user/id/$id")({
  head: () => ({
    meta: [
      {
        title: "用户信息 - CC98 论坛",
      },
    ],
  }),
  component: UserDetailRoute,
});

function UserDetailRoute() {
  const { id } = Route.useParams();
  const userId = Number(id);

  if (!Number.isFinite(userId) || userId <= 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center text-muted-foreground">无效的用户 ID</div>
      </div>
    );
  }

  return <UserDetailPage isOwnProfile={false} userId={userId} />;
}
