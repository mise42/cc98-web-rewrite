import React from "react";

interface UserLinkProps {
  children?: React.ReactNode;
  userId?: string;
}

export const UserLink: React.FC<UserLinkProps> = ({ children }) => {
  return (
    <span className="font-medium text-primary hover:underline cursor-pointer">@{children}</span>
  );
};
