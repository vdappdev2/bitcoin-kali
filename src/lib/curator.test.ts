import { describe, expect, it } from 'vitest';
import { parseCurator } from './curator';
import curatorRaw from './__fixtures__/curator.json';

describe('parseCurator', () => {
  const parsed = parseCurator(curatorRaw);

  it('extracts 8 DefinedKey URIs', () => {
    expect(parsed.definedKeys).toHaveLength(8);
    expect(parsed.definedKeyRaw).toHaveLength(8);
  });

  it('decodes the series1 class URI', () => {
    expect(parsed.definedKeys).toContain('kali.mcp3.vrsctest::series1');
  });

  it('decodes all expected series1 sub-keys', () => {
    const expected = [
      'kali.mcp3.vrsctest::series1',
      'kali.mcp3.vrsctest::series1.name',
      'kali.mcp3.vrsctest::series1.description',
      'kali.mcp3.vrsctest::series1.attributes',
      'kali.mcp3.vrsctest::series1.image',
      'kali.mcp3.vrsctest::series1.provenance',
      'kali.mcp3.vrsctest::series1.rights',
      'kali.mcp3.vrsctest::series1.delivery',
    ];
    for (const uri of expected) {
      expect(parsed.definedKeys).toContain(uri);
    }
  });

  it('extracts curator z-addr and evk', () => {
    expect(parsed.delivery.zaddr).toMatch(/^zs1/);
    expect(parsed.delivery.evk).toMatch(/^zxviews1/);
  });

  it('extracts both piece deliveries', () => {
    expect(parsed.delivery.deliveries).toHaveLength(2);

    const piece3 = parsed.delivery.deliveries.find(
      (d) => d.iaddress === 'iMLt3AGFAAYr9bXTJj8YKaU1Uty2Motv7x'
    );
    expect(piece3).toBeDefined();
    expect(piece3!.pngTxid).toBe(
      '67f26cb280bef69a08141ffb99e50883cb330a7374e006a61bc3cd5ed4b2a025'
    );
    expect(piece3!.filename).toBe(
      'kali-3-seed162-broken_press-mandala.png'
    );

    const piece5 = parsed.delivery.deliveries.find(
      (d) => d.iaddress === 'iEUEsdgany6hZfxhRGdFPsYFCZLAhmtjHW'
    );
    expect(piece5).toBeDefined();
    expect(piece5!.filename).toBe('kali-5-seed224-hourglass-moon.png');
  });
});
