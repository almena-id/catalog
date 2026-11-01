"use client";

import { LayoutGridIcon, LoaderCircleIcon, SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/app/components/ui/input";
import { useI18n } from "@/app/i18n/client";
import { CategoryIcon } from "@/app/lib/category-icons";
import { label, type Labels } from "@/app/lib/texts";
import { cn } from "cn";

/** The URL the filters make: `/?q=…&category=…`, empty ones left out. */
export function catalogHref(q: string, category: string | undefined): string {
  const query = new URLSearchParams();
  if (q.trim()) query.set("q", q.trim());
  if (category) query.set("category", category);
  const text = query.toString();
  return text ? `/?${text}` : "/";
}

/** The words typed, as the URL keeps them, a moment after the last key. */
const DEBOUNCE_MS = 300;

/** The search box over the catalog, in the hero. */
export function CatalogSearch({
  q,
  category,
}: {
  q: string;
  category: string | undefined;
}) {
  const { t } = useI18n();
  const copy = t.home;
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(q);
  const [shown, setShown] = useState(q);
  // The words last sent to the URL: its answer must not undo what was typed since.
  const [sent, setSent] = useState(q);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The URL changed elsewhere (back, a chip, "clear"): show its words.
  if (q !== shown) {
    setShown(q);
    if (q !== sent) {
      setSent(q);
      setValue(q);
    }
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const go = (words: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSent(words.trim());
      startTransition(() => {
        router.replace(catalogHref(words, category), { scroll: false });
      });
    }, DEBOUNCE_MS);
  };

  return (
    <form
      role="search"
      action={pathname}
      onSubmit={(event) => {
        event.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        setSent(value.trim());
        startTransition(() => {
          router.replace(catalogHref(value, category), { scroll: false });
        });
      }}
      className="relative w-full max-w-xl"
    >
      {category && <input type="hidden" name="category" value={category} />}
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        name="q"
        value={value}
        maxLength={100}
        autoComplete="off"
        aria-label={copy.searchLabel}
        placeholder={copy.searchPlaceholder}
        onChange={(event) => {
          setValue(event.target.value);
          go(event.target.value);
        }}
        className="h-12 rounded-xl bg-card pr-11 pl-10 text-base shadow-card md:text-base dark:bg-card [&::-webkit-search-cancel-button]:hidden"
      />
      <span className="absolute top-1/2 right-2 -translate-y-1/2">
        {pending ? (
          <LoaderCircleIcon
            className="m-2 size-4 animate-spin text-muted-foreground"
            aria-label={copy.searching}
          />
        ) : (
          value && (
            <button
              type="button"
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={copy.clearSearch}
              onClick={() => {
                setValue("");
                go("");
              }}
            >
              <XIcon className="size-4" />
            </button>
          )
        )}
      </span>
    </form>
  );
}

/** The categories with offers, each with its icon and how many, plus "All". */
export function CategoryChips({
  q,
  category,
  categories,
}: {
  q: string;
  category: string | undefined;
  categories: { id: string; labels: Labels; icon: string; offers: number }[];
}) {
  const { t, locale } = useI18n();
  const copy = t.home;
  const all = categories.reduce((sum, item) => sum + item.offers, 0);
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
      active
        ? "border-transparent bg-primary text-primary-foreground"
        : "bg-card text-foreground hover:border-primary/40 hover:bg-brand-soft",
    );
  const count = (active: boolean) =>
    cn(
      "font-mono text-[12px]",
      active ? "text-primary-foreground/80" : "text-muted-foreground",
    );
  return (
    <nav aria-label={copy.categoriesLabel}>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href={catalogHref(q, undefined)}
            scroll={false}
            replace
            className={chip(!category)}
            aria-current={!category ? "page" : undefined}
          >
            <LayoutGridIcon className="size-4" aria-hidden />
            {copy.allCategories}
            <span className={count(!category)}>{all}</span>
          </Link>
        </li>
        {categories.map((item) => {
          const active = item.id === category;
          return (
            <li key={item.id}>
              <Link
                href={catalogHref(q, active ? undefined : item.id)}
                scroll={false}
                replace
                className={chip(active)}
                aria-current={active ? "page" : undefined}
              >
                <CategoryIcon icon={item.icon} className="size-4" aria-hidden />
                {label(item.labels, locale)}
                <span className={count(active)}>{item.offers}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
