import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "32px" }}>
      <div>
        <h1 style={{ fontSize: "26px", fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: "13px", color: "#555", margin: "5px 0 0", lineHeight: 1.5 }}>{description}</p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
