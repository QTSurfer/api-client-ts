# @qtsurfer/api-client

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
