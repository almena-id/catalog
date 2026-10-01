import Link from "next/link";

import type { Dictionary } from "@/app/i18n/config";
import { Logo } from "./Logo";

/** The bar across the top. */
export function SiteHeader({ t }: { t: Dictionary }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
      <div className="page-frame flex items-center gap-4 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-[17px] tracking-tight whitespace-nowrap"
          aria-label={t.app.name}
        >
          <Logo size={28} />
          <span>
            Almena <strong className="font-semibold">Catalog</strong>
          </span>
        </Link>
      </div>
    </header>
  );
}
