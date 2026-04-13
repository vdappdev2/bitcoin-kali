// Authoritative VDXF key constants used across the viewer.
// Cross-checked against metadata/bitcoin-kali-vdxfkeys.md and the golden
// fixtures captured during Phase 4 Step 1.

// ── Outer keys (top-level keys in identity.contentmultimap) ────────────────

/** Bare series1 outer key — signature anchor + CMM container for pieces. */
export const SERIES1_OUTER_KEY = 'i5mntfEpcAWot1dses5qu3hGom3y7r6VHm';

/** DefinedKey class outer key on the curator identity. */
export const DEFINEDKEY_CLASS = 'iD3yzD6KnrSG75d8RzirMD6SyvrAS2HxjH';

// ── DataDescriptor wrapper key ─────────────────────────────────────────────

/** Every DD payload inside the series1 array is wrapped under this key. */
export const DATADESCRIPTOR_KEY = 'i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv';

// ── Type keys (discriminate typed DataDescriptor payloads) ────────────────

export const CROSSCHAINDATAREF_TYPE = 'iP3euVSzNcXUrLNHnQnR9G6q8jeYuGSxgw';
export const UINT256_TYPE = 'i8k7g7z6grtGYrNZmZr5TQ872aHssXuuua';
export const SIGNATUREDATA_TYPE = 'i7PcVF9wwPtQ6p6jDtCVpohX65pTZuP2ah';

// ── Label keys (semantic slots inside the 10-DD NFT CMM) ──────────────────

/** Message: Sanskrit name (Devanagari + transliteration). */
export const LABEL_NAME = 'iQtY1MAM98kf4Ep9AkF6yZ2LRbRUH1Jy1r';

/** Message: verse / description. */
export const LABEL_DESCRIPTION = 'iCnywaD6yMYuao5cc5WJmNPcpvCDrDXtNE';

/** Message (JSON-encoded): attributes object. */
export const LABEL_ATTRIBUTES = 'iLZq1iNgauVEfV4tN3eapkZcpw3cXTyfyH';

/**
 * Shared by image_ref (crosschaindataref) + image_hash (uint256).
 * Disambiguated by objectdata shape at parse time.
 */
export const LABEL_IMAGE = 'iEG1iSKoHMbUCb6NmWMhCxBqNz2dUQcbTW';

/**
 * Shared by signature (signaturedata) + mmrroot (uint256)
 * + mmrdescriptor_ref (crosschaindataref). Disambiguated by objectdata shape.
 */
export const LABEL_PROVENANCE = 'i58zX14hJD7TqbLsnKMN6RHyPxtUC3jExx';

/** Message: rights assertion. */
export const LABEL_RIGHTS = 'iMkRBt9sEbrXLxYLxo6s9CgaGEfTeJQf5i';

/** Message (JSON-encoded): delivery info (z-addr, evk, txid, filename). */
export const LABEL_DELIVERY = 'iMd6GTxpdqoUJjXC87aXVPpKjzZQ3y4bzA';
