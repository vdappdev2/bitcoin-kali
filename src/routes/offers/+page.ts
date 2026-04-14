import { error } from '@sveltejs/kit';
import { CHAIN, MANIFEST } from '$lib/env';
import { parseNft, type NftContent } from '$lib/cmm';
import { rpcCall } from '$lib/rpc';
import { crossCheckManifest } from '$lib/verify';
import type { PieceManifest } from '$lib/manifest';

export const prerender = true;

type LivePieceData = {
  piece: PieceManifest;
  name: string;
  filename: string;
  deliveryTxid: string;
  evk: string;
};

export async function load() {
  // We need per-piece delivery info (txid, evk, filename) so the offers page
  // can show a thumbnail next to each listing. Same getidentity +
  // parseNft + manifest cross-check pattern used by /gallery.
  const livePieces: LivePieceData[] = [];
  for (const piece of MANIFEST.pieces) {
    try {
      const { data: raw } = await rpcCall<unknown>(CHAIN, 'getidentity', [
        piece.iaddr,
        piece.registrationHeight,
      ]);
      const content: NftContent = parseNft(raw);
      const check = crossCheckManifest(content, piece);
      if (!check.ok) {
        throw new Error(
          `manifest cross-check failed: ${check.issues.join('; ')}`
        );
      }
      livePieces.push({
        piece,
        name: content.name,
        filename: content.delivery.filename,
        deliveryTxid: content.delivery.txid,
        evk: content.delivery.evk,
      });
    } catch (err) {
      throw error(
        500,
        `Failed to load piece ${piece.slug}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return { livePieces };
}
