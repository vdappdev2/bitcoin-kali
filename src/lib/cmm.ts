import {
  CROSSCHAINDATAREF_TYPE,
  DATADESCRIPTOR_KEY,
  LABEL_ATTRIBUTES,
  LABEL_DELIVERY,
  LABEL_DESCRIPTION,
  LABEL_IMAGE,
  LABEL_NAME,
  LABEL_PROVENANCE,
  LABEL_RIGHTS,
  SERIES1_OUTER_KEY,
  SIGNATUREDATA_TYPE,
} from './vdxf-keys';
import { hexToUtf8 } from './hex';

// ── Output types ──────────────────────────────────────────────────────────

export type CrossChainDataRef = {
  txid: string;
  voutnum: number;
};

export type SignatureData = {
  identityid: string;
  signature: string;
  signaturehash: string;
  signaturetype: number;
  systemid: string;
  vdxfkeys: string[];
  version: number;
  hashtype: number;
};

export type AttributesJson = {
  name?: string;
  edition?: string;
  bitcoinItem?: string;
  background?: string;
  seed?: number;
  generatorVersion?: string;
  identity?: string;
  iaddress?: string;
  [key: string]: unknown;
};

export type DeliveryJson = {
  zaddr: string;
  evk: string;
  txid: string;
  filename: string;
  [key: string]: unknown;
};

export type NftContent = {
  // Display fields
  name: string;
  description: string;
  attributes: AttributesJson;
  rights: string;
  delivery: DeliveryJson;

  // Image (two DDs sharing a label)
  imageRef: CrossChainDataRef;
  imageHashLE: string;

  // Provenance (three DDs sharing a label)
  signature: SignatureData;
  mmrrootLE: string;
  mmrdescriptorRef: CrossChainDataRef;
};

// ── Raw input types (loose — we validate as we walk) ──────────────────────

type RawDataDescriptor = {
  flags: number;
  label: string;
  mimetype?: string;
  objectdata: unknown;
  version: number;
};

type RawCmmEntry = { [key: string]: RawDataDescriptor };

