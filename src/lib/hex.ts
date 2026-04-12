// Hex / bytes utilities.
//
// ENDIANNESS CONVENTION (verified against real chain data 2026-04-11):
//
//   Verus stores uint256 values (signature hashes, mmrroots, image hashes)
//   on-chain as LITTLE-ENDIAN hex. The browser's SubtleCrypto.digest
//   ('SHA-256', bytes) returns the standard BIG-ENDIAN hex. To compare the
//   two, reverse one of them byte-by-byte (not nibble-by-nibble).
//
//   Verified: Piece 3 on-chain uint256
//     82a6274adc77f594fd54f2426bfabfa069568df0b749227299cc3fecaacb6965
//   reversed byte-wise =
//     6569cbaaec3fcc99722249b7f08d5669a0bffa6b42f254fd94f577dc4a27a682
//   which matches `shasum -a 256` of the canonical PNG. Same convention holds
//   for the mmrroot vs the Phase 3 R2 recorded signature hash.
//
// All hex in this codebase is lowercase, unprefixed, even-length. These
// functions throw on anything else — fail loud, not silent.

const HEX_RE = /^[0-9a-f]*$/;

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error(`hexToBytes: odd-length hex (${hex.length})`);
  }
  const lower = hex.toLowerCase();
  if (!HEX_RE.test(lower)) {
    throw new Error('hexToBytes: non-hex character');
  }
  const out = new Uint8Array(lower.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(lower.substr(i * 2, 2), 16);
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Reverse a hex string byte-by-byte. Used to flip between on-chain
 * little-endian uint256 storage and browser big-endian SHA-256 output.
 * Input must be even-length; empty string is a valid no-op.
 */
export function reverseHex(hex: string): string {
  if (hex.length % 2 !== 0) {
    throw new Error(`reverseHex: odd-length hex (${hex.length})`);
  }
  let out = '';
  for (let i = hex.length - 2; i >= 0; i -= 2) {
    out += hex.substr(i, 2);
  }
  return out.toLowerCase();
}

/**
 * Decode a hex-encoded UTF-8 string. Used for message DDs whose objectdata
 * comes back as a hex blob (happens when the payload is JSON or other
 * non-plain-text content).
 */
export function hexToUtf8(hex: string): string {
  const bytes = hexToBytes(hex);
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}
