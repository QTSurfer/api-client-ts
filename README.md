# @qtsurfer/sdk

TypeScript SDK for the [QTSurfer API](https://github.com/QTSurfer/qtsurfer-api), auto-generated from the OpenAPI 3.1 spec using [`@hey-api/openapi-ts`](https://heyapi.dev/).

- Tree-shakeable standalone functions (no class hierarchy).
- Full type safety for requests, responses, and error shapes.
- Native `fetch` based client (no runtime dependencies beyond `@hey-api/client-fetch`).
- Works in Node.js `>=20`, modern browsers, Deno, and Bun.

## Installation

```bash
pnpm add @qtsurfer/sdk
# or
npm install @qtsurfer/sdk
```

## Quick start

```ts
import { client, getExchanges, prepareBacktesting } from '@qtsurfer/sdk';

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
import { client, getExchanges } from '@qtsurfer/sdk';

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

To build your own client (e.g. isolated per-tenant), use `createClient` from `@hey-api/client-fetch`.

## Error handling

Each function returns a discriminated union. Narrow via `error` before using `data`:

```ts
const { data, error } = await prepareBacktesting({
  body: {
    /* PrepareBacktestingRequest */
  },
});

if (error) {
  // error is typed as the union of error responses for that operation
  console.error(error.code, error.message);
  return;
}

// data is typed as the success payload
console.log(data.jobId);
```

## Regenerating the SDK

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
| `pnpm generate` | Regenerate the SDK from the OpenAPI spec |
| `pnpm lint` | Type-check without emitting |
| `pnpm build` | Compile to `dist/` |

## License

Apache-2.0 — see [LICENSE](./LICENSE).
