import assert from 'node:assert/strict';
import test from 'node:test';
import { withNetworkFailoverFetch } from '../dist/index.js';

test('retries an API network failure once on api2 and starts future calls on api', async () => {
  const urls = [];
  let failPrimary = true;
  const fetchImpl = async (input) => {
    const url = new URL(input instanceof Request ? input.url : input);
    urls.push(url.hostname);
    if (url.hostname === 'api.qtsurfer.net' && failPrimary) {
      failPrimary = false;
      throw new TypeError('network failure');
    }
    return new Response('ok', { status: 200 });
  };
  const fetch = withNetworkFailoverFetch(fetchImpl);

  assert.equal((await fetch('https://api.qtsurfer.net/v1/account')).status, 200);
  assert.equal((await fetch('https://api.qtsurfer.net/v1/account')).status, 200);
  assert.deepEqual(urls, ['api.qtsurfer.net', 'api2.qtsurfer.net', 'api.qtsurfer.net']);
});

test('does not retry an HTTP response', async () => {
  const urls = [];
  const fetch = withNetworkFailoverFetch(async (input) => {
    urls.push(new URL(input).hostname);
    if (urls.length === 1) throw new TypeError('network failure');
    return new Response('unavailable', { status: 503 });
  });

  assert.equal((await fetch('https://api.qtsurfer.net/v1/account')).status, 503);
  assert.deepEqual(urls, ['api.qtsurfer.net', 'api2.qtsurfer.net']);
});

test('replaces only the first API hostname label and preserves the domain suffix', async () => {
  const hosts = [];
  const fetch = withNetworkFailoverFetch(async (input) => {
    const host = new URL(input).hostname;
    hosts.push(host);
    if (host.startsWith('api.')) throw new TypeError('network failure');
    return new Response('ok', { status: 200 });
  });

  await fetch('https://api.qtsurfer.com/v1/account');
  assert.deepEqual(hosts, ['api.qtsurfer.com', 'api2.qtsurfer.com']);
});

test('retries signed storage URLs on storage2 while preserving path and query', async () => {
  const urls = [];
  const fetch = withNetworkFailoverFetch(async (input) => {
    const url = new URL(input);
    const call = urls.length;
    urls.push(url);
    if (call % 2 === 0) throw new TypeError('network failure');
    return new Response(null, { status: 200 });
  });
  const signedUrl = 'https://storage.qtsurfer.net/uploads/a/raw.csv?X-Amz-Signature=abc&part=1';

  assert.equal((await fetch(signedUrl)).status, 200);
  assert.equal((await fetch(signedUrl, { method: 'PUT', body: 'data' })).status, 200);
  const signedComUrl = 'https://storage.qtsurfer.com/downloads/a?X-Amz-Signature=def';
  assert.equal((await fetch(signedComUrl)).status, 200);
  for (const [primary, backup, expectedPrimary, expectedBackup] of [
    [urls[0], urls[1], 'storage.qtsurfer.net', 'storage2.qtsurfer.net'],
    [urls[2], urls[3], 'storage.qtsurfer.net', 'storage2.qtsurfer.net'],
    [urls[4], urls[5], 'storage.qtsurfer.com', 'storage2.qtsurfer.com'],
  ]) {
    assert.equal(primary.hostname, expectedPrimary);
    assert.equal(backup.hostname, expectedBackup);
    assert.equal(backup.pathname, primary.pathname);
    assert.equal(backup.search, primary.search);
  }
});

test('does not retry unrelated hosts or aborted requests', async () => {
  let calls = 0;
  const fetch = withNetworkFailoverFetch(async () => {
    calls += 1;
    throw new TypeError('network failure');
  });

  await assert.rejects(fetch('https://example.com/'), TypeError);
  await assert.rejects(fetch('https://api2.qtsurfer.net/v1/account'), TypeError);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(fetch('https://api.qtsurfer.net/v1/account', { signal: controller.signal }), TypeError);
  assert.equal(calls, 3);
});

test('does not retry a non-TypeError rejection from a custom fetch', async () => {
  let calls = 0;
  const fetch = withNetworkFailoverFetch(async () => {
    calls += 1;
    throw new Error('custom fetch programming error');
  });

  await assert.rejects(fetch('https://api.qtsurfer.net/v1/account'), /programming error/);
  assert.equal(calls, 1);
});
