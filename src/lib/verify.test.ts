import { describe, expect, it } from 'vitest';
import { crossCheckManifest, verifyImageHash } from './verify';
import { parseNft } from './cmm';
import { TESTNET_MANIFEST } from './manifest';
import piece3Raw from './__fixtures__/piece-3.json';

describe('verifyImageHash', () => {
  it('hashes "abc" to the known SHA-256 and reverses to LE', async () => {
    // SHA-256("abc") BE = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
    // LE-reversed =      ad1500f261ff10b49c7a1796a36103b02322ae5dde404141eacf018fbf1678ba
    const bytes = new TextEncoder().encode('abc');
    const expectedLE =
      'ad1500f261ff10b49c7a1796a36103b02322ae5dde404141eacf018fbf1678ba';
    const result = await verifyImageHash(bytes, expectedLE);
    expect(result.computedSha256BE).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
    expect(result.computedSha256LE).toBe(expectedLE);
    expect(result.ok).toBe(true);
  });

  it('reports mismatch on wrong expected value', async () => {
    const bytes = new TextEncoder().encode('abc');
    const wrong = '00'.repeat(32);
    const result = await verifyImageHash(bytes, wrong);
    expect(result.ok).toBe(false);
  });

  it('hashes empty bytes correctly', async () => {
    // SHA-256("") BE = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const result = await verifyImageHash(new Uint8Array(), '00'.repeat(32));
    expect(result.computedSha256BE).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });
});

describe('crossCheckManifest', () => {
  it('passes for piece 3 fixture against committed manifest', () => {
    const content = parseNft(piece3Raw);
    const piece = TESTNET_MANIFEST.pieces[0]!;
    const result = crossCheckManifest(content, piece);
    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports both mmrroot and image mismatches when both diverge', () => {
    const content = parseNft(piece3Raw);
    const piece = {
      ...TESTNET_MANIFEST.pieces[0]!,
      expectedImageUint256LE: 'ff'.repeat(32),
      expectedMmrRootLE: 'ee'.repeat(32),
    };
    const result = crossCheckManifest(content, piece);
    expect(result.ok).toBe(false);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]).toContain('image uint256 mismatch');
    expect(result.issues[1]).toContain('mmrroot mismatch');
  });
});
