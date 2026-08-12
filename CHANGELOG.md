# @qtsurfer/api-client

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
