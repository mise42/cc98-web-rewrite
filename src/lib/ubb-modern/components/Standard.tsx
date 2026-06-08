import React from "react";

export const Bold: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="font-bold">{children}</span>
);

export const Italic: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="italic">{children}</span>
);

export const Underline: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="underline">{children}</span>
);

export const Delete: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="line-through">{children}</span>
);

export const Url: React.FC<{ children?: React.ReactNode; href?: string }> = ({
  children,
  href,
}) => {
  const finalHref = href || (typeof children === "string" ? children : undefined);

  return (
    <a
      href={finalHref}
      className="text-primary hover:underline underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export const Color: React.FC<{ children?: React.ReactNode; color?: string }> = ({
  children,
  color,
}) => <span style={{ color }}>{children}</span>;

export const Size: React.FC<{ children?: React.ReactNode; size?: string | number }> = ({
  children,
  size,
}) => {
  let fontSize = "inherit";
  if (size) {
    const s = Number(size);
    if (!isNaN(s) && s > 0 && s <= 7) {
      const sizes = ["10px", "13px", "16px", "18px", "24px", "32px", "48px"];
      fontSize = sizes[s - 1] || "inherit";
    } else {
      fontSize = String(size);
      if (!isNaN(Number(size))) fontSize += "px";
    }
  }
  return <span style={{ fontSize }}>{children}</span>;
};

export const Align: React.FC<{ children?: React.ReactNode; align?: string }> = ({
  children,
  align,
}) => <div style={{ textAlign: align as React.CSSProperties["textAlign"] }}>{children}</div>;
