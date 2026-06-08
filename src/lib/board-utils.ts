import { boardInfo } from "./board-info";

/**
 * 根据 boardId 获取 boardName
 * @param boardId 版面ID
 * @returns 版面名称，如果未找到返回 "未知版面"
 */
export function getBoardNameById(boardId: number): string {
  const board = boardInfo.find((item) => item.id === boardId);
  return board?.name || "未知版面";
}
