import type { ChainConfig } from './chain';

// Typed JSON-RPC 1.0 failover wrapper.
//
// Tries endpoints in order. A response is "usable" when HTTP 200 AND either
// no JSON-RPC error OR a domain-level error the caller explicitly asked for
// (e.g. decryptdata's -5 is a valid negative answer, not a network fault).
//
// Network failure and -32601 (Method not found) trigger failover. 15s timeout
// per endpoint, zero retries within a single endpoint.

const TIMEOUT_MS = 15_000;
const METHOD_NOT_FOUND = -32601;

export type RpcError = {
  code: number;
  message: string;
};

export type RpcResult<T> = {
  data: T;
  endpoint: string;
};

export class RpcFailureError extends Error {
  constructor(
    message: string,
    public readonly attempts: Array<{ endpoint: string; reason: string }>
  ) {
    super(message);
    this.name = 'RpcFailureError';
  }
}

type JsonRpcEnvelope<T> = {
  result: T | null;
  error: RpcError | null;
  id: string | number;
};

async function postToEndpoint<T>(
  endpoint: string,
  method: string,
  params: unknown[],
  signal: AbortSignal
): Promise<JsonRpcEnvelope<T>> {
  const body = JSON.stringify({
    jsonrpc: '1.0',
    id: `viewer-${Date.now()}`,
    method,
    params,
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    signal,
    // Cross-origin RPC: never send cookies or HTTP auth, never leak the
    // page URL as Referer. Verus public RPC doesn't want any of it.
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const envelope = (await res.json()) as JsonRpcEnvelope<T>;
  return envelope;
}

/**
 * Call a JSON-RPC method across the chain's ordered endpoint list.
 *
 * @param chain         Chain config whose endpoints are tried in order.
 * @param method        JSON-RPC method name.
 * @param params        Positional params (Verus wire format is positional).
 * @param tolerateError Optional predicate: if it returns true for a JSON-RPC
 *                      error, the error is returned to the caller as a valid
 *                      response (used for decryptdata's -5 sentinel path).
 */
export async function rpcCall<T>(
  chain: ChainConfig,
  method: string,
  params: unknown[],
  tolerateError?: (err: RpcError) => boolean
): Promise<RpcResult<T>> {
  const attempts: Array<{ endpoint: string; reason: string }> = [];

  for (const endpoint of chain.endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const envelope = await postToEndpoint<T>(
        endpoint,
        method,
        params,
        controller.signal
      );
      clearTimeout(timeout);

      if (envelope.error) {
        // -32601 → method is absent on this endpoint, try the next.
        if (envelope.error.code === METHOD_NOT_FOUND) {
          attempts.push({
            endpoint,
            reason: `method-not-found: ${envelope.error.message}`,
          });
          continue;
        }
        // Caller-accepted domain error.
        if (tolerateError && tolerateError(envelope.error)) {
          throw new RpcDomainError(envelope.error, endpoint);
        }
        attempts.push({
          endpoint,
          reason: `rpc-error ${envelope.error.code}: ${envelope.error.message}`,
        });
        continue;
      }

      if (envelope.result === null || envelope.result === undefined) {
        attempts.push({ endpoint, reason: 'null result' });
        continue;
      }

      return { data: envelope.result, endpoint };
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof RpcDomainError) {
        throw err;
      }
      attempts.push({
        endpoint,
        reason: err instanceof Error ? err.message : String(err),
      });
      continue;
    }
  }

  throw new RpcFailureError(
    `All ${chain.endpoints.length} endpoint(s) failed for ${method}`,
    attempts
  );
}

/**
 * Thrown when the caller's tolerateError predicate matched. Carries the
 * original RPC error code + message + which endpoint served it.
 */
export class RpcDomainError extends Error {
  constructor(
    public readonly rpcError: RpcError,
    public readonly endpoint: string
  ) {
    super(`RPC ${rpcError.code}: ${rpcError.message}`);
    this.name = 'RpcDomainError';
  }
}
