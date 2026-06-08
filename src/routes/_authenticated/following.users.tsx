import { createFileRoute } from "@tanstack/react-router";
import { FollowingTopicsPageContent } from "@/pages/topics/FollowingTopicsPage";

export const Route = createFileRoute("/_authenticated/following/users")({
  component: () => <FollowingTopicsPageContent compact />,
});
