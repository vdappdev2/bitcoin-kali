import { describe, expect, it } from 'vitest';
import { bytesToHex, hexToBytes, hexToUtf8, reverseHex } from './hex';

describe('hex utilities', () => {
  it('round-trips hex ↔ bytes', () => {
    const original = 'deadbeef00ff1234';
    const bytes = hexToBytes(original);
    expect(bytes).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0xff, 0x12, 0x34]));
    expect(bytesToHex(bytes)).toBe(original);
  });

  it('lowercases uppercase hex input', () => {
    expect(bytesToHex(hexToBytes('DEADBEEF'))).toBe('deadbeef');
  });

  it('rejects odd-length hex', () => {
    expect(() => hexToBytes('abc')).toThrow(/odd-length/);
    expect(() => reverseHex('abc')).toThrow(/odd-length/);
  });

  it('rejects non-hex characters', () => {
    expect(() => hexToBytes('zz')).toThrow(/non-hex/);
  });

  it('reverses bytes correctly (verified against real on-chain value)', () => {
    // Piece 3 on-chain uint256 (little-endian) → reversed matches browser SHA-256 (BE)
    const LE = '82a6274adc77f594fd54f2426bfabfa069568df0b749227299cc3fecaacb6965';
    const BE = '6569cbaaec3fcc99722249b7f08d5669a0bffa6b42f254fd94f577dc4a27a682';
    expect(reverseHex(LE)).toBe(BE);
    expect(reverseHex(BE)).toBe(LE);
  });

  it('reverseHex is self-inverse', () => {
    const sample = 'f51e823761a22a24c9978cdcd5cbddd879295f5e129ea57a9742dd6cc373aae4';
    expect(reverseHex(reverseHex(sample))).toBe(sample);
  });

  it('decodes hex to UTF-8', () => {
    // "hello" in UTF-8 hex
    expect(hexToUtf8('68656c6c6f')).toBe('hello');
    // Multi-byte codepoint: ā = U+0101 = 0xc4 0x81
    expect(hexToUtf8('c481')).toBe('ā');
  });
});
