# almena-catalog

The public catalog of the Almena Network, published at `https://catalog.almena.id`: the services issuers publish to request verifiable credentials, open to anyone with an Almena wallet. Built with [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript and Tailwind CSS 4. Its data comes from the public catalogue of [api](../api).

## Quick start

Needs Node.js 24 or later, [Task](https://taskfile.dev) and Docker.

```bash
task init   # .env from .env.example
task dev    # the portal with hot reload on http://localhost:3100
```

The portal uses the API at `https://api.almena.id`; to work against a local API instead (`task dev` in `../api`), point `CATALOG_API_URL` at `http://localhost:8000`. To run the production build in Docker instead:

```bash
task up      # builds the image and starts it
task health  # {"status":"ok"}
```

## Configuration

Read from the environment or `.env`; [.env.example](.env.example) explains every one.

| Variable | Default | |
|---|---|---|
| `NEXT_PUBLIC_CATALOG_WEB_URL` | `https://catalog.almena.id` | Public origin of the portal, for metadata; inlined at build time |
| `CATALOG_API_URL` | `https://api.almena.id` | The API as the Next.js server reaches it, read at runtime |
| `NEXT_PUBLIC_REGISTRY_WEB_URL` | `https://registry.almena.id` | The registry portal, where an offer is applied for for now; inlined at build time |
| `CATALOG_WEB_PORT` | `3100` | Port of the portal on the host |

## Endpoints

| | |
|---|---|
| `GET /` | The catalog: every published issuer's offers |
| `GET /health` | Liveness, used by the Docker health check |

## Development

`task --list` shows every task. Before sending a change, `task check` (ESLint, TypeScript and a production build) must pass; see [CONTRIBUTING.md](CONTRIBUTING.md). This Next.js version differs from older ones: [AGENTS.md](AGENTS.md) points to the documentation bundled in `node_modules/next/dist/docs/`.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

Licensed under the [Apache License 2.0](LICENSE).
