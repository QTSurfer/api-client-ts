# @qtsurfer/api-client

<p align="center">
  <a href="https://github.com/QTSurfer/api-client-ts/actions/workflows/ci.yml"><img src="https://github.com/QTSurfer/api-client-ts/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@qtsurfer/api-client"><img src="https://img.shields.io/npm/v/@qtsurfer/api-client" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
</p>

Auto-generated TypeScript API client for the [QTSurfer API](https://github.com/QTSurfer/qtsurfer-api), produced from the OpenAPI 3.1 spec with [`@hey-api/openapi-ts`](https://heyapi.dev/).

This package is intentionally thin: one function per operation, 1:1 with the spec. For workflow orchestration (polling, retries, domain objects, unified errors), use [`@qtsurfer/sdk`](https://github.com/QTSurfer/sdk-ts).

- Tree-shakeable standalone functions.
- Full type safety for requests, responses, and error shapes.
- Native `fetch` based client via `@hey-api/client-fetch`.
- Works in Node.js `>=20`, modern browsers, Deno, and Bun.

## Installation

```bash
pnpm add @qtsurfer/api-client
# or
npm install @qtsurfer/api-client
```

## Quick start

```ts
import { client, getExchanges, prepareBacktesting } from '@qtsurfer/api-client';

client.setConfig({
  baseUrl: 'https://api.qtsurfer.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.QTSURFER_TOKEN}`,
  },
});

const { data: exchanges, error } = await getExchanges();
if (error) throw error;

console.log(exchanges);
```

## API surface

All operations are exported as standalone functions; every operation accepts an `Options` object and returns `{ data, error, response }`.

| Function | Method | Path | Purpose |
| -------- | ------ | ---- | ------- |
| `getExchanges` | GET | `/exchanges` | List available exchanges |
| `getInstruments` | GET | `/exchange/{exchangeId}/instruments` | List instruments for an exchange |
| `postStrategy` | POST | `/strategy` | Compile a strategy |
| `getStrategyStatus` | GET | `/strategy/{strategyId}` | Poll strategy compilation status |
| `prepareBacktesting` | POST | `/backtesting/prepare` | Start a data preparation job |
| `getPreparationStatus` | GET | `/backtesting/prepare/{jobId}` | Poll preparation status |
| `executeBacktesting` | POST | `/backtesting/execute` | Start a backtest execution |
| `cancelExecution` | POST | `/backtesting/execute/{jobId}/cancel` | Cancel a running execution |
| `getExecutionResult` | GET | `/backtesting/execute/{jobId}` | Poll or fetch execution results |

All generated types (`Exchange`, `InstrumentDetail`, `BacktestJobResult`, `ResultMap`, etc.) are re-exported from the root.

## Configuring the client

The default client points to the staging server. Override via `setConfig` or by passing options inline:

```ts
import { client, getExchanges } from '@qtsurfer/api-client';

// Global
client.setConfig({
  baseUrl: 'https://api.qtsurfer.com/v1',
});

// Per-call
await getExchanges({
  baseUrl: 'https://api.qtsurfer.com/v1',
  headers: { 'X-Request-Id': '...' },
});
```

To build your own isolated client (e.g. per-tenant), use `createClient` from `@hey-api/client-fetch`.

## Error handling

Each function returns a discriminated union. Narrow via `error` before using `data`:

```ts
const { data, error } = await prepareBacktesting({
  body: {
    /* PrepareBacktestingRequest */
  },
});

if (error) {
  console.error(error.code, error.message);
  return;
}

console.log(data.jobId);
```

## Regenerating the client

The `src/generated/` directory is a committed artifact produced from the OpenAPI spec hosted at [`QTSurfer/qtsurfer-api`](https://github.com/QTSurfer/qtsurfer-api/blob/main/openapi.yaml).

```bash
pnpm install
pnpm generate   # runs @hey-api/openapi-ts against the remote spec
pnpm lint       # tsc --noEmit
pnpm build      # emits dist/ with .js + .d.ts
```

Configuration lives in `openapi-ts.config.ts`. To generate against a local checkout instead, change `input` to a relative path (e.g. `../qtsurfer-api/openapi.yaml`).

## Development

| Script | Description |
| ------ | ----------- |
| `pnpm generate` | Regenerate the client from the OpenAPI spec |
| `pnpm lint` | Type-check without emitting |
| `pnpm build` | Compile to `dist/` |

## License

Apache-2.0 — see [LICENSE](./LICENSE).
