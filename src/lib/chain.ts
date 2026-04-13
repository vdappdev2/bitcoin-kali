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
  /** Endpoint that serves decryptdata (may differ from the primary RPC). */
  decryptEndpoint: string;
};

export const TESTNET: ChainConfig = {
  name: 'testnet',
  endpoints: ['https://api.verustest.net'],
  curatorIaddr: 'i4iSua6dwQHC3GVxoPbPYmGjx9YkmMWVsL',
  outerKeyVdxfid: SERIES1_OUTER_KEY,
  decryptEndpoint: '',
};

export const MAINNET: ChainConfig = {
  name: 'mainnet',
  endpoints: ['https://api.verus.services', 'https://rpc.vrsc.syncproof.net'],
  curatorIaddr: 'i5FXH74Xnqm3AS6iWJSLoMW1PZaev2F1bj',
  outerKeyVdxfid: SERIES1_OUTER_KEY,
  decryptEndpoint: 'https://rpc.vrsc.syncproof.net',
};

export function getChainConfig(name: ChainName): ChainConfig {
  return name === 'mainnet' ? MAINNET : TESTNET;
}
