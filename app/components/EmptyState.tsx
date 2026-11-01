import type { ReactNode } from "react";

/** A page or a list with nothing to show: its picture, what it means and what to do. */
export function EmptyState({
  art,
  title,
  children,
  action,
  role,
}: {
  art: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role}
      className="grid justify-items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center"
    >
      <div className="w-full max-w-[220px]">{art}</div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children && (
        <p className="max-w-md text-sm text-muted-foreground">{children}</p>
      )}
      {action}
    </div>
  );
}
