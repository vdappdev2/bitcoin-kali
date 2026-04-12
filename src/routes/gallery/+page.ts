import { error } from '@sveltejs/kit';
import { CHAIN, MANIFEST } from '$lib/env';
import { parseCurator, type CuratorContent } from '$lib/curator';
import { parseNft, type NftContent } from '$lib/cmm';
import { rpcCall } from '$lib/rpc';
import { crossCheckManifest } from '$lib/verify';
import type { PieceManifest } from '$lib/manifest';

export const prerender = true;

type LivePieceData = {
  piece: PieceManifest;
  name: string;
  filename: string;
};

export async function load() {
  let curator: CuratorContent;
  try {
    const { data: raw } = await rpcCall<unknown>(CHAIN, 'getidentity', [
      MANIFEST.curator.iaddr,
      MANIFEST.curator.pinnedHeight,
    ]);
    curator = parseCurator(raw);
  } catch (err) {
    throw error(
      500,
      `Failed to load curator ${MANIFEST.curator.iaddr} at height ${MANIFEST.curator.pinnedHeight}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  // Pull each piece's display name from its own identity — gallery tiles need
  // the Sanskrit name, and the curator's delivery summary only carries the
  // friendly identity name, not the art name.
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
      });
    } catch (err) {
      throw error(
        500,
        `Failed to load piece ${piece.slug}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return {
    curator,
    livePieces,
    staticImagesDir: CHAIN.staticImagesDir,
  };
}
