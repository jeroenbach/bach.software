# Kiota backend client

[For more info see the Kiota documentation](https://learn.microsoft.com/en-us/openapi/kiota)

The client in this folder is generated from the committed OpenAPI document `openapi/v1.json`
(repo root). The backend build writes that document, so no running server is needed.

## Install

Kiota is pinned in the local tool manifest (`.config/dotnet-tools.json`, currently 1.34.1).
`pnpm generate:api` restores it automatically; to restore it by hand:

```bash
dotnet tool restore
```

Kiota checks the web for updates. To disable this set `KIOTA_OFFLINE_ENABLED=true`:

```bash
export KIOTA_OFFLINE_ENABLED=true
```

## Change the API and regenerate the client

1. Change the backend, then build it: `dotnet build src/api/Bach.Software.sln`. The build writes
   `openapi/v1.json`. While `pnpm dev:api` (`dotnet watch`) runs, every rebuild rewrites it; if a
   hot-reloaded edit does not update the file, restart `pnpm dev:api` or run the build.
2. Regenerate the client from the committed document: `pnpm generate:api`
3. Commit `openapi/` and `src/app/services/backend/` together.

CI rebuilds the backend and fails when `openapi/` differs from what is committed, then regenerates
this client with `pnpm generate:api` and fails when `src/app/services/backend/` differs, so a
forgotten step 2 or 3 is caught there.

To bump Kiota, change the version in `.config/dotnet-tools.json`, run `pnpm generate:api`, and
commit the resulting diff.
