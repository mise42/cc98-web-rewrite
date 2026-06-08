import { createFileRoute } from "@tanstack/react-router";
import { BoardListPage } from "@/pages/board/BoardListPage";

export const Route = createFileRoute("/boardlist")({
  head: () => ({
    meta: [
      {
        title: "版面列表 - CC98 论坛",
      },
    ],
  }),
  component: BoardListPage,
});
