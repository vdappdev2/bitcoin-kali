import { error } from '@sveltejs/kit';
import { CHAIN, MANIFEST } from '$lib/env';
import { findPieceBySlug } from '$lib/manifest';
import { parseNft, type NftContent } from '$lib/cmm';
import { rpcCall } from '$lib/rpc';
import { crossCheckManifest } from '$lib/verify';

export const prerender = true;

/** Tell adapter-static which slugs to prerender under /piece/[slug]. */
export function entries() {
  return MANIFEST.pieces.map((p) => ({ slug: p.slug }));
}

export async function load({ params }) {
  const piece = findPieceBySlug(MANIFEST, params.slug);
  if (!piece) {
    throw error(404, `Unknown piece: ${params.slug}`);
  }

  let content: NftContent;
  let identityName: string;
  let identityAddress: string;
  try {
    const { data: raw } = await rpcCall<unknown>(CHAIN, 'getidentity', [
      piece.iaddr,
      piece.registrationHeight,
    ]);
    content = parseNft(raw);
    const r = raw as {
      result?: { identity?: { name?: string; identityaddress?: string } };
      identity?: { name?: string; identityaddress?: string };
    };
    const id = r.result?.identity ?? r.identity;
    identityName = id?.name ?? piece.slug;
    identityAddress = id?.identityaddress ?? piece.iaddr;
  } catch (err) {
    throw error(
      500,
      `Failed to load piece ${piece.slug} (${piece.iaddr} @ ${piece.registrationHeight}): ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  const check = crossCheckManifest(content, piece);
  if (!check.ok) {
    throw error(
      500,
      `Manifest cross-check failed for ${piece.slug}: ${check.issues.join('; ')}`
    );
  }

  return {
    piece,
    content,
    identityName,
    identityAddress,
    staticImagesDir: CHAIN.staticImagesDir,
  };
}
