import { SERIES1_OUTER_KEY } from './vdxf-keys';

export type ChainName = 'testnet' | 'mainnet';

export type ChainConfig = {
  name: ChainName;
  /** Ordered list: primary first, fallbacks next. Tried in sequence by rpc.ts. */
  endpoints: string[];
  /** Curator identity i-address for this chain. */
  curatorIaddr: string;
  /** Bare series1 outer-key vdxfid (same on both chains). */
  outerKeyVdxfid: string;
  /**
   * Static image directory for plaintext PNG serving (testnet only).
   * Mainnet sets this to null and uses decryptdata instead.
   */
  staticImagesDir: string | null;
  /** Whether decryptdata is callable on one of the endpoints. */
  hasDecryptData: boolean;
};

export const TESTNET: ChainConfig = {
  name: 'testnet',
  endpoints: ['https://api.verustest.net'],
  curatorIaddr: 'i4iSua6dwQHC3GVxoPbPYmGjx9YkmMWVsL',
  outerKeyVdxfid: SERIES1_OUTER_KEY,
  staticImagesDir: '/images/testnet/',
  hasDecryptData: false,
};

export const MAINNET: ChainConfig = {
  name: 'mainnet',
  endpoints: ['https://api.verus.services', 'https://rpc.vrsc.syncproof.net'],
  // Curator i-address on mainnet — TBD Phase 6. Using a placeholder sentinel
  // until the mainnet registration lands; anything using this value at
  // runtime will fail loudly instead of silently querying the wrong identity.
  curatorIaddr: 'MAINNET_CURATOR_TBD',
  outerKeyVdxfid: SERIES1_OUTER_KEY,
  staticImagesDir: null,
  hasDecryptData: true,
};

export function getChainConfig(name: ChainName): ChainConfig {
  return name === 'mainnet' ? MAINNET : TESTNET;
}
