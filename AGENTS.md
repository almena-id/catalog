<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# catalog

The public catalog of the Almena Network: the services issuers publish to
request verifiable credentials. Its data comes from the API's public
catalogue (`../api`, FastAPI); nobody signs in here. Everything is written in
English. Use `task` for everything (`task --list`); `task check` must pass
before finishing.

- The portal is `https://catalog.almena.id` (`NEXT_PUBLIC_CATALOG_WEB_URL`),
  the API `https://api.almena.id` (`process.env.CATALOG_API_URL`, read on the
  server only: every API call is a server component's).
- "Catalog" is this portal. Keep it apart from the registry's Catalogue (the
  field and credential type catalogue tenants build forms from), which this
  portal only reads to name things.
- `/` lists every published issuer's offers (`GET /catalog/issuers`, a type
  it grants with a request form) named from Almena's credential types
  (`GET /catalog/credentials`), in `app/lib/offers.ts`. Applying still
  happens in the registry portal (`NEXT_PUBLIC_REGISTRY_WEB_URL`,
  `/credentials/{issuer}/{type}`) until that flow moves here.
- `app/health/route.ts` is the Docker health check: keep it dependency-free.
- `output: "standalone"` in `next.config.ts` is what the Dockerfile ships.
- User-facing text is translatable: English (`en`) is the source and fallback,
  Spanish (`es`) the first translation (`app/i18n/messages/*.json`). No
  hard-coded user-facing strings. The language is the selector's choice
  (`almena.locale` cookie), else the browser's Accept-Language. Texts the API
  serves by language (`{en, es}`) are read with `label` (`app/lib/texts.ts`).
- Light/dark/system is the `almena.theme` cookie, rendered as `data-theme` on
  `<html>` by the server; Tailwind's `dark:` follows it. The language and
  theme menus are in the footer (`ChoiceMenu`).
- Blue `#2563eb` is the catalog's identity, the same in the light and the
  dark theme: `--primary` and `--ring`, `--brand-strong` `#1d4ed8` (hover),
  and the Almena mark (`Logo`, `app/icon.svg`); only its soft tints
  (`--brand-soft`, `--brand-glow`) are a little stronger in the dark theme. `app/globals.css` holds only the theme — shadcn's variables — and
  is the only place a colour is written (`app/icon.svg` aside).
- Typefaces, self-hosted with `next/font` in `app/layout.tsx`: Chakra Petch
  (`font-brand`: headings, the wordmark), Inter (`font-sans`: the
  interface), JetBrains Mono (`font-mono`: figures and codes).
- The interface is shadcn/ui (`components.json`, Radix base), copied from the
  registry with its Almena variants: components in `app/components/ui` (add
  more with `npx shadcn add <name>`, the CLI pinned in devDependencies),
  Tailwind utilities, `cn` from the `cn` package, icons from `lucide-react`.
  Form fields are shadcn's `Field` (`FieldLabel`, `FieldDescription`,
  `FieldError`, `FieldSet`), as in the registry.
- Never delete `.next` while a dev server may be running: it breaks it (500s).
