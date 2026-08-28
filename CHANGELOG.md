# @qtsurfer/api-client

## 0.13.0

### Minor Changes

- [`5c6c015`](https://github.com/QTSurfer/api-client-ts/commit/5c6c015a83354a633c502c833094e02a28231cd2) Thanks [@mrmx](https://github.com/mrmx)! - Regenerate for OpenAPI 0.111.2 with renewable dataset upload sessions.

## 0.12.0

### Minor Changes

- Regenerate for OpenAPI 0.110.3, including equity-curve transforms, retained sweep-run curves, and declared strategy properties.

## 0.11.0

### Minor Changes

- Regenerate for OpenAPI 0.110.1: prepare and backtest against a dataset you upload yourself, not just a managed exchange.

  Six new endpoints back a **Dataset** you own: `listDatasets`/`createDataset` (`GET`/`POST /datasets`), `getDataset`/`deleteDataset` (`GET`/`DELETE /datasets/{datasetId}`), `finalizeDatasetUpload` (`POST /datasets/{datasetId}/uploads/{uploadId}/finalize`), and `getDatasetUpload` (`GET /datasets/{datasetId}/uploads/{uploadId}`). `createDataset` returns a `DatasetCreated` — the dataset plus a presigned URL to `PUT` a CSV to directly, no API credentials needed on that request. Once the `PUT` completes, `finalizeDatasetUpload` kicks off ingestion; poll `getDatasetUpload` for the resulting `DatasetVersion` (cadence and range are discovered from the file, not declared by the caller). `listDatasets` never 404s — an empty array means you have none — and `deleteDataset` is a soft delete: it stops the dataset appearing in `listDatasets`/`getDataset`, but backtests already run against it are unaffected.

  To actually backtest against one, use the reserved `exchangeId: user` on the _existing_ prepare/execute endpoints. `PrepareRequest.instrument` is now optional — required only against a managed exchange — and gains `datasetId`/`datasetVersionId`: send `datasetId` in place of `instrument` against `exchangeId: user` (`datasetVersionId` optionally pins a past version; omitted, it defaults to the dataset's current one). `PrepareJobState` reports coverage differently for a dataset-backed prepare: `cadence`/`gaps`/`largestGapSteps` (the dataset's own discovered cadence, gap count, and largest gap) replace the hour-walked `totalHours`/`hoursWithData`/`hoursWithoutData`, which are absent in that case — `dataFrom`/`dataTo`/`coverageRatio` are present either way. `executeBacktest`/`executeSweep` are unchanged; they only ever consume the `prepareJobId` from whichever prepare ran.

  `PrepareRequest.cadence` widens from `1s | 5s | 1m | 5m | 15m | 1h | 4h | 1d` to also include `3m | 30m | 2h | 8h | 12h | 1w | 1q`.

  `@qtsurfer/sdk` does not yet wrap these six dataset endpoints into higher-level calls — use this package's generated functions directly for dataset management until that lands.

## 0.10.0

### Minor Changes

- Regenerate for OpenAPI 0.109.2: list, release, and read back a registered strategy's source.

  `listStrategies` (`GET /strategies`) returns every strategy you have registered and not deleted,
  most recently compiled first — `{ strategies: [{ strategyId, compiledAt?, requiredSources? }] }`.
  Never a `404`; an empty array if you have none. It deliberately omits validation state to stay
  cheap regardless of how many strategies you have — check a specific one with the existing
  `getStrategy`.

  `deleteStrategy` (`DELETE /strategy/{strategyId}`) removes a strategy from both `getStrategy` and
  `listStrategies`, returning `{ strategyId, deleted: true }`, or a `404 ResponseError` if there is no
  such registered strategy for you. Re-submitting the same source to `compileStrategy` afterwards
  registers a **new** strategy with a **new** id — it does not "undelete" the old one. Backtests
  already run against the deleted strategy are completely unaffected, and deleting your own copy of a
  strategy never touches anyone else's copy of the same source (e.g. a shared/marketplace listing).

  `getStrategyCode` (`GET /strategy/{strategyId}/code`) returns the exact source last submitted for a
  strategy id — `{ strategyId, code: string }`. Its `404 ResponseError` covers two cases that are
  deliberately indistinguishable from the response alone: the id was never registered by you, or it
  resolves only through a shared/marketplace reference that carries no source of its own.

  `StrategyState` gains an optional `_links: StrategyLinks`, currently just `{ code: HalLink }`
  pointing at `getStrategyCode`. It is present on a full `StrategyState` body — `getStrategy`, and
  `validateStrategy`'s already-validated `200` — and absent from that same operation's `202`, which
  stays a deliberately partial stub.

  Docs-only: the spec's staging server entry is now `https://api.qtsurfer.net` (previously
  `https://api.staging.qtsurfer.com`). This is the host generated clients were already defaulting to
  in practice; nothing about where requests go has changed.

