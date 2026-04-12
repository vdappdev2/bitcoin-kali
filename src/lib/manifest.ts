// Pinned heights + expected on-chain hashes per piece. Baked into the
// viewer as the tamper-detection baseline: after parsing the chain-returned
// CMM, we compare mmrroot + image uint256 against these values and refuse
// to render on divergence.
//
// All hex here is stored EXACTLY as the chain returns it (little-endian).
// The browser SHA-256 compare happens in verify.ts via reverseHex.
//
// Updating any value in this file is a security-reviewed change, not a
// routine edit. See phase4-prompt-and-results.md § Security considerations.

export type PieceManifest = {
  slug: string;
  iaddr: string;
  friendlyName: string;
  /** 1-indexed position in the 7-piece series. Display-only. */
  position: number;
  /** Block height the viewer pins getidentity to. */
  registrationHeight: number;
  /** On-chain image uint256 (little-endian hex). */
  expectedImageUint256LE: string;
  /** On-chain mmrroot (little-endian hex). */
  expectedMmrRootLE: string;
  /** Height at which the piece's signdata ran. Display-only. */
  signatureHeight: number;
};

/** Total pieces in the Bitcoin Kali series. */
export const SERIES_TOTAL = 7;

export type CuratorManifest = {
  iaddr: string;
  friendlyName: string;
  pinnedHeight: number;
};

export type ChainManifest = {
  curator: CuratorManifest;
  pieces: PieceManifest[];
};

export const TESTNET_MANIFEST: ChainManifest = {
  curator: {
    iaddr: 'i4iSua6dwQHC3GVxoPbPYmGjx9YkmMWVsL',
    friendlyName: 'kali.mcp3@',
    pinnedHeight: 1014792,
  },
  pieces: [
    {
      slug: 'kali-3-seed162',
      iaddr: 'iMLt3AGFAAYr9bXTJj8YKaU1Uty2Motv7x',
      friendlyName: 'kali-3-seed162-broken_press-mandala.mcp3@',
      position: 3,
      registrationHeight: 1014807,
      expectedImageUint256LE:
        '82a6274adc77f594fd54f2426bfabfa069568df0b749227299cc3fecaacb6965',
      expectedMmrRootLE:
        'f51e823761a22a24c9978cdcd5cbddd879295f5e129ea57a9742dd6cc373aae4',
      signatureHeight: 1014746,
    },
    {
      slug: 'kali-5-seed224',
      iaddr: 'iEUEsdgany6hZfxhRGdFPsYFCZLAhmtjHW',
      friendlyName: 'kali-5-seed224-hourglass-moon.mcp3@',
      position: 5,
      registrationHeight: 1014811,
      expectedImageUint256LE:
        'b978b0d31b4054ca05a2e1aa226bb27e2edd5c360fdeab99a917d0eeefdcdf77',
      expectedMmrRootLE:
        '547a1d87631792fa4bf52effcd7b4466543a1012d5a15ef68791846b06f162ab',
      signatureHeight: 1014748,
    },
  ],
};

// Mainnet manifest is populated at Phase 6 mainnet flip. Empty placeholders
// now so the typechecker doesn't break when chain-switching code references it.
export const MAINNET_MANIFEST: ChainManifest = {
  curator: {
    iaddr: 'MAINNET_CURATOR_TBD',
    friendlyName: 'mainnet-tbd@',
    pinnedHeight: 0,
  },
  pieces: [],
};

export function getManifest(chain: 'testnet' | 'mainnet'): ChainManifest {
  return chain === 'mainnet' ? MAINNET_MANIFEST : TESTNET_MANIFEST;
}

export function findPieceBySlug(
  manifest: ChainManifest,
  slug: string
): PieceManifest | undefined {
  return manifest.pieces.find((p) => p.slug === slug);
}

export function findPieceByIaddr(
  manifest: ChainManifest,
  iaddr: string
): PieceManifest | undefined {
  return manifest.pieces.find((p) => p.iaddr === iaddr);
}
