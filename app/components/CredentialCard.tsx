import { cn } from "cn";
import type { ReactNode } from "react";

import { CategoryIcon } from "@/app/lib/category-icons";
import { Logo } from "./Logo";

/** The thin concentric arcs of a printed card, offset to its top-right corner. */
function Guilloche() {
  const rings = Array.from({ length: 10 }, (_, index) => 34 + index * 22);
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full text-primary-foreground opacity-[0.12]"
      viewBox="0 0 317 200"
      preserveAspectRatio="xMaxYMin slice"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {rings.map((radius) => (
          <circle key={radius} cx="300" cy="-6" r={radius} />
        ))}
        {rings.slice(0, 6).map((radius) => (
          <ellipse
            key={`e${radius}`}
            cx="300"
            cy="-6"
            rx={radius * 1.9}
            ry={radius * 0.9}
          />
        ))}
      </g>
    </svg>
  );
}

/** The contact chip printed under the icon. */
function Chip({ small }: { small?: boolean }) {
  return (
    <svg
      className="text-primary-foreground opacity-25"
      width={small ? 28 : 34}
      height={small ? 21 : 26}
      viewBox="0 0 34 26"
      aria-hidden
    >
      <rect
        x="0.75"
        y="0.75"
        width="32.5"
        height="24.5"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <g stroke="currentColor" strokeWidth="1.2">
        <line x1="0.75" y1="9" x2="12" y2="9" />
        <line x1="22" y1="9" x2="33.25" y2="9" />
        <line x1="0.75" y1="17" x2="12" y2="17" />
        <line x1="22" y1="17" x2="33.25" y2="17" />
        <line x1="12" y1="0.75" x2="12" y2="25.25" />
        <line x1="22" y1="0.75" x2="22" y2="25.25" />
      </g>
    </svg>
  );
}

/**
 * A credential drawn as a physical card (ID-1 proportions): the identity's
 * gradient with guilloché arcs and the Almena mark as a watermark, its
 * category's icon and name at the top, the type and its issuer at the bottom.
 * `children` sit at the bottom right (a status chip).
 */
export function CredentialCard({
  typeName,
  issuerName,
  category,
  size = "full",
  className,
  children,
}: {
  typeName: string;
  issuerName: string;
  /** The category's name and its icon's lucide name. */
  category: { label: string; icon: string | null | undefined };
  size?: "full" | "compact";
  className?: string;
  children?: ReactNode;
}) {
  const compact = size === "compact";
  return (
    <div
      className={cn(
        "relative isolate aspect-[1.586/1] w-full overflow-hidden bg-[linear-gradient(135deg,var(--primary),var(--brand-strong))] text-primary-foreground shadow-card",
        compact ? "rounded-[14px] p-[18px]" : "rounded-[16px] p-5",
        className,
      )}
    >
      <Guilloche />
      <Logo
        size={compact ? 120 : 168}
        className={cn(
          "pointer-events-none absolute text-primary-foreground opacity-10",
          compact ? "-right-5 -bottom-6" : "-right-6 -bottom-8",
        )}
      />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-2.5">
            <span className="grid size-9 place-items-center rounded-[10px] bg-primary-foreground/15 backdrop-blur-sm">
              <CategoryIcon icon={category.icon} className="size-5" aria-hidden />
            </span>
            <Chip small={compact} />
          </div>
          <span className="pt-1 text-right text-[11px] font-medium tracking-[0.08em] uppercase opacity-80">
            {category.label}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="grid min-w-0 gap-0.5">
            <span
              className={cn(
                "line-clamp-2 font-brand leading-tight font-semibold",
                compact ? "text-base" : "text-[20px]",
              )}
            >
              {typeName}
            </span>
            <span className="truncate text-[13px] opacity-85">{issuerName}</span>
          </div>
          {children && <div className="flex-none">{children}</div>}
        </div>
      </div>
    </div>
  );
}
