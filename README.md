# @qtsurfer/api-client

<p align="center">
  <a href="https://github.com/QTSurfer/api-client-ts/actions/workflows/ci.yml"><img src="https://github.com/QTSurfer/api-client-ts/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@qtsurfer/api-client"><img src="https://img.shields.io/npm/v/@qtsurfer/api-client" alt="npm"></a>
  <a href="https://qtsurfer.github.io/api-client-ts/"><img src="https://img.shields.io/badge/docs-typedoc-blue" alt="TypeDoc"></a>
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
import { client, listExchanges, prepareBacktest } from '@qtsurfer/api-client';

client.setConfig({
  baseUrl: 'https://api.qtsurfer.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.QTSURFER_TOKEN}`,
  },
});

const { data: exchanges, error } = await listExchanges();
if (error) throw error;

console.log(exchanges);
```

### API key → JWT

Every endpoint above expects a short-lived JWT in `Authorization: Bearer …`.
Exchange a long-lived API key for one via `authenticate`:

```ts
import { authenticate } from '@qtsurfer/api-client';

const { data, error } = await authenticate({
  baseUrl: 'https://api.qtsurfer.com/v1',
  headers: { 'X-API-Key': process.env.QTSURFER_APIKEY! },
});
if (error) throw error;

const { access_token: jwt } = data;  // feed to client.setConfig() for the rest
```

For production use, prefer the [`@qtsurfer/sdk`](https://github.com/QTSurfer/sdk-ts)
`authenticate(apikey)` helper — it returns a session that refreshes the JWT
transparently, reads `QTSURFER_APIKEY` from the environment, and supports
pluggable token stores so callers don't reinvent that plumbing.

## API surface

All operations are exported as standalone functions; every operation accepts an `Options` object and returns `{ data, error, response }`.

The table is exhaustive: `src/generated/` is produced from the OpenAPI spec, so **all 29 operations**
the spec declares are exported. The rows below describe **spec version 0.112.0**, which is versioned
independently of this package.

| Function | Method | Path | Purpose |
| -------- | ------ | ---- | ------- |
| `authenticate` | POST | `/auth/token` | Exchange an API key for a short-lived JWT |
| `listExchanges` | GET | `/exchanges` | List the available exchanges |
| `listInstruments` | GET | `/exchange/{exchangeId}/instruments` | List an exchange's instruments (default spot segment) |
| `listSegmentInstruments` | GET | `/exchange/{exchangeId}/{segment}/instruments` | List an exchange segment's instruments |
| `downloadTickers` | GET | `/exchange/{exchangeId}/tickers/{base}/{quote}` | Download one hour of tickers as a Lastra segment |
| `downloadKlines` | GET | `/exchange/{exchangeId}/klines/{base}/{quote}` | Download one hour of klines as a Lastra segment |
| `listStrategies` | GET | `/strategies` | List your registered strategies, most recently compiled first |
| `compileStrategy` | POST | `/strategy` | Compile and register a strategy |
| `validateStrategy` | POST | `/strategy/{strategyId}/validate` | Check that a registered strategy can actually run |
| `getStrategy` | GET | `/strategy/{strategyId}` | Get a strategy by id, including its validation state |
| `deleteStrategy` | DELETE | `/strategy/{strategyId}` | Release a registered strategy |
| `getStrategyCode` | GET | `/strategy/{strategyId}/code` | Get a registered strategy's source, if you still have one to read |
| `prepareBacktest` | POST | `/backtest/{exchangeId}/{type}/prepare` | Prepare backtest data |
| `getPrepareStatus` | GET | `/backtest/{exchangeId}/{type}/prepare/{jobId}` | Get the status of a prepare job |
| `executeSweep` | POST | `/backtest/{exchangeId}/{type}/executeSweep/{requestId}` | Execute a parameter sweep over prepared data |
| `getSweepResult` | GET | `/backtest/{exchangeId}/{type}/executeSweep/{requestId}/{sweepId}` | Get sweep progress and results |
| `cancelSweep` | DELETE | `/backtest/{exchangeId}/{type}/executeSweep/{requestId}/{sweepId}` | Cancel a running parameter sweep |
| `getSweepSensitivity` | GET | `/backtest/{exchangeId}/{type}/executeSweep/{requestId}/{sweepId}/sensitivity` | Get sweep sensitivity surfaces |
| `getSweepRunEquityCurve` | GET | `/backtest/{exchangeId}/{type}/executeSweep/{requestId}/{sweepId}/runs/{runIx}/equityCurve` | Get one sweep trial's equity curve |
| `executeBacktest` | POST | `/backtest/{exchangeId}/{type}/execute` | Execute a compiled strategy against a prepared dataset |
| `cancelBacktest` | DELETE | `/backtest/{exchangeId}/{type}/execute/{jobId}` | Cancel a running backtest execution |
| `getBacktestResult` | GET | `/backtest/{exchangeId}/{type}/execute/{jobId}` | Get the result of a backtest execution job |
| `listDatasets` | GET | `/datasets` | List your datasets |
| `createDataset` | POST | `/datasets` | Create a dataset and obtain its first upload session |
| `deleteDataset` | DELETE | `/datasets/{datasetId}` | Soft-delete a dataset |
| `getDataset` | GET | `/datasets/{datasetId}` | Get dataset metadata |
| `openDatasetUpload` | POST | `/datasets/{datasetId}/uploads` | Open an upload session for a later dataset version |
| `finalizeDatasetUpload` | POST | `/datasets/{datasetId}/uploads/{uploadId}/finalize` | Queue ingest after uploading a file |
| `getDatasetUpload` | GET | `/datasets/{datasetId}/uploads/{uploadId}` | Get an upload's ingestion state |

All generated types (`Exchange`, `InstrumentDetail`, `BacktestJobResult`, `PrepareJobState`, `ResultMap`, etc.) are re-exported from the root.

## Configuring the client

The default client points to the staging server. Override via `setConfig` or by passing options inline:

```ts
import { client, listExchanges } from '@qtsurfer/api-client';

// Global
client.setConfig({
  baseUrl: 'https://api.qtsurfer.com/v1',
});

// Per-call
await listExchanges({
  baseUrl: 'https://api.qtsurfer.com/v1',
  headers: { 'X-Request-Id': '...' },
});
```

To build your own isolated client (e.g. per-tenant), use `createClient` from `@hey-api/client-fetch`.

## Error handling

Each function returns a discriminated union. Narrow via `error` before using `data`:

```ts
const { data, error } = await prepareBacktest({
  body: {
    /* PrepareRequest */
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
