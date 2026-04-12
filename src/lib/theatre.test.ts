import { describe, expect, it } from 'vitest';
import { runTheatre, type StepRecord, type TheatreDeps } from './theatre';
import { TESTNET_MANIFEST } from './manifest';
import piece3Raw from './__fixtures__/piece-3.json';
import { hexToBytes, reverseHex } from './hex';
import type { ChainName } from './chain';

// Build deps that feed the theatre the piece-3 fixture + a synthetic PNG
// whose SHA-256 matches the fixture's image uint256. The synthetic PNG is
// NOT the real PNG — we're testing orchestration, not byte authenticity.
// To make step 6 match, we stub sha256() to return bytes equal to reversed
// (big-endian) form of the fixture's on-chain uint256.

const PIECE_3 = TESTNET_MANIFEST.pieces[0]!;

function makeStubDeps(overrides: Partial<TheatreDeps> = {}): TheatreDeps {
  return {
    rpc: async <T>(method: string, params: unknown[]): Promise<T> => {
      if (method === 'getidentity') {
        return piece3Raw as unknown as T;
      }
      if (method === 'verifysignature') {
        // Mainnet-mode mock: return the { hash, signature } shape the Verus
        // daemon help text says verifysignature returns on success.
        return {
          hash: 'e4aa73c36cdd42977aa59e125e5f2979d8ddcbd5dc8c97c9242aa26137821ef5',
          signature: 'stubbed-sig',
        } as unknown as T;
      }
      throw new Error(`unexpected rpc call: ${method} ${JSON.stringify(params)}`);
    },
    fetchPng: async () => new Uint8Array([0x89, 0x50, 0x4e, 0x47]), // PNG magic, content irrelevant
    sha256: async () => {
      // Return bytes whose hex (as big-endian) reverses to the fixture LE uint256.
      const leHex = PIECE_3.expectedImageUint256LE;
      const beHex = reverseHex(leHex);
      return hexToBytes(beHex);
    },
    ...overrides,
  };
}

async function collectRun(
  deps: TheatreDeps,
  chainName: ChainName = 'mainnet'
) {
  const events: StepRecord[] = [];
  const result = await runTheatre(deps, PIECE_3, chainName, (s) =>
    events.push({ ...s })
  );
  return { events, result };
}