type RawIdentityResponse = {
  result?: {
    identity?: {
      contentmultimap?: Record<string, RawCmmEntry[]>;
    };
  };
  identity?: {
    contentmultimap?: Record<string, RawCmmEntry[]>;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function extractMessageText(dd: RawDataDescriptor): string {
  // Plain-text message: objectdata = { message: "..." }
  if (isObject(dd.objectdata) && typeof dd.objectdata.message === 'string') {
    return dd.objectdata.message;
  }
  // Hex-encoded (e.g. application/json payload longer than inline threshold).
  if (typeof dd.objectdata === 'string') {
    return hexToUtf8(dd.objectdata);
  }
  throw new Error(`extractMessageText: unexpected shape for label ${dd.label}`);
}

function extractTypedPayload(
  dd: RawDataDescriptor,
  typeKey: string
): Record<string, unknown> {
  if (!isObject(dd.objectdata)) {
    throw new Error(
      `extractTypedPayload: expected object for ${typeKey}, got ${typeof dd.objectdata}`
    );
  }
  const inner = dd.objectdata[typeKey];
  if (!isObject(inner)) {
    throw new Error(
      `extractTypedPayload: type key ${typeKey} missing or not an object`
    );
  }
  return inner;
}

function parseCrossChainDataRef(dd: RawDataDescriptor): CrossChainDataRef {
  const inner = extractTypedPayload(dd, CROSSCHAINDATAREF_TYPE);
  const output = inner.output;
  if (!isObject(output)) {
    throw new Error('parseCrossChainDataRef: missing output object');
  }
  if (typeof output.txid !== 'string' || typeof output.voutnum !== 'number') {
    throw new Error('parseCrossChainDataRef: bad output shape');
  }
  return { txid: output.txid, voutnum: output.voutnum };
}

function parseSignatureData(dd: RawDataDescriptor): SignatureData {
  const inner = extractTypedPayload(dd, SIGNATUREDATA_TYPE);
  if (
    typeof inner.identityid !== 'string' ||
    typeof inner.signature !== 'string' ||
    typeof inner.signaturehash !== 'string' ||
    typeof inner.signaturetype !== 'number' ||
    typeof inner.systemid !== 'string' ||
    !Array.isArray(inner.vdxfkeys) ||
    typeof inner.version !== 'number' ||
    typeof inner.hashtype !== 'number'
  ) {
    throw new Error('parseSignatureData: bad signaturedata shape');
  }
  return {
    identityid: inner.identityid,
    signature: inner.signature,
    signaturehash: inner.signaturehash,
    signaturetype: inner.signaturetype,
    systemid: inner.systemid,
    vdxfkeys: inner.vdxfkeys as string[],
    version: inner.version,
    hashtype: inner.hashtype,
  };
}

function parseUint256(dd: RawDataDescriptor): string {
  if (typeof dd.objectdata !== 'string') {
    throw new Error('parseUint256: objectdata is not a string');
  }
  // Store exactly as chain returned it (little-endian).
  return dd.objectdata.toLowerCase();
}

// ── Main parser ───────────────────────────────────────────────────────────

/**
 * Parse a raw `getidentity` response into a normalized NftContent.
 * Accepts either the full JSON-RPC envelope or the bare `result` object.
 */
export function parseNft(raw: unknown): NftContent {
  const outer = extractContentMultiMap(raw);
  const seriesArray = outer[SERIES1_OUTER_KEY];
  if (!Array.isArray(seriesArray)) {
    throw new Error('parseNft: series1 outer key missing or not an array');
  }

  // Unwrap each entry's DATADESCRIPTOR_KEY wrapper.
  const dds: RawDataDescriptor[] = seriesArray.map((entry, i) => {
    if (!isObject(entry)) {
      throw new Error(`parseNft: entry ${i} is not an object`);
    }
    const inner = entry[DATADESCRIPTOR_KEY];
    if (!isObject(inner)) {
      throw new Error(`parseNft: entry ${i} missing DataDescriptor wrapper`);
    }
    return inner as unknown as RawDataDescriptor;
  });

  // Slot holders — filled as we classify.
  let name: string | undefined;
  let description: string | undefined;
  let attributes: AttributesJson | undefined;
  let rights: string | undefined;
  let delivery: DeliveryJson | undefined;
  let imageRef: CrossChainDataRef | undefined;
  let imageHashLE: string | undefined;
  let signature: SignatureData | undefined;
  let mmrrootLE: string | undefined;
  let mmrdescriptorRef: CrossChainDataRef | undefined;

  for (const dd of dds) {
    switch (dd.label) {
      case LABEL_NAME:
        name = extractMessageText(dd);
        break;
      case LABEL_DESCRIPTION:
        description = extractMessageText(dd);
        break;
      case LABEL_ATTRIBUTES:
        attributes = JSON.parse(extractMessageText(dd)) as AttributesJson;
        break;
      case LABEL_RIGHTS:
        rights = extractMessageText(dd);
        break;
      case LABEL_DELIVERY:
        delivery = JSON.parse(extractMessageText(dd)) as DeliveryJson;
        break;
      case LABEL_IMAGE:
        // Two DDs share this label. Discriminate by objectdata shape:
        // raw hex string → uint256 image hash; typed object → crosschaindataref.
        if (typeof dd.objectdata === 'string') {
          imageHashLE = parseUint256(dd);
        } else {
          imageRef = parseCrossChainDataRef(dd);
        }
        break;
      case LABEL_PROVENANCE:
        // Three DDs share this label. Discriminate by objectdata shape:
        // - string → uint256 mmrroot
        // - object with SIGNATUREDATA_TYPE key → signature
        // - object with CROSSCHAINDATAREF_TYPE key → mmrdescriptor_ref
        if (typeof dd.objectdata === 'string') {
          mmrrootLE = parseUint256(dd);
        } else if (isObject(dd.objectdata)) {
          if (SIGNATUREDATA_TYPE in dd.objectdata) {
            signature = parseSignatureData(dd);
          } else if (CROSSCHAINDATAREF_TYPE in dd.objectdata) {
            mmrdescriptorRef = parseCrossChainDataRef(dd);
          } else {
            throw new Error(
              'parseNft: provenance DD objectdata missing known type key'
            );
          }
        } else {
          throw new Error('parseNft: provenance DD has unexpected objectdata');
        }
        break;
      default:
        // Unknown label — ignore rather than fail, to allow future CMMs to
        // carry extra slots without bricking older viewers. If a required
        // slot ends up missing, the completeness check below will catch it.
        break;
    }
  }

  const missing: string[] = [];
  if (name === undefined) missing.push('name');
  if (description === undefined) missing.push('description');
  if (attributes === undefined) missing.push('attributes');
  if (rights === undefined) missing.push('rights');
  if (delivery === undefined) missing.push('delivery');
  if (imageRef === undefined) missing.push('imageRef');
  if (imageHashLE === undefined) missing.push('imageHashLE');
  if (signature === undefined) missing.push('signature');
  if (mmrrootLE === undefined) missing.push('mmrrootLE');
  if (mmrdescriptorRef === undefined) missing.push('mmrdescriptorRef');
  if (missing.length > 0) {
    throw new Error(`parseNft: missing required slots: ${missing.join(', ')}`);
  }

  return {
    name: name!,
    description: description!,
    attributes: attributes!,
    rights: rights!,
    delivery: delivery!,
    imageRef: imageRef!,
    imageHashLE: imageHashLE!,
    signature: signature!,
    mmrrootLE: mmrrootLE!,
    mmrdescriptorRef: mmrdescriptorRef!,
  };
}

/**
 * Extract the contentmultimap from either a full JSON-RPC envelope, a bare
 * identity `result` object, or an already-unwrapped `identity` object.
 */
export function extractContentMultiMap(
  raw: unknown
): Record<string, RawCmmEntry[]> {
  if (!isObject(raw)) {
    throw new Error('extractContentMultiMap: input is not an object');
  }
  const typed = raw as RawIdentityResponse;
  const viaResult = typed.result?.identity?.contentmultimap;
  if (viaResult) return viaResult as Record<string, RawCmmEntry[]>;
  const viaIdentity = typed.identity?.contentmultimap;
  if (viaIdentity) return viaIdentity as Record<string, RawCmmEntry[]>;
  // Already-unwrapped contentmultimap (e.g. injected directly in tests).
  if ('contentmultimap' in (raw as Record<string, unknown>)) {
    const cmm = (raw as { contentmultimap: unknown }).contentmultimap;
    if (isObject(cmm)) return cmm as Record<string, RawCmmEntry[]>;
  }
  throw new Error('extractContentMultiMap: no contentmultimap found');
}
