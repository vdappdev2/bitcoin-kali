import { error } from '@sveltejs/kit';
import { CHAIN, MANIFEST } from '$lib/env';
import { parseCurator, type CuratorContent } from '$lib/curator';
import { rpcCall } from '$lib/rpc';

export const prerender = true;

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

  return {
    curator,
    curatorManifest: MANIFEST.curator,
    pieces: MANIFEST.pieces,
    staticImagesDir: CHAIN.staticImagesDir,
  };
}
