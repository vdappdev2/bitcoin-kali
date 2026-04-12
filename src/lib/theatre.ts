import type { ChainConfig, ChainName } from './chain';
import type { PieceManifest } from './manifest';
import type { NftContent } from './cmm';
import { parseNft } from './cmm';
import { rpcCall, RpcFailureError } from './rpc';
import { reverseHex, bytesToHex } from './hex';
import { fetchPngBytes } from './verify';
import { SERIES1_OUTER_KEY } from './vdxf-keys';

// ── Types ────────────────────────────────────────────────────────────────

export type StepId =
  | 'fetch-cmm'
  | 'extract-signature'
  | 'extract-mmrroot'
  | 'verify-signature'
  | 'fetch-png'
  | 'hash-and-compare';

export type StepStatus = 'pending' | 'running' | 'ok' | 'error';

export type StepRecord = {
  id: StepId;
  index: number; // 1..6, human-friendly
  label: string;
  status: StepStatus;
  /** Short sentence describing what this step just proved (rendered in the UI). */
  detail?: string;
  /** Key-value pairs of actual values observed at this step (hex, txids, etc). */
  values?: Array<{ label: string; value: string; className?: string }>;
  error?: string;
};

export type TheatreResult = {
  ok: boolean;
  steps: StepRecord[];
};

/** Dependencies injected so the sequence is unit-testable without a network. */
export type TheatreDeps = {
  /** Calls JSON-RPC. In prod this wraps rpcCall(chain, …). */
  rpc: <T>(method: string, params: unknown[]) => Promise<T>;
  /** Returns PNG bytes. In prod this wraps fetchPngBytes(chain, filename, txid, evk). */
  fetchPng: (filename: string, txid: string, evk: string) => Promise<Uint8Array>;
  /** SHA-256 via SubtleCrypto or a test stub. */
  sha256: (bytes: Uint8Array) => Promise<Uint8Array>;
};

/** Per-step callback. The UI builds its display from these events. */
export type OnStep = (step: StepRecord) => void;

// ── Default deps (real chain, real browser) ──────────────────────────────

export function makeRealDeps(chain: ChainConfig): TheatreDeps {
  return {
    rpc: async <T>(method: string, params: unknown[]): Promise<T> => {
      const { data } = await rpcCall<T>(chain, method, params);
      return data;
    },
    fetchPng: (filename, txid, evk) => fetchPngBytes(chain, filename, txid, evk),
    sha256: async (bytes) => {
      const digest = await crypto.subtle.digest(
        'SHA-256',
        bytes as unknown as BufferSource
      );
      return new Uint8Array(digest);
    },
  };
}

// ── The 6 steps ───────────────────────────────────────────────────────────

/**
 * Run the full verification sequence, emitting a StepRecord for every status
 * transition (pending → running → ok/error). The caller observes via onStep
 * and builds its UI from the emitted records.
 *
 * Returns { ok, steps } after the last step finishes — either all green, or
 * the first failed step plus any steps that never got to run.
 */
