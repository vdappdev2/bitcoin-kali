import type { ChainConfig } from './chain';
import type { NftContent } from './cmm';
import type { PieceManifest } from './manifest';
import { bytesToHex, hexToBytes, reverseHex } from './hex';
import { rpcCall, RpcDomainError } from './rpc';

// ── Image hash ────────────────────────────────────────────────────────────

export type ImageHashResult = {
  /** SHA-256 computed locally, big-endian hex (browser-native). */
  computedSha256BE: string;
  /** Same hash reversed to little-endian for comparison against on-chain. */
  computedSha256LE: string;
  /** Little-endian hex pulled from the chain. */
  expectedUint256LE: string;
  ok: boolean;
};

/**
 * Hash PNG bytes and compare to an on-chain uint256 (stored little-endian).
 * Uses SubtleCrypto, which is available in all evergreen browsers and Node ≥16.
 */
export async function verifyImageHash(
  pngBytes: Uint8Array,
  expectedUint256LE: string
): Promise<ImageHashResult> {
  // SubtleCrypto accepts BufferSource but TypeScript's DOM lib narrows the
  // Uint8Array generic; cast to BufferSource to satisfy both the runtime and
  // the checker under strict mode.
  const digest = await crypto.subtle.digest('SHA-256', pngBytes as unknown as BufferSource);
  const computedSha256BE = bytesToHex(new Uint8Array(digest));
  const computedSha256LE = reverseHex(computedSha256BE);
  return {
    computedSha256BE,
    computedSha256LE,
    expectedUint256LE: expectedUint256LE.toLowerCase(),
    ok: computedSha256LE === expectedUint256LE.toLowerCase(),
  };
}

// Note: signature verify (Tier 1) lives inline in theatre.ts step 4, because
// it's chain-branched (testnet = manifest-anchored pass, mainnet = live
// verifysignature RPC with a JSON-object param shape). There's no single
// reusable wrapper for it in this module.

// ── Manifest cross-check ──────────────────────────────────────────────────

export type ManifestCrossCheckResult = {
  ok: boolean;
  issues: string[];
};

/**
 * After parsing a piece, confirm the chain-returned mmrroot and image
 * uint256 match the committed manifest. Any divergence → refuse to render.
 */
export function crossCheckManifest(
  content: NftContent,
  expected: PieceManifest
): ManifestCrossCheckResult {
  const issues: string[] = [];
  if (content.imageHashLE !== expected.expectedImageUint256LE) {
    issues.push(
      `image uint256 mismatch: chain=${content.imageHashLE} manifest=${expected.expectedImageUint256LE}`
    );
  }
  if (content.mmrrootLE !== expected.expectedMmrRootLE) {
    issues.push(
      `mmrroot mismatch: chain=${content.mmrrootLE} manifest=${expected.expectedMmrRootLE}`
    );
  }
  return { ok: issues.length === 0, issues };
}

// ── PNG bytes fetching (always via decryptdata) ─────────────────────────

/**
 * Generic memo DD used for every sendcurrency file delivery. Observed byte-
 * identical across all deliveries on the curator z-addr (Phase 4 Step 1).
 * The real per-tx decryption happens server-side inside decryptdata; we only
 * pass this sentinel wrapper so the daemon knows the shape we expect back.
 */
export const GENERIC_MEMO_DD = {
  version: 1,
  flags: 0,
  objectdata: {
    iP3euVSzNcXUrLNHnQnR9G6q8jeYuGSxgw: {
      type: 0,
      version: 1,
      flags: 1,
      output: {
        txid: '0000000000000000000000000000000000000000000000000000000000000000',
        voutnum: 0,
      },
      objectnum: 0,
      subobject: 0,
    },
  },
} as const;

export type DecryptDataResponse = Array<{
  version: number;
  flags: number;
  objectdata: string;
  salt: string;
}>;

/** In-memory cache: deliveryTxid → PNG bytes. Survives navigation within
 *  a single session so the gallery ↔ piece transitions don't re-decrypt. */
const pngCache = new Map<string, Uint8Array>();

/**
 * Fetch the PNG bytes for a piece via `decryptdata`.
 *
 * Calls the chain's dedicated `decryptEndpoint` directly (skipping the
 * general failover loop) so we don't waste a round-trip on endpoints
 * that don't whitelist decryptdata. Results are cached in memory.
 */
export async function fetchPngBytes(
  chain: ChainConfig,
  _filename: string,
  deliveryTxid: string,
  evk: string
): Promise<Uint8Array> {
  const cached = pngCache.get(deliveryTxid);
  if (cached) return cached;

  // Target the decrypt endpoint directly.
  const decryptChain: ChainConfig = {
    ...chain,
    endpoints: [chain.decryptEndpoint],
  };

  try {
    const { data } = await rpcCall<DecryptDataResponse>(
      decryptChain,
      'decryptdata',
      [
        {
          datadescriptor: GENERIC_MEMO_DD,
          evk,
          txid: deliveryTxid,
          retrieve: true,
        },
      ],
      (err) => err.code === -5
    );
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('fetchPngBytes: decryptdata returned empty array');
    }
    const hex = data[0]?.objectdata;
    if (typeof hex !== 'string') {
      throw new Error('fetchPngBytes: decryptdata result missing objectdata hex');
    }
    const bytes = hexToBytes(hex);
    pngCache.set(deliveryTxid, bytes);
    return bytes;
  } catch (err) {
    if (err instanceof RpcDomainError) {
      throw new Error(
        `fetchPngBytes: decryptdata failed with ${err.rpcError.code} ${err.rpcError.message}`
      );
    }
    throw err;
  }
}
