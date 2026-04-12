<script lang="ts">
  import GalleryTile from '$lib/components/GalleryTile.svelte';
  import { SERIES_TOTAL } from '$lib/manifest';
  import { CHAIN_NAME } from '$lib/env';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const positions = Array.from({ length: SERIES_TOTAL }, (_, i) => i + 1);
  const byPosition = $derived(
    new Map(data.livePieces.map((lp) => [lp.piece.position, lp]))
  );

  // Gallery-wide JSON-LD. CollectionPage + ItemList so crawlers (and LLMs)
  // can enumerate the series even if they never visit the detail pages.
  const jsonld = $derived({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bitcoin Kali — Series 1',
    description:
      'A seven-piece Verus NFT series with on-chain identity, typed VDXF contentmultimap provenance, and publicly-verifiable encrypted file delivery.',
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Bitcoin Kali',
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: SERIES_TOTAL,
      itemListElement: positions.map((pos) => {
        const live = byPosition.get(pos);
        if (live) {
          return {
            '@type': 'ListItem',
            position: pos,
            item: {
              '@type': 'VisualArtwork',
              name: live.name,
              identifier: live.piece.iaddr,
              url: `/piece/${live.piece.slug}`,
              image:
                data.staticImagesDir !== null
                  ? `${data.staticImagesDir}${live.filename}`
                  : undefined,
            },
          };
        }
        return {
          '@type': 'ListItem',
          position: pos,
          item: {
            '@type': 'CreativeWork',
            name: `Bitcoin Kali — Piece ${pos}`,
            description: 'Pending mainnet launch',
          },
        };
      }),
    },
  });

  const jsonldSafe = $derived(JSON.stringify(jsonld).replace(/</g, '\\u003c'));
</script>

<svelte:head>
  <title>Gallery — Bitcoin Kali ({data.livePieces.length} of {SERIES_TOTAL} live on {CHAIN_NAME})</title>
  <meta
    name="description"
    content="The seven pieces of Bitcoin Kali Series 1. On {CHAIN_NAME} {data.livePieces.length} of 7 are live and hash-verifiable against the chain; the remainder arrive at mainnet launch."
  />
  <meta property="og:title" content="Bitcoin Kali — Gallery" />
  <meta
    property="og:description"
    content="Seven generative Verus NFTs, each with typed contentmultimap provenance and signed mmrroots."
  />
  {@html `<script type="application/ld+json">${jsonldSafe}</script>`}
</svelte:head>

<article class="gallery">
  <header>
    <p class="eyebrow">Series 1 &nbsp;·&nbsp; {data.livePieces.length} of {SERIES_TOTAL} live on {CHAIN_NAME}</p>
    <h1>Gallery</h1>
    <p class="lede">
      The seven pieces. Click a live tile to open the verification view. Tiles in the
      hatched state are reserved positions that arrive at mainnet launch.
    </p>
  </header>

  <section class="curator-bar" aria-label="Curator">
    <p class="meta">
      Curated by <code>{data.curator.delivery.deliveries[0]?.identity?.split('-')[0] ?? 'kali.mcp3'}@</code>
      &nbsp;·&nbsp; delivery z-addr <code class="truncate">{data.curator.delivery.zaddr}</code>
    </p>
  </section>

  <section class="grid" aria-label="Gallery tiles">
    {#each positions as pos (pos)}
      {@const live = byPosition.get(pos)}
      {#if live}
        <GalleryTile
          kind="live"
          piece={live.piece}
          name={live.name}
          imageUrl={data.staticImagesDir !== null
            ? `${data.staticImagesDir}${live.filename}`
            : null}
        />
      {:else}
        <GalleryTile kind="placeholder" position={pos} />
      {/if}
    {/each}
  </section>
</article>

<style>
  .gallery {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4) var(--space-7);
  }
  header {
    margin-bottom: var(--space-5);
  }
  .eyebrow {
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.72rem;
    color: var(--color-vermilion);
    margin-bottom: var(--space-3);
  }
  h1 {
    font-size: 2.6rem;
    margin-bottom: var(--space-3);
  }
  .lede {
    max-width: var(--measure-body);
    color: var(--color-ivory-dim);
  }
  .curator-bar {
    border-top: 1px solid var(--color-hairline);
    border-bottom: 1px solid var(--color-hairline);
    padding: var(--space-3) 0;
    margin-bottom: var(--space-5);
  }
  .curator-bar .meta {
    margin: 0;
    max-width: none;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--color-ash);
  }
  .curator-bar code {
    color: var(--color-ivory-dim);
  }
  .truncate {
    display: inline-block;
    max-width: 22ch;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
    white-space: nowrap;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-4);
  }
</style>
