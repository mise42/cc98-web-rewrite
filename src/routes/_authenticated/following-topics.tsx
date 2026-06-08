import { createFileRoute } from "@tanstack/react-router";
import { FollowingTopicsPage } from "@/pages/topics/FollowingTopicsPage";

export const Route = createFileRoute("/_authenticated/following-topics")({
  component: FollowingTopicsPage,
});
