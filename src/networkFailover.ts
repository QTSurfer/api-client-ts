/**
 * Wrap fetch with one-request network failover for QTSurfer's primary API and storage hosts.
 * Each invocation starts at the URL supplied by its caller; the backup is only used for that
 * invocation when fetch rejects before receiving an HTTP response.
 */
export function withNetworkFailoverFetch(fetchImpl: typeof fetch = globalThis.fetch): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const fallbackUrl = createFallbackUrl(input);
    if (!fallbackUrl || isAbortSignal(init?.signal)) {
      return fetchImpl(input, init);
    }

    // Build independent request branches before fetch consumes a Request body. For the generated
    // API client, request bodies are JSON strings; cloning also keeps this helper safe for Request.
    const primaryRequest = input instanceof Request ? input.clone() : undefined;
    const backupRequest = input instanceof Request ? new Request(fallbackUrl, input.clone()) : undefined;
    const [primaryInit, backupInit] = splitStreamBody(init);
    const fallbackInput = input instanceof URL ? fallbackUrl : fallbackUrl.toString();
    try {
      return await fetchImpl(primaryRequest ?? input, primaryInit);
    } catch (error) {
      if (!(error instanceof TypeError) || isAbortError(error)) throw error;
      return fetchImpl(backupRequest ?? fallbackInput, backupInit);
    }
  };
}

function createFallbackUrl(input: RequestInfo | URL): URL | undefined {
  const rawUrl = input instanceof Request ? input.url : input.toString();
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return undefined;
  }

  const labels = url.hostname.split('.');
  if (labels[0] === 'api') labels[0] = 'api2';
  else if (labels[0] === 'storage') labels[0] = 'storage2';
  else return undefined;
  url.hostname = labels.join('.');

  return url;
}

function splitStreamBody(
  init: RequestInit | undefined,
): [RequestInit | undefined, RequestInit | undefined] {
  const body = init?.body;
  if (typeof ReadableStream === 'undefined' || !(body instanceof ReadableStream)) {
    return [init, init];
  }
  const [primary, backup] = body.tee();
  return [{ ...init, body: primary }, { ...init, body: backup }];
}

function isAbortSignal(signal: AbortSignal | null | undefined): boolean {
  return signal?.aborted === true;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