## 0.9.0

### Minor Changes

- Regenerate for OpenAPI 0.107.0: a sweep now says why its leaderboard is empty, and the validate
  endpoint returns one type instead of two.

  `ExecuteSweepResult` gains an optional `failReason: string` — the cause reported by the **first**
  shard to fail. The backend always sent this; it was simply undeclared, so the client discarded it.
  It is what turns an inscrutable result into an answer: a sweep can come back `PARTIAL` with
  `progress.done: 0` because the strategy could not be loaded at all, and until now the response said
  only that nothing finished. Read it next to `progress.failedShards` — first failure wins, so it
  names one cause rather than all of them, and it is absent on a healthy sweep.

  `validateStrategy`'s `202` response is now typed as `StrategyState`, the same type as its `200`,
  where it used to be an anonymous `{ strategyId, validation: 'pending' }`. `ValidateStrategyResponse`
  therefore collapses from a two-member union to plain `StrategyState`. Nothing is lost: the old
  inline shape was a subset, and fields such as `compiledAt`, `requiredSources` and `detail` are now
  reachable on the result without narrowing first, where before the union made them a type error.
  `validation` was already the full `'not_validated' | 'pending' | 'passed' | 'failed'` union when
  read off the response, and still is.

  The payload was never how you tell the two responses apart, and that has not changed: discriminate
  on `response.status === 202`. A `200` can also carry `validation: 'pending'`, left by a check an
  earlier call queued, so only the status code says whether _this_ call started one.

  `getSweepSensitivity` now declares bearer security, which it had been missing. Callers who
  configure the client with the `auth` option rather than a static `Authorization` header were
  getting no token attached to that one request; they now do. No change for callers who set the
  header themselves.

## 0.8.0

### Minor Changes

- Regenerate for OpenAPI 0.106.0: sweep walk-forward validation and a new sensitivity endpoint.

  `executeSweep` (`POST`) gains an optional `walkForward: WalkForwardRequest` (`folds`,
  `inSamplePct`). Its `202` response, `ExecuteSweepAccepted`, gains an optional
  `walkForward: WalkForwardAccepted` (`folds`, `inSamplePct`, `totalRuns`) echoing what was
  accepted.

  `getSweepResult` (`GET`) gains an optional `ranking` query param (`'plateau' | 'raw'`, default
  `'plateau'`). This changes the _default_ ordering of the existing `ranked` view — same shape,
  different sort — not a schema break. Its response, `ExecuteSweepResult`, gains `ranking` (which
  ordering was actually applied), `pbo` and `pboSplits` (probability of backtest overfitting), and
  an optional `walkForward: WalkForwardResult` (`folds`, `inSamplePct`, `completedFolds`,
  `paramDrift`, `results: WalkForwardFold[]`) once a walk-forward sweep completes.

  `SweepProgress` gains three required fields — `failedShards`, `retrying`, `notStarted` — that
  split out what was previously folded into `aborted`, plus optional `stalledSeconds` and
  `etaSeconds`. `SweepRunRow` gains optional `plateauScore`, `neighbourCount` and `deflatedSharpe`,
  populated on the `ranked` view.

  Adds `getSweepSensitivity` (`GET
/backtest/{exchangeId}/{type}/executeSweep/{requestId}/{sweepId}/sensitivity`), returning
  `SweepSensitivity` (`marginals: SweepMarginal[]`, `heatmaps: SweepHeatmap[]`,
  `heatmapsTruncated`) or a `404 ResponseError` if the sweep is unknown.

## 0.7.0

### Minor Changes

- `compileStrategy` (`POST /strategy`) is now always synchronous.

  The `X-Compile-Async` header and the `202`/`AcceptedJob` response branch are gone from
  `CompileStrategyData`/`CompileStrategyResponses`. A `200` returns `{ strategyId }`, a `400` is a
  compile error, and a new `429` means too many compilations are already in flight.

  Adds `validateStrategy` (`POST /strategy/{strategyId}/validate`): `200` returns the already-recorded
  `StrategyState` verdict, `202` means a check was just queued (`{ strategyId, validation: 'pending' }`).

  `getStrategy` (`GET /strategy/{strategyId}`) is retyped from the old `{ jobId?, status, strategyId?,
statusDetail? }` shape to `StrategyState` (`validation: 'not_validated' | 'pending' | 'passed' |
'failed'`, plus `compiledAt`, `requiredSources`, `validatedAt`, `detail`, `notices`,
  `noticesTruncated`, `dryRunIncomplete`, `validationStalled`) — a strategy's validation verdict, not a
  compile job status.

  `ResultMap` (in `BacktestJobResult.results`) gains optional `notices: Notice[]` and
  `noticesTruncated: number`, the same diagnostics shape `StrategyState` carries.
