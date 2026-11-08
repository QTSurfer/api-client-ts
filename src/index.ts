export * from './generated';
import { client } from './generated/client.gen';
import { withNetworkFailoverFetch } from './networkFailover';

// Generated operations share this singleton, so install failover once at the public entrypoint.
client.setConfig({ fetch: withNetworkFailoverFetch() });

export { client, withNetworkFailoverFetch };
