# @qtsurfer/api-client

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
