import { clsx } from "clsx";

interface ListProps {
  children: React.ReactNode;
  ordered?: boolean;
}

export function List({ children, ordered = false }: ListProps) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={clsx("my-4 pl-8", ordered ? "list-decimal" : "list-disc")}>{children}</Tag>
  );
}

interface ListItemProps {
  children: React.ReactNode;
}

export function ListItem({ children }: ListItemProps) {
  return <li className="my-1">{children}</li>;
}
