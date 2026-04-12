import {
  DATADESCRIPTOR_KEY,
  DEFINEDKEY_CLASS,
  LABEL_DELIVERY,
  SERIES1_OUTER_KEY,
} from './vdxf-keys';
import { hexToBytes, hexToUtf8 } from './hex';
import { extractContentMultiMap } from './cmm';

export type CuratorDelivery = {
  identity: string;
  iaddress: string;
  pngTxid: string;
  mmrdescriptorTxid: string;
  filename: string;
};

export type CuratorDeliverySummary = {
  zaddr: string;
  evk: string;
  deliveries: CuratorDelivery[];
};

export type CuratorContent = {
  /** Human-readable URIs decoded from the DefinedKey class array. */
  definedKeys: string[];
  /** Raw hex strings as stored on-chain (for the raw-JSON viewer). */
  definedKeyRaw: string[];
  /** Parsed delivery summary from the series1 outer key. */
  delivery: CuratorDeliverySummary;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Decode a DefinedKey class entry. On-chain shape is:
 *   <version:1 byte> <flags:1 byte> <length:CompactSize> <UTF-8 bytes>
 *
 * In practice all our keys are ≤252 chars so the length is one byte, but
 * we handle 0xfd (uint16 LE), 0xfe (uint32 LE), 0xff (uint64 LE) for safety.
 */
function decodeDefinedKey(hex: string): string {
  const bytes = hexToBytes(hex);
  if (bytes.length < 3) {
    throw new Error(`decodeDefinedKey: too short (${bytes.length} bytes)`);
  }
  // Skip version + flags (2 bytes).
  let offset = 2;
  const prefix = bytes[offset++]!;
  let length: number;
  if (prefix < 0xfd) {
    length = prefix;
  } else if (prefix === 0xfd) {
    length = bytes[offset]! | (bytes[offset + 1]! << 8);
    offset += 2;
  } else if (prefix === 0xfe) {
    length =
      bytes[offset]! |
      (bytes[offset + 1]! << 8) |
      (bytes[offset + 2]! << 16) |
      (bytes[offset + 3]! << 24);
    offset += 4;
  } else {
    throw new Error('decodeDefinedKey: 64-bit lengths not supported');
  }
  if (offset + length > bytes.length) {
    throw new Error('decodeDefinedKey: length overruns buffer');
  }
  const slice = bytes.subarray(offset, offset + length);
  return new TextDecoder('utf-8', { fatal: false }).decode(slice);
}

export function parseCurator(raw: unknown): CuratorContent {
  const cmm = extractContentMultiMap(raw);

  // ── DefinedKey class (hex array of schema URIs) ────────────────────────
  const rawKeys = cmm[DEFINEDKEY_CLASS];
  if (!Array.isArray(rawKeys)) {
    throw new Error('parseCurator: DefinedKey class outer key missing');
  }
  const definedKeyRaw: string[] = [];
  const definedKeys: string[] = [];
  for (const entry of rawKeys) {
    if (typeof entry !== 'string') {
      throw new Error('parseCurator: DefinedKey entry is not a hex string');
    }
    definedKeyRaw.push(entry);
    definedKeys.push(decodeDefinedKey(entry));
  }

  // ── Series1 delivery summary ───────────────────────────────────────────
  const seriesArray = cmm[SERIES1_OUTER_KEY];
  if (!Array.isArray(seriesArray)) {
    throw new Error('parseCurator: series1 outer key missing');
  }

  let deliverySummary: CuratorDeliverySummary | undefined;
  for (const entry of seriesArray) {
    if (!isObject(entry)) continue;
    const dd = entry[DATADESCRIPTOR_KEY];
    if (!isObject(dd)) continue;
    if (dd.label !== LABEL_DELIVERY) continue;

    let text: string;
    if (typeof dd.objectdata === 'string') {
      text = hexToUtf8(dd.objectdata);
    } else if (isObject(dd.objectdata) && typeof dd.objectdata.message === 'string') {
      text = dd.objectdata.message;
    } else {
      throw new Error('parseCurator: delivery DD has unexpected objectdata');
    }
    const parsed = JSON.parse(text) as CuratorDeliverySummary;
    if (
      typeof parsed.zaddr !== 'string' ||
      typeof parsed.evk !== 'string' ||
      !Array.isArray(parsed.deliveries)
    ) {
      throw new Error('parseCurator: delivery JSON has wrong shape');
    }
    deliverySummary = parsed;
    break;
  }

  if (!deliverySummary) {
    throw new Error('parseCurator: delivery summary not found in series1');
  }

  return { definedKeys, definedKeyRaw, delivery: deliverySummary };
}
