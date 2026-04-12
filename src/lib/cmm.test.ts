import { describe, expect, it } from 'vitest';
import { parseNft } from './cmm';
import { TESTNET_MANIFEST } from './manifest';
import { crossCheckManifest } from './verify';
import piece3Raw from './__fixtures__/piece-3.json';
import piece5Raw from './__fixtures__/piece-5.json';

describe('parseNft — Piece 3', () => {
  const parsed = parseNft(piece3Raw);

  it('extracts Sanskrit name', () => {
    expect(parsed.name).toBe('Malanāśinī');
  });

  it('extracts verse description', () => {
    expect(parsed.description).toContain('The press of debasement is broken');
    expect(parsed.description).toContain('mandala of pure form');
  });

  it('parses attributes JSON', () => {
    expect(parsed.attributes.name).toBe('Malanāśinī');
    expect(parsed.attributes.seed).toBe(162);
    expect(parsed.attributes.bitcoinItem).toBe('broken_press');
    expect(parsed.attributes.background).toBe('mandala');
    expect(parsed.attributes.iaddress).toBe('iMLt3AGFAAYr9bXTJj8YKaU1Uty2Motv7x');
  });

  it('extracts image crosschaindataref', () => {
    expect(parsed.imageRef.txid).toBe(
      '67f26cb280bef69a08141ffb99e50883cb330a7374e006a61bc3cd5ed4b2a025'
    );
    expect(parsed.imageRef.voutnum).toBe(0);
  });

  it('extracts image uint256 (LE) matching manifest', () => {
    expect(parsed.imageHashLE).toBe(
      '82a6274adc77f594fd54f2426bfabfa069568df0b749227299cc3fecaacb6965'
    );
  });

  it('extracts signature block', () => {
    expect(parsed.signature.identityid).toBe('i4iSua6dwQHC3GVxoPbPYmGjx9YkmMWVsL');
    expect(parsed.signature.signature).toMatch(/^AgX/); // base64 sig prefix
    expect(parsed.signature.vdxfkeys).toContain('iAvwpt4AucNRk3sN1pCHYVDnNge5QWyKLh');
  });

  it('extracts mmrroot matching signaturehash', () => {
    expect(parsed.mmrrootLE).toBe(
      'f51e823761a22a24c9978cdcd5cbddd879295f5e129ea57a9742dd6cc373aae4'
    );
    // The mmrroot IS the datahash that was signed, so it matches signaturehash.
    expect(parsed.signature.signaturehash).toBe(parsed.mmrrootLE);
  });

  it('extracts mmrdescriptor crosschaindataref', () => {
    expect(parsed.mmrdescriptorRef.txid).toBe(
      'f60509414478c6866b739fe522332bcd23fb414a3aab316cf5e511680079c467'
    );
    expect(parsed.mmrdescriptorRef.voutnum).toBe(0);
  });

  it('extracts rights assertion', () => {
    expect(parsed.rights).toContain('Bitcoin Kali Series 1');
    expect(parsed.rights).toContain('limited set of seven');
  });

  it('parses delivery JSON', () => {
    expect(parsed.delivery.zaddr).toMatch(/^zs1/);
    expect(parsed.delivery.evk).toMatch(/^zxviews1/);
    expect(parsed.delivery.txid).toBe(
      '67f26cb280bef69a08141ffb99e50883cb330a7374e006a61bc3cd5ed4b2a025'
    );
    expect(parsed.delivery.filename).toBe(
      'kali-3-seed162-broken_press-mandala.png'
    );
  });

  it('cross-checks against manifest cleanly', () => {
    const piece = TESTNET_MANIFEST.pieces[0]!;
    const result = crossCheckManifest(parsed, piece);
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });
});

describe('parseNft — Piece 5', () => {
  const parsed = parseNft(piece5Raw);

  it('has a Sanskrit name', () => {
    expect(parsed.name.length).toBeGreaterThan(0);
  });

  it('image hash matches manifest', () => {
    expect(parsed.imageHashLE).toBe(
      'b978b0d31b4054ca05a2e1aa226bb27e2edd5c360fdeab99a917d0eeefdcdf77'
    );
  });

  it('mmrroot matches manifest', () => {
    expect(parsed.mmrrootLE).toBe(
      '547a1d87631792fa4bf52effcd7b4466543a1012d5a15ef68791846b06f162ab'
    );
  });

  it('cross-checks against manifest cleanly', () => {
    const piece = TESTNET_MANIFEST.pieces[1]!;
    const result = crossCheckManifest(parsed, piece);
    expect(result.ok).toBe(true);
  });

  it('detects tampered manifest value', () => {
    const piece = TESTNET_MANIFEST.pieces[1]!;
    const tampered = { ...piece, expectedImageUint256LE: 'deadbeef'.repeat(8) };
    const result = crossCheckManifest(parsed, tampered);
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
