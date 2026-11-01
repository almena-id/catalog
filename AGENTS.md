<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# catalog

The public catalog of Almena ID: the services issuers publish to
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
- `/` lists every published issuer's offers (`GET /catalog/offers`, a type
  it grants with a request form, already named and categorised by the API),
  a page at a time (`app/lib/offers.ts`, `app/lib/offer-actions.ts`,
  `app/OfferGrid.tsx`), each opening its page: by a visible "Load more"
  button, and as it is scrolled — but not while the focus is on an offer, so
  the keyboard reaches the button and the footer.
  Above them a hero with the search box, and the categories with offers as
  chips (`GET /catalog/offers/categories`, each with its icon and count, and
  "All") (`app/CatalogSearch.tsx`). The filters live in the URL (`/?q=…&category=…`):
  the page renders their first page, typing replaces the URL a moment (300 ms)
  after the last key, and the grid asks for the next pages with the same
  filters beside the cursor; a new filter is a new grid (its `key`).
- `/issuers/{slug}` is a published issuer (`GET /catalog/issuers/{slug}/offers`):
  its initials in a tinted square (issuers have no logo), name, description,
  the domains its tenant has proved by DNS (`VerifiedDomains`, plain text,
  never links; also on an offer's page), DID with a copy button
  (`CopyButton`), since when it is published, and its offers; an unknown one is Next's not found. The issuer's name on an offer's
  tile, on its page and on an application links there.
- An offer is drawn as its credential, a physical card: `CredentialCard`
  (`app/components`; ID-1 proportions, the identity's gradient with
  guilloché arcs and the mark as a watermark, the category's icon and name,
  the type and its issuer; `full` or `compact`, `children` a status chip at
  the bottom right). `OfferTile` is an offer in a grid (the compact card, the
  issuer — not on its own page —, the description and "Apply"), on `/` and
  on an issuer's page; the offer's page has the full card as its hero. A category's icon is a lucide
  name the API serves (`icon`), drawn through `app/lib/category-icons.ts`
  (`CategoryIcon`, `categoryIcon`), the tag for one it does not know.
- Illustrations are hand-made inline SVG components in
  `app/components/illustrations` (the hero's wallet, no offers yet, the API
  out of reach, no results), coloured only with the theme's tokens (Tailwind
  `fill-*`/`stroke-*` classes or `var(--…)`) so they follow light and dark,
  and decorative (`aria-hidden`); `EmptyState` frames one with its title,
  text and action. `.hero-backdrop` (`app/globals.css`) is the dot grid in the
  brand's tint, faded from the top right, behind a hero only.
- Applying happens here, with no account: `/credentials/{issuer}/{type}` is
  an offer (`GET /catalog/issuers/{slug}/offers/{type}`: the issuer, the
  credential and its form) and Start (`POST /applications`) keeps the
  application's secret in an HTTP-only cookie (`almena.application.{id}`)
  and opens `/apply/{id}`. The cookie ends when the API says the application
  does (its `expires_at`: a day unsent; once sent, the API's
  `REGISTRY_APPLICATION_HOLDER_DAYS` after its latest step), and is brought up
  to date (`keepApplication`) whenever the page opens and the wallet answers,
  so a holder whose application is decided by hand days later can still come
  back to take the credential. On `/apply/{id}`: pair the wallet (QR 1), present credentials,
  fill in the fields and files, sign and send (QR 2), and once issued receive
  it (QR 3) — the stepper above (`app/apply/[id]/Stepper.tsx`, an icon per
  step, presenting only when the form asks for credentials) shows where it
  stands. Once sent, the page follows it by itself (`applicationStatus`,
  `app/lib/status-poll.ts`): while the issuer has it (sent, accepted) it
  looks again after 5 s, twice as long each time up to a minute, never while
  the page is hidden, and reloads once the status moves. Every QR code is
  `app/components/WalletQr.tsx` (as the registry draws them): the code, the
  "Open in the wallet" link, the wait as a live region and the countdown
  outside it. A wallet link is only drawn or put in an `href` when its scheme
  is `almena:` or `https:` (`app/lib/deep-link.ts`, checked in `askWallet`
  and again in `WalletQr`). `/applications` (linked from the header) lists
  this browser's applications — one per `almena.application.*` cookie, each
  read with its secret (`fetchMyApplications`), the latest step first, those
  the API no longer opens left out — with the offer, the status and the way
  back to `/apply/{id}`. Every call goes through the server actions in
  `app/lib/application-actions.ts` with the secret as `X-Application-Secret`;
  the wallet requests name this portal as `client_id` (the API's
  `REGISTRY_CATALOG_URL`). With `CATALOG_PORTAL_SECRET` (the API's
  `REGISTRY_PORTAL_SECRET`) every call names the visitor's address
  (`X-Almena-Client-IP`: the last `X-Forwarded-For` entry, the one the edge
  proxy added — the earlier ones the client may forge —, else `X-Real-IP`), so the API's limits per network address count
  visitors, not the portal (`too_many_requests` on Start).
  `app/components/FieldInput.tsx` draws each field
  by its catalogue type. The issuer decides and issues in the registry portal.
- Tests: unit tests next to what they test (`app/**/*.test.ts`, Vitest,
  `vitest.config.mts`, `task test`; `test/setup.ts` mocks Next's headers,
  cookies and redirect over the request in `test/next.ts`, `server-only` is
  an empty module) — the `lib/` helpers and the server actions with `fetch`
  stubbed: what each sends (the secret, the visitor's address), the cookie it
  keeps and how a refusal comes back. A new server action, or a new refusal
  it words, comes with its unit test.
- `app/health/route.ts` is the Docker health check: keep it dependency-free.
- `app/.well-known/`: `security.txt` (RFC 9116, this repository's advisories)
  and `did-configuration.json`, read as it is from `CATALOG_WEB_WELL_KNOWN_DIR`:
  the Domain Linkage Credential tying this origin to `did:web:almena.id` is
  signed elsewhere, the portal holds no key.
- `output: "standalone"` in `next.config.ts` is what the Dockerfile ships.
- Security headers (`app/lib/security-headers.ts`): `proxy.ts` gives every
  page a Content Security Policy with a nonce of its own (Next marks its
  scripts with it; `strict-dynamic`, `frame-ancestors 'none'`, `data:`
  images, self-hosted fonts, inline styles for server-rendered `style`
  attributes, `unsafe-eval` only in development), and `next.config.ts` adds
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and
  `Permissions-Policy` to every response. A new origin the pages load from
  goes in the policy, with its test.
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