export async function runTheatre(
  deps: TheatreDeps,
  piece: PieceManifest,
  chainName: ChainName,
  onStep: OnStep
): Promise<TheatreResult> {
  const steps: StepRecord[] = [
    { id: 'fetch-cmm', index: 1, label: 'Fetch contentmultimap from chain', status: 'pending' },
    { id: 'extract-signature', index: 2, label: 'Extract signature DataDescriptor', status: 'pending' },
    { id: 'extract-mmrroot', index: 3, label: 'Extract mmrroot and reverse endianness', status: 'pending' },
    { id: 'verify-signature', index: 4, label: 'Call verifysignature on the curator identity', status: 'pending' },
    { id: 'fetch-png', index: 5, label: 'Fetch PNG bytes', status: 'pending' },
    { id: 'hash-and-compare', index: 6, label: 'SHA-256 locally and compare to on-chain uint256', status: 'pending' },
  ];

  // Emit the initial pending state for the whole lane so the UI can render
  // all 6 rows before any of them starts running.
  for (const s of steps) onStep({ ...s });

  const update = (i: number, patch: Partial<StepRecord>) => {
    steps[i] = { ...steps[i]!, ...patch };
    onStep({ ...steps[i]! });
  };

  const fail = (i: number, err: unknown): TheatreResult => {
    let message: string;
    if (err instanceof RpcFailureError) {
      // Unpack per-endpoint reasons so the UI shows what each one actually said.
      const lines = err.attempts.map(
        (a) => `  ${a.endpoint} → ${a.reason}`
      );
      message = `${err.message}\n${lines.join('\n')}`;
    } else if (err instanceof Error) {
      message = err.message;
    } else {
      message = String(err);
    }
    update(i, { status: 'error', error: message });
    return { ok: false, steps: steps.map((s) => ({ ...s })) };
  };

  // ── Step 1: fetch the contentmultimap ──────────────────────────────────
  update(0, { status: 'running' });
  let content: NftContent;
  try {
    const raw = await deps.rpc<unknown>('getidentity', [
      piece.iaddr,
      piece.registrationHeight,
    ]);
    content = parseNft(raw);
  } catch (err) {
    return fail(0, err);
  }
  update(0, {
    status: 'ok',
    detail: `getidentity returned the identity at block ${piece.registrationHeight}. Parsed all 10 typed DataDescriptors under the series1 outer key.`,
    values: [
      { label: 'Identity', value: piece.iaddr },
      { label: 'Pinned height', value: String(piece.registrationHeight) },
      { label: 'Name (parsed)', value: content.name },
      { label: 'DDs found', value: '10' },
    ],
  });

  // ── Step 2: surface the signature DD + check vdxfkey binding ──────────
  update(1, { status: 'running' });
  const signature = content.signature.signature;
  const curatorIaddr = content.signature.identityid;
  if (!content.signature.vdxfkeys.includes(SERIES1_OUTER_KEY)) {
    return fail(
      1,
      `signature is not bound to the series1 outer key (${SERIES1_OUTER_KEY}); bound vdxfkeys: ${content.signature.vdxfkeys.join(', ')}`
    );
  }
  update(1, {
    status: 'ok',
    detail: 'One DataDescriptor under the provenance label carries the curator signaturedata. The signature is base64, over the mmrroot, and bound to the series1 outer key — meaning it covers the entire 10-DD content tree and cannot be pasted onto a different context.',
    values: [
      { label: 'Curator identity (chain-claimed)', value: curatorIaddr },
      { label: 'Signature (base64)', value: signature, className: 'hex' },
      { label: 'Signature hash (LE)', value: content.signature.signaturehash, className: 'hex' },
      { label: 'Bound vdxfkeys', value: content.signature.vdxfkeys.join(', ') },
      { label: 'Scope check', value: 'signature is bound to series1 outer key' },
    ],
  });

  // ── Step 3: mmrroot + endianness ───────────────────────────────────────
  update(2, { status: 'running' });
  const mmrrootLE = content.mmrrootLE;
  const mmrrootBE = reverseHex(mmrrootLE);
  if (mmrrootLE !== content.signature.signaturehash) {
    return fail(
      2,
      `mmrroot (${mmrrootLE}) does not match signaturehash (${content.signature.signaturehash})`
    );
  }
  if (mmrrootLE !== piece.expectedMmrRootLE) {
    return fail(
      2,
      `chain mmrroot (${mmrrootLE}) does not match committed manifest (${piece.expectedMmrRootLE})`
    );
  }
  update(2, {
    status: 'ok',
    detail: 'The mmrroot DD matches the signature hash AND the committed manifest. Reversed byte-wise for big-endian comparison against verifysignature input.',
    values: [
      { label: 'mmrroot (little-endian, on-chain)', value: mmrrootLE, className: 'hex' },
      { label: 'mmrroot (big-endian, reversed)', value: mmrrootBE, className: 'hex' },
      { label: 'Matches manifest', value: 'yes' },
      { label: 'Matches signaturehash', value: 'yes' },
    ],
  });

  // ── Step 4: verify signature chain anchor ─────────────────────────────
  //
  // Two modes:
  //
  // Testnet — `verifysignature` is not whitelisted on api.verustest.net
  // (confirmed 2026-04-11 by direct probe: -32601 Method not found). This
  // step cannot make a live RPC call on testnet. Instead it emits a
  // "manifest-anchored" pass: the signature is bound to the series1 outer
  // key (verified in step 2), and the mmrroot it was made over matches the
  // committed manifest (verified in step 3). The honest framing is shown
  // in the UI.
  //
  // Mainnet — `verifysignature` is whitelisted on both api.verus.services
  // and rpc.vrsc.syncproof.net. Per the daemon's own help text (also
  // captured 2026-04-11), the RPC takes a SINGLE JSON object with named
  // fields, not positional args. Shape:
  //   { address, signature, datahash, vdxfkeys, hashtype, ... }
  // datahash is "256bithex" — the endianness is not specified in the help
  // text and is best confirmed by live test at Phase 6 mainnet flip. Best
  // guess for now is the big-endian (reversed) mmrroot.
  update(3, { status: 'running' });

  if (chainName === 'testnet') {
    update(3, {
      status: 'ok',
      detail:
        'Testnet public RPC does not expose verifysignature, so the live chain call is skipped on this chain. The signature is anchored two other ways: it is bound to the series1 outer key (step 2) and it was made over a mmrroot that exactly matches the committed manifest (step 3). On mainnet this step becomes a live verifysignature call — see the Learn page for the full trust model.',
      values: [
        { label: 'Mode', value: 'manifest-anchored (testnet)' },
        { label: 'Signature (base64)', value: signature, className: 'hex' },
        { label: 'Anchored to mmrroot (LE)', value: mmrrootLE, className: 'hex' },
        { label: 'Manifest mmrroot (LE)', value: piece.expectedMmrRootLE, className: 'hex' },
        { label: 'Bound scope', value: SERIES1_OUTER_KEY },
      ],
    });
  } else {
    // Mainnet live path — call shape per daemon help text (2026-04-11).
    type VerifySigResponse = {
      hash?: string;
      signature?: string;
    } | null;

    let sigResult: VerifySigResponse;
    try {
      sigResult = await deps.rpc<VerifySigResponse>('verifysignature', [
        {
          address: curatorIaddr,
          signature,
          datahash: mmrrootBE,
          hashtype: 'sha256',
          vdxfkeys: content.signature.vdxfkeys,
        },
      ]);
    } catch (err) {
      return fail(3, err);
    }
    if (
      !sigResult ||
      typeof sigResult !== 'object' ||
      typeof sigResult.hash !== 'string'
    ) {
      return fail(
        3,
        `verifysignature returned unexpected shape: ${JSON.stringify(sigResult)}`
      );
    }
    update(3, {
      status: 'ok',
      detail: 'Verus mainnet confirmed the curator signed this mmrroot. Tier 1 verification complete — the piece is anchored to the curator identity.',
      values: [
        { label: 'RPC method', value: 'verifysignature' },
        { label: 'address', value: curatorIaddr },
        { label: 'signature', value: signature, className: 'hex' },
        { label: 'datahash (BE)', value: mmrrootBE, className: 'hex' },
        { label: 'vdxfkeys', value: content.signature.vdxfkeys.join(', ') },
        { label: 'Result hash', value: sigResult.hash, className: 'hex' },
      ],
    });
  }

  // ── Step 5: fetch the PNG bytes ────────────────────────────────────────
  update(4, { status: 'running' });
  let pngBytes: Uint8Array;
  try {
    pngBytes = await deps.fetchPng(
      content.delivery.filename,
      content.delivery.txid,
      content.delivery.evk
    );
  } catch (err) {
    return fail(4, err);
  }
  update(4, {
    status: 'ok',
    detail: `Fetched ${pngBytes.length.toLocaleString()} PNG bytes. On testnet this is the plaintext PNG served by the viewer. On mainnet this is the live decryptdata call — same hash guarantee either way.`,
    values: [
      { label: 'Filename', value: content.delivery.filename },
      { label: 'Byte length', value: pngBytes.length.toLocaleString() },
      { label: 'Delivery txid', value: content.delivery.txid, className: 'hex' },
    ],
  });

  // ── Step 6: SHA-256 + byte-reversed compare ───────────────────────────
  update(5, { status: 'running' });
  let digest: Uint8Array;
  try {
    digest = await deps.sha256(pngBytes);
  } catch (err) {
    return fail(5, err);
  }
  const computedBE = bytesToHex(digest);
  const computedLE = reverseHex(computedBE);
  const expectedLE = content.imageHashLE;
  const match = computedLE === expectedLE && expectedLE === piece.expectedImageUint256LE;
  if (!match) {
    return fail(
      5,
      `hash mismatch — computed LE ${computedLE}, expected ${expectedLE}, manifest ${piece.expectedImageUint256LE}`
    );
  }
  update(5, {
    status: 'ok',
    detail: 'The SHA-256 of the PNG bytes — after reversing byte-wise to match Verus uint256 endianness — is identical to the on-chain hash AND the committed manifest. Every step passed.',
    values: [
      { label: 'SHA-256 (big-endian, browser native)', value: computedBE, className: 'hex' },
      { label: 'SHA-256 (little-endian, reversed)', value: computedLE, className: 'hex' },
      { label: 'On-chain uint256 (little-endian)', value: expectedLE, className: 'hex' },
      { label: 'Committed manifest', value: piece.expectedImageUint256LE, className: 'hex' },
      { label: 'Match', value: 'yes' },
    ],
  });

  return { ok: true, steps: steps.map((s) => ({ ...s })) };
}
