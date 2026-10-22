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
  baseUrl: 'https://api.qtsurfer.net/v1', // Staging beta server
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
  baseUrl: 'https://api.qtsurfer.net/v1', // Staging beta server
  headers: { 'X-API-Key': process.env.QTSURFER_APIKEY! },
});
if (error) throw error;

const { access_token: jwt } = data;  // feed to client.setConfig() for the rest
console.log(data.scopes); // e.g. { exchanges: ['read'], backtests: ['read', 'execute'] }
```

An invalid, revoked, or expired key returns `401`. Where a deployment requires scopes, a key
with none returns `403` with `AuthTokenError.code === 'apikey_without_scopes'`, and no token is
minted. Create a key with at least one resource/action scope in the web app; retrying the same
scope-less key does not fix the rejection. Read the code from `error` and the status from `response`.

For production use, prefer the [`@qtsurfer/sdk`](https://github.com/QTSurfer/sdk-ts)
`authenticate(apikey)` helper — it returns a session that refreshes the JWT
transparently, reads `QTSURFER_APIKEY` from the environment, and supports
pluggable token stores so callers don't reinvent that plumbing.

## API surface

All operations are exported as standalone functions; every operation accepts an `Options` object and returns `{ data, error, response }`.

The table is exhaustive: `src/generated/` is produced from the OpenAPI spec, so **all 48 operations**
the spec declares are exported. The rows below describe **spec version 0.128.46**, which is versioned
independently of this package.

| Function | Method | Path | Purpose |
| -------- | ------ | ---- | ------- |
| `authenticate` | POST | `/auth/token` | Exchange an API key for a short-lived JWT |
| `getAccount` | GET | `/account` | Read the authenticated account tier and limits, including the full-grid sweep limit |
| `getAccountUsage` | GET | `/account/usage` | Read current resource and storage use |
| `listExchanges` | GET | `/exchanges` | List the available exchanges |
| `listInstruments` | GET | `/exchange/{exchangeId}/instruments` | List CEX instruments or DEX pools in the default segment |
| `listSegmentInstruments` | GET | `/exchange/{exchangeId}/{segment}/instruments` | List CEX instruments or DEX pools in a discovered segment |
| `downloadTickers` | GET | `/exchange/{exchangeId}/tickers/{base}/{quote}` | Download one hour of tickers as a Lastra segment |
| `downloadKlines` | GET | `/exchange/{exchangeId}/klines/{base}/{quote}` | Download one hour of klines as a Lastra segment |
| `listStrategies` | GET | `/strategies` | List your registered strategies, optionally including deleted strategies and their deletion times |
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
| `listDatasets` | GET | `/datasets` | List your datasets, optionally including deleted datasets and their deletion times |
| `createDataset` | POST | `/datasets` | Create a dataset and obtain its first upload session |
| `deleteDataset` | DELETE | `/datasets/{datasetId}` | Soft-delete a dataset |
| `getDataset` | GET | `/datasets/{datasetId}` | Get dataset metadata |
| `openDatasetUpload` | POST | `/datasets/{datasetId}/uploads` | Open an upload session for a later dataset version |
| `finalizeDatasetUpload` | POST | `/datasets/{datasetId}/uploads/{uploadId}/finalize` | Queue ingest after uploading a file |
| `getDatasetUpload` | GET | `/datasets/{datasetId}/uploads/{uploadId}` | Get an upload's ingestion state |
| `importDataset` | POST | `/datasets/imports` | Create a dataset by importing CEX market history or DEX pool history |
| `getDatasetImport` | GET | `/datasets/{datasetId}/imports/{importId}` | Get an import's fetch and ingestion state |
| `startLive` | POST | `/strategy/{strategyId}/live` | Start a compiled strategy on a live feed; request a sandbox run with `sandbox: true`, set its warm-up replay window with `warmFrom`, simulate fills and equity with `paper`, or request a plain WebSocket stream URL |
| `getLive` | GET | `/strategy/{strategyId}/live` | Read a strategy's current or most recent live run |
| `stopLive` | DELETE | `/strategy/{strategyId}/live` | Request a strategy's active live run to stop |
| `listLive` | GET | `/live` | Page all live runs owned by the authenticated account |
| `listPublicLive` | GET | `/live/public` | Page publicly visible live runs |
| `getLiveRun` | GET | `/live/{runId}` | Read one owned run by its id, including its latest stats and last-change time |
| `updateLive` | PATCH | `/live/{runId}` | Change a run's visibility, name, or description |
| `updateLiveParams` | PUT | `/live/{runId}/params` | Change parameters while a run stays active |
| `rotateLiveStream` | POST | `/live/{runId}/stream` | Replace a run's stream URL and retire the old one |
| `revokeLiveStream` | DELETE | `/live/{runId}/stream` | Permanently revoke a run's stream URL |
| `sendLiveCommand` | POST | `/live/{runId}/commands` | Send a command to a running strategy without restarting it |
| `getLiveRunSignals` | GET | `/live/{runId}/signals` | Page retained signals by time, instrument, or signal type (`paper` items only when output is `mix`) |
| `getLiveRunPaper` | GET | `/live/{runId}/paper` | Read simulated accounts, open positions, equity, and KPIs for a paper-trading run |
| `getLiveRunPaperEquity` | GET | `/live/{runId}/paper/equity` | Read a paper account equity or instrument PnL curve with shaping and paging options |
| `mintLiveConnectionToken` | POST | `/live/token` | Mint a short-lived Centrifugo connection token |

All generated types (`Exchange`, `InstrumentDetail`, `BacktestJobResult`, `PrepareJobState`, `ResultMap`, `InsufficientScopeError`, `LiveRunStats`, `LiveRunDetail`, `LiveRunWithStream`, `LiveStreamUrl`, `LiveStreamRevoked`, `LivePaper`, `LivePaperAccount`, `LivePaperEquityCurve`, `SendLiveCommandRequest`, `LiveCommandResult`, etc.) are re-exported from the root.

### Venue discovery, history, and scopes

`Exchange.venueType` is `cex` or `dex`; `segments` lists its catalogues and `liveSegments` the
segments a live run can consume. Both instrument operations return `InstrumentCatalogueResponse`,
a union of `InstrumentListResponse` and `PoolListResponse`, distinguished by `meta.venueType`.
Pool `id` is the address used to start a DEX live run; `symbol` is its signal pair. Unknown prices,
volumes, and pool creation dates are absent. DEX live sources require one pool address and `type: 'kline'`.
New requests use `cex`/`dex`; the server still accepts the older `cx`/`dx` spelling.

`DatasetImportRequest` accepts `type: 'cex'` with a `cex` block (`exchange`, `segment: 'spot'`,
`dataType: 'ticker' | 'klines'`), or `type: 'dex'` with its `dex` block. CEX import and kline
preparation support all fifteen cadence labels from `1s` through `1q`.

`AuthTokenResponse.scopes` and `Account.scopes` use `KeyScopes`, a resource-to-actions map such
as `{ exchanges: ['read'], backtests: ['read', 'execute'] }`; a key with none reports `{}`.
A scope is one resource and one action; resources with no actions are omitted. Protected
operations reject a valid token whose key lacks the needed scope with a typed `403`
`InsufficientScopeError` (`code: 'insufficient_scope'`, `required: 'resource:action'`). Update
the key's grants and obtain a fresh token; retrying the same token cannot add a grant. This is
distinct from `POST /auth/token` returning `403 apikey_without_scopes` before issuing a token.

`ResponseError.retryable` says whether resending the same request may succeed; honor
`Retry-After` when present. `JobState.retryable` reports whether a failed execution may succeed
if submitted again.

```ts
const { data, error, response } = await listDatasets();
if (error) {
  if (response?.status === 403 && error.code === 'insufficient_scope' && 'required' in error) {
    console.error(`Grant ${error.required} to this API key and obtain a fresh token.`);
  } else if ('retryable' in error && error.retryable) {
    console.error('Retry this request only after any Retry-After delay.');
  } else {
    throw error;
  }
} else {
  console.log(data?.datasets);
}
```

Hourly downloads cover the last seven days. Lastra content is `application/vnd.qtsurfer.lastra`
and its `ts` column uses microseconds (`X-Ts-Unit: micros`); Parquet timestamps use milliseconds.
Inspect `response.headers` for `X-Data-Status: provisional` and `X-Data-Through`: provisional
bytes may grow and must be fetched again to obtain the stored hour. Some deployments instead
answer recent hours with `404` `NOT_YET_AVAILABLE` and `Retry-After`. `ResponseError.reason`
distinguishes that case from `NO_DATA`, `OUTSIDE_WINDOW` (`400`, with `next` describing a dataset
import), and `TEMPORARILY_UNAVAILABLE` (`503`, with `Retry-After`). Treat unknown reasons like an
absent reason, and add caller-specific fields such as a dataset name to a suggested `ErrorNextCall`.

`sendLiveCommand` sends a command to every execution behind an owned live run. The strategy must
implement the engine's `CommandRequestHandler`; `202` means the command was accepted, not that the
strategy has completed handling it:

```ts
import { sendLiveCommand } from '@qtsurfer/api-client';

const { data, error } = await sendLiveCommand({
  path: { runId },
  body: { command: 'flatten', properties: { instrument: 'BTC/USDT' } },
});
if (error) throw error;
console.log(data.commandId, data.effectiveAtMs);
```

## Configuring the client

The default client points to the staging server. Override via `setConfig` or by passing options inline:

```ts
import { client, listExchanges } from '@qtsurfer/api-client';

// Global
client.setConfig({
  baseUrl: 'https://api.qtsurfer.net/v1', // Staging beta server
});

// Per-call
await listExchanges({
  baseUrl: 'https://api.qtsurfer.net/v1', // Staging beta server
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
