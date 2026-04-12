import { error } from '@sveltejs/kit';
import { MANIFEST } from '$lib/env';
import { findPieceBySlug } from '$lib/manifest';

export const prerender = true;

/** Tell adapter-static which slugs to prerender under /verify/[slug]. */
export function entries() {
  return MANIFEST.pieces.map((p) => ({ slug: p.slug }));
}

/**
 * Prerender-time load: manifest lookup only. The actual verification theatre
 * runs client-side on mount — so no RPC calls here. The rendered HTML is a
 * skeleton that hydrates into the live theatre when JavaScript loads.
 */
export function load({ params }) {
  const piece = findPieceBySlug(MANIFEST, params.slug);
  if (!piece) {
    throw error(404, `Unknown piece: ${params.slug}`);
  }
  return { piece };
}
