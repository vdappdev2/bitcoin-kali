import { env } from '$env/dynamic/public';
import { getChainConfig, type ChainConfig, type ChainName } from './chain';
import { getManifest, type ChainManifest } from './manifest';

// Build-time chain switch. PUBLIC_CHAIN comes from .env (or Vercel project
// settings) and is replaced at prerender time. Defaults to 'testnet' so the
// build works even without an .env file committed.

const raw = env.PUBLIC_CHAIN?.toLowerCase();
export const CHAIN_NAME: ChainName = raw === 'mainnet' ? 'mainnet' : 'testnet';
export const CHAIN: ChainConfig = getChainConfig(CHAIN_NAME);
export const MANIFEST: ChainManifest = getManifest(CHAIN_NAME);
