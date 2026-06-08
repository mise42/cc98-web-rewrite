import { createFileRoute } from "@tanstack/react-router";
import { CreateTopicPage } from "@/pages/board/CreateTopicPage";
import { z } from "zod";

const newTopicSearchSchema = z.object({
  boardId: z.union([z.string(), z.number()]).transform((v) => String(v)),
});

export const Route = createFileRoute("/_authenticated/new-topic")({
  validateSearch: newTopicSearchSchema,
  component: NewTopicRoute,
});

function NewTopicRoute() {
  const { boardId } = Route.useSearch();
  return <CreateTopicPage boardId={boardId} />;
}
