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

export const MAINNET_MANIFEST: ChainManifest = {
  curator: {
    iaddr: 'i5FXH74Xnqm3AS6iWJSLoMW1PZaev2F1bj',
    friendlyName: 'kali.bitcoins@',
    pinnedHeight: 4022359,
  },
  pieces: [
    {
      slug: 'destroyer-of-fiat',
      iaddr: 'i3xD7bRKEtJdMmKjoxMHyBjoURebQsGFhV',
      friendlyName: 'Destroyer of Fiat.bitcoins@',
      position: 1,
      registrationHeight: 4022399,
      expectedImageUint256LE:
        '7a08aaa1ab65ed04268ba641727730157c2e9d49c19c4f1afe5a038f47741cda',
      expectedMmrRootLE:
        '020bd9feddc5fde8e7f8a16be7a99e0044c83544f24d01cf01324ff73093bf00',
      signatureHeight: 4022271,
    },
    {
      slug: 'slayer-of-bankers',
      iaddr: 'iNjVMpJ5UHzFkPqj2pnKNTydCqL8cqg7EK',
      friendlyName: 'Slayer of Bankers.bitcoins@',
      position: 2,
      registrationHeight: 4022399,
      expectedImageUint256LE:
        '8a54662caefe82243f16db4e4ee94c3976fb5a31f887d3baf15e9f2b58b25d54',
      expectedMmrRootLE:
        '896c9878e1e4e9fc93c472c0627d20be624aa80740884e8db97b0b6380e79590',
      signatureHeight: 4022271,
    },
    {
      slug: 'bane-of-debasement',
      iaddr: 'iBLqEpqnCriDbpwavQL1PNffQQe9qp6SW3',
      friendlyName: 'Bane of Debasement.bitcoins@',
      position: 3,
      registrationHeight: 4022403,
      expectedImageUint256LE:
        '1b6d132e6de628829541bf5e5ab3cc8c0a6a57a3fd287e361fca4e208bb85f68',
      expectedMmrRootLE:
        'a5b346fbe7f7e3d422d8c72577e59c3b5afe95a93efc3bd0ac63985dd9ff1022',
      signatureHeight: 4022271,
    },
    {
      slug: 'goddess-of-sovereignty',
      iaddr: 'iE2g92tYqhq17Pgwj5xJtn2W14q3QKQbK2',
      friendlyName: 'Goddess of Sovereignty.bitcoins@',
      position: 4,
      registrationHeight: 4022410,
      expectedImageUint256LE:
        'e973e41018361a484ae9e5bd41a861eeb66cb4fa3c391864c46a25475bab9593',
      expectedMmrRootLE:
        'a14b3d8c679e2cb4cdd0051da74ce40eb3ef8b784a44c012e89b9b6812f2bb09',
      signatureHeight: 4022276,
    },
    {
      slug: 'devourer-of-time',
      iaddr: 'iJwuAi1htck5yxJQVSEaWXczGnXNo5d47P',
      friendlyName: 'Devourer of Time.bitcoins@',
      position: 5,
      registrationHeight: 4022414,
      expectedImageUint256LE:
        '839f80d3a94973231c87390cf3f42532130377ab11098b5c4353399349f1f647',
      expectedMmrRootLE:
        'e76b89b84214ba85f2c43eb7a17280b286e57b72749d014b136b1a7d940446bf',
      signatureHeight: 4022279,
    },
    {
      slug: 'kali-of-the-cremation-ground',
      iaddr: 'i81vUWkBiVjk2GXbNChv2A2VHan1QpWdwn',
      friendlyName: 'Kali of the Cremation Ground.bitcoins@',
      position: 6,
      registrationHeight: 4022414,
      expectedImageUint256LE:
        'f896b6ce5ff5c0c009386fb45ce28a16d5296b01643227995da8bb9af54e2bc7',
      expectedMmrRootLE:
        'cb2eab1c10c25ba7e1ed9b37e9bd81da4da3a9fbceef7aad85bf0a33fbb94bfe',
      signatureHeight: 4022280,
    },
    {
      slug: 'mother-of-the-immutable',
      iaddr: 'iQz4vqD43Zj1snj91wGPHZxeEWd1K1jYj1',
      friendlyName: 'Mother of the Immutable.bitcoins@',
      position: 7,
      registrationHeight: 4022421,
      expectedImageUint256LE:
        '5b6dd022bc062c4ddcd857d7834d3993c57dd8681720b63115c340c6e534724b',
      expectedMmrRootLE:
        'a1db7316cdb5383b19cdb8a3cc5c1fe4863b0b49ebe2c8bd51e6cc39726de765',
      signatureHeight: 4022287,
    },
  ],
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
