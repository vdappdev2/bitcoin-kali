# Bitcoin Kali

A seven-piece Verus NFT series. Each work is a VerusID with typed VDXF contentmultimap provenance, curator-signed mmrroots, and publicly-verifiable encrypted file delivery — every claim on the site is checkable against the Verus blockchain.

Live: **[bitcoinkali.com](https://bitcoinkali.com)**

The purpose of this project is to showcase and demonstrate some of the features and capabilities of Verus PBaas. And to inspire others to create something with Verus.

## What this repo is

The static SvelteKit viewer for the series. The art, signatures, and rights live on the Verus chain; this site queries them in the browser, verifies them against pinned hashes in the manifest, and renders the result.

## Stack

- **SvelteKit** with `@sveltejs/adapter-static` (zero-server, prerendered HTML)
- **Svelte 5** runes (`$props`, `$state`, `$derived`)
- **TypeScript**, strict mode
- Client-side **JSON-RPC** to public Verus endpoints (`api.verus.services`, with `rpc.vrsc.syncproof.net` as failover)
- Deployed on **Vercel**

## Run locally

```bash
pnpm install
pnpm dev
```

By default builds against mainnet. To target testnet:

```bash
PUBLIC_CHAIN=testnet pnpm dev
```

## Build

```bash
pnpm build         # writes static site to ./build
pnpm preview       # serve the build locally
```

## Architecture pointers

- `src/lib/manifest.ts` — pinned heights and expected on-chain hashes per piece. The tamper-detection baseline. Edits here are security-reviewed.
- `src/lib/rpc.ts` — JSON-RPC 1.0 wrapper with endpoint failover and a 15s timeout.
- `src/lib/cmm.ts` — contentmultimap parsing (typed VDXF entries → typed objects).
- `src/lib/verify.ts` — browser SHA-256 comparison against pinned uint256 image hashes and mmrroots.
- `src/routes/learn/` — ten topic pages explaining the Verus primitives the site uses (VDXF keys, contentmultimap, signdata, marketplace, control tokens, and so on). Read these to understand the protocol surface this project exercises.
- `src/routes/offers/` — live `getoffers` against the seven control tokens.
- `vercel.json` — security headers (CSP, X-Frame-Options, etc.) + output directory.

## Verus protocol concepts used

- VerusID (named on-chain identity with revoke/recover authorities)
- VDXF keys (collision-resistant typed namespace for content)
- Contentmultimap (CMM) on the identity (typed key → value entries)
- `signdata` / `verifysignature` (curator-signed mmrroots over delivery payloads)
- `definecurrency` to mint per-piece **control tokens** (one-satoshi indivisible currencies bound to the identity)
- Decentralized marketplace via `makeoffer` / `getoffers` / `takeoffer` (atomic on-chain swaps)
- `sendcurrency` with attached encrypted data for file delivery, decrypted client-side via `decryptdata`

The `/learn` section walks through each.

## License

All rights reserved. The on-chain rights for each piece are encoded in its own VerusID contentmultimap and are authoritative per the curator's intent.