describe('runTheatre', () => {
  it('completes all 6 steps with ok=true on the happy path', async () => {
    const { result, events } = await collectRun(makeStubDeps());
    expect(result.ok).toBe(true);
    expect(result.steps).toHaveLength(6);
    expect(result.steps.every((s) => s.status === 'ok')).toBe(true);

    // Events include initial pending for all 6, then running+ok transitions.
    // At minimum we should see each step id at 'running' and 'ok'.
    for (const id of [
      'fetch-cmm',
      'extract-signature',
      'extract-mmrroot',
      'verify-signature',
      'fetch-png',
      'hash-and-compare',
    ] as const) {
      const hits = events.filter((e) => e.id === id);
      expect(hits.some((e) => e.status === 'running')).toBe(true);
      expect(hits.some((e) => e.status === 'ok')).toBe(true);
    }
  });

  it('step 1 surfaces parsed name and pinned height', async () => {
    const { result } = await collectRun(makeStubDeps());
    const step1 = result.steps[0]!;
    expect(step1.id).toBe('fetch-cmm');
    const name = step1.values?.find((v) => v.label === 'Name (parsed)');
    expect(name?.value).toBe('Malanāśinī');
  });

  it('step 3 exposes both LE and BE mmrroot hex', async () => {
    const { result } = await collectRun(makeStubDeps());
    const step3 = result.steps[2]!;
    const le = step3.values?.find((v) => v.label.includes('little-endian'));
    const be = step3.values?.find((v) => v.label.includes('big-endian'));
    expect(le?.value).toBe(PIECE_3.expectedMmrRootLE);
    expect(be?.value).toBe(reverseHex(PIECE_3.expectedMmrRootLE));
  });

  it('step 4 on mainnet sends a single JSON-object param to verifysignature', async () => {
    let captured: unknown[] | null = null;
    const deps = makeStubDeps({
      rpc: async <T>(method: string, params: unknown[]): Promise<T> => {
        if (method === 'verifysignature') {
          captured = params;
          return {
            hash: 'whatever',
            signature: 'stubbed-sig',
          } as unknown as T;
        }
        if (method === 'getidentity') return piece3Raw as unknown as T;
        throw new Error('unexpected');
      },
    });
    const { result } = await collectRun(deps, 'mainnet');
    expect(result.ok).toBe(true);
    expect(captured).not.toBeNull();
    // Single JSON object, not positional args.
    expect(captured!.length).toBe(1);
    const obj = captured![0] as Record<string, unknown>;
    expect(obj.address).toBe('i4iSua6dwQHC3GVxoPbPYmGjx9YkmMWVsL');
    expect(obj.datahash).toBe(reverseHex(PIECE_3.expectedMmrRootLE));
    expect(typeof obj.signature).toBe('string');
    expect(obj.hashtype).toBe('sha256');
    expect(Array.isArray(obj.vdxfkeys)).toBe(true);
  });

  it('stops at step 4 on mainnet when verifysignature returns an unexpected shape', async () => {
    const deps = makeStubDeps({
      rpc: async <T>(method: string): Promise<T> => {
        if (method === 'getidentity') return piece3Raw as unknown as T;
        if (method === 'verifysignature') return null as unknown as T;
        throw new Error('unexpected');
      },
    });
    const { result } = await collectRun(deps, 'mainnet');
    expect(result.ok).toBe(false);
    const step4 = result.steps[3]!;
    expect(step4.status).toBe('error');
    expect(step4.error).toContain('unexpected shape');
    // Step 5 and 6 never advanced.
    expect(result.steps[4]!.status).toBe('pending');
    expect(result.steps[5]!.status).toBe('pending');
  });

  it('on testnet, step 4 does NOT call verifysignature (method not whitelisted)', async () => {
    let rpcCalls: string[] = [];
    const deps = makeStubDeps({
      rpc: async <T>(method: string): Promise<T> => {
        rpcCalls.push(method);
        if (method === 'getidentity') return piece3Raw as unknown as T;
        // If the theatre tried to call verifysignature here we'd throw;
        // it must not reach this branch on testnet.
        throw new Error(`testnet should not call ${method}`);
      },
    });
    const { result } = await collectRun(deps, 'testnet');
    expect(result.ok).toBe(true);
    expect(result.steps).toHaveLength(6);
    expect(result.steps.every((s) => s.status === 'ok')).toBe(true);
    // Only getidentity was called (once, at step 1). verifysignature was
    // skipped entirely.
    expect(rpcCalls).toEqual(['getidentity']);
    // Step 4's detail should mark it as manifest-anchored mode.
    const step4 = result.steps[3]!;
    const modeValue = step4.values?.find((v) => v.label === 'Mode');
    expect(modeValue?.value).toContain('manifest-anchored');
  });

  it('stops at step 6 when the served PNG hash mismatches', async () => {
    const deps = makeStubDeps({
      // Hash returns something that will not reverse to the expected LE uint256.
      sha256: async () => new Uint8Array(32),
    });
    const { result } = await collectRun(deps);
    expect(result.ok).toBe(false);
    const step6 = result.steps[5]!;
    expect(step6.status).toBe('error');
    expect(step6.error).toContain('hash mismatch');
  });

  it('halts at step 2 if the signature is not bound to series1', async () => {
    // Build a fixture variant where the signaturedata's vdxfkeys list points
    // at a different outer key. Attack scenario: a legitimate signature over
    // the curator's OTHER content being pasted into the series1 slot.
    const tamperedRaw = JSON.parse(JSON.stringify(piece3Raw)) as typeof piece3Raw;
    // Walk to the signaturedata DD and swap its vdxfkeys list.
    type CmmArray = Array<{
      i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv: {
        label: string;
        objectdata:
          | string
          | { i7PcVF9wwPtQ6p6jDtCVpohX65pTZuP2ah?: { vdxfkeys: string[] } };
      };
    }>;
    const seriesArray = (
      tamperedRaw.result.identity.contentmultimap as Record<string, CmmArray>
    )['iAvwpt4AucNRk3sN1pCHYVDnNge5QWyKLh']!;
    for (const entry of seriesArray) {
      const dd = entry.i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv;
      if (typeof dd.objectdata === 'object' && dd.objectdata.i7PcVF9wwPtQ6p6jDtCVpohX65pTZuP2ah) {
        dd.objectdata.i7PcVF9wwPtQ6p6jDtCVpohX65pTZuP2ah.vdxfkeys = [
          'iDifferentOuterKeyAbcDefGhiJklMnoPq',
        ];
      }
    }

    const deps = makeStubDeps({
      rpc: async <T>(method: string): Promise<T> => {
        if (method === 'getidentity') return tamperedRaw as unknown as T;
        if (method === 'verifysignature') return true as unknown as T;
        throw new Error('unexpected');
      },
    });
    const { result } = await collectRun(deps);
    expect(result.ok).toBe(false);
    const step2 = result.steps[1]!;
    expect(step2.status).toBe('error');
    expect(step2.error).toContain('series1 outer key');
    // Steps 3-6 never ran.
    expect(result.steps.slice(2).every((s) => s.status === 'pending')).toBe(true);
  });

  it('propagates RPC failures cleanly (step 1 network failure)', async () => {
    const deps = makeStubDeps({
      rpc: async () => {
        throw new Error('HTTP 503 Service Unavailable');
      },
    });
    const { result } = await collectRun(deps);
    expect(result.ok).toBe(false);
    expect(result.steps[0]!.status).toBe('error');
    expect(result.steps[0]!.error).toContain('503');
    // Nothing else ran.
    expect(result.steps.slice(1).every((s) => s.status === 'pending')).toBe(true);
  });
});
