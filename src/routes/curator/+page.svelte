<script lang="ts">
  import type { PageData } from './$types';
  import { findPieceByIaddr } from '$lib/manifest';
  import { CHAIN, MANIFEST } from '$lib/env';
  import { rpcCall } from '$lib/rpc';

  let { data }: { data: PageData } = $props();
  const curator = $derived(data.curator);
  const manifest = $derived(data.curatorManifest);
  const pieces = $derived(data.pieces);

  let resolvedIds: Record<string, string> = $state({});
  let resolving: Record<string, boolean> = $state({});

  async function resolveVdxfId(uri: string) {
    if (resolvedIds[uri]) return;
    resolving[uri] = true;
    try {
      const { data } = await rpcCall<{ vdxfid: string }>(
        CHAIN,
        'getvdxfid',
        [uri]
      );
      resolvedIds[uri] = data.vdxfid;
    } catch {
      resolvedIds[uri] = 'error';
    }
    resolving[uri] = false;
  }

  const jsonld = $derived({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: manifest.friendlyName,
    identifier: manifest.iaddr,
    url: '/curator',
    description: `Curator identity for Bitcoin Kali Series 1. Verus i-address ${manifest.iaddr}, pinned at block ${manifest.pinnedHeight}.`,
  });
  const jsonldSafe = $derived(JSON.stringify(jsonld).replace(/</g, '\\u003c'));
</script>

<svelte:head>
  <title>Curator — {manifest.friendlyName} — Bitcoin Kali</title>
  <meta
    name="description"
    content="Curator identity {manifest.friendlyName} ({manifest.iaddr}). DefinedKey schema URIs and delivery summary for all seven pieces in Bitcoin Kali Series 1."
  />
  {@html `<script type="application/ld+json">${jsonldSafe}</script>`}
</svelte:head>

<article class="curator">
  <header class="page-header">
    <p class="eyebrow">Curator identity</p>
    <h1 class="title">{manifest.friendlyName}</h1>
    <dl class="meta">
      <div class="row">
        <dt>i-address</dt>
        <dd><code class="hex">{manifest.iaddr}</code></dd>
      </div>
      <div class="row">
        <dt>Pinned height</dt>
        <dd><code>{manifest.pinnedHeight}</code></dd>
      </div>
    </dl>
  </header>

  <section class="defined-keys" aria-label="DefinedKey schema URIs">
    <h2 class="section-label">DefinedKey class</h2>
    <p class="section-intro">
      The curator identity declares a set of schema URIs under the DefinedKey
      class key. Each URI names a typed slot used by pieces in this series —
      think of them as column headers for the contentmultimap.
    </p>
    <ol class="key-list">
      {#each curator.definedKeys as key, i (key)}
        <li class="key-item">
          <div class="key-row">
            <code class="key-uri">{key}</code>
            {#if resolvedIds[key] && resolvedIds[key] !== 'error'}
              <code class="key-iaddr">{resolvedIds[key]}</code>
            {:else if resolving[key]}
              <span class="key-resolving">resolving…</span>
            {:else}
              <button
                type="button"
                class="resolve-btn"
                onclick={() => resolveVdxfId(key)}
              >
                {resolvedIds[key] === 'error' ? 'retry' : 'resolve i-address'}
              </button>
            {/if}
          </div>
          <details class="raw-toggle">
            <summary>raw hex</summary>
            <code class="raw-hex">{curator.definedKeyRaw[i]}</code>
          </details>
        </li>
      {/each}
    </ol>
  </section>

  <section class="delivery-summary" aria-label="Delivery summary">
    <h2 class="section-label">Delivery summary</h2>
    <p class="section-intro">
      The curator identity stores a delivery summary under the series1 outer
      key — one z-address and extended viewing key shared across all pieces,
      plus per-piece delivery transaction IDs.
    </p>
    <dl class="shared-fields">
      <div class="row">
        <dt>z-addr (shielded)</dt>
        <dd><code class="hex">{curator.delivery.zaddr}</code></dd>
      </div>
      <div class="row">
        <dt>Extended viewing key</dt>
        <dd><code class="hex">{curator.delivery.evk}</code></dd>
      </div>
    </dl>

    <h3 class="sub-label">Per-piece deliveries</h3>
    <div class="delivery-grid">
      {#each curator.delivery.deliveries as d (d.iaddress)}
        {@const linked = findPieceByIaddr(MANIFEST, d.iaddress)}
        <div class="delivery-card">
          <h4 class="card-name">
            {#if linked}
              <a href="/piece/{linked.slug}">{d.identity}</a>
            {:else}
              {d.identity}
            {/if}
          </h4>
          <dl class="card-fields">
            <div class="row">
              <dt>i-address</dt>
              <dd><code class="hex">{d.iaddress}</code></dd>
            </div>
            <div class="row">
              <dt>PNG txid</dt>
              <dd><code class="hex">{d.pngTxid}</code></dd>
            </div>
            <div class="row">
              <dt>mmrdescriptor txid</dt>
              <dd><code class="hex">{d.mmrdescriptorTxid}</code></dd>
            </div>
            <div class="row">
              <dt>Filename</dt>
              <dd><code>{d.filename}</code></dd>
            </div>
          </dl>
          {#if linked}
            <a class="card-link" href="/piece/{linked.slug}">
              View piece {linked.position} →
            </a>
          {:else}
            <span class="card-link dim">Not yet in viewer</span>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <nav class="footer-nav" aria-label="Curator navigation">
    <a href="/gallery">← Back to gallery</a>
  </nav>
</article>

<style>
  .curator {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4) var(--space-7);
  }

  .page-header {
    margin-bottom: var(--space-6);
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--color-vermilion);
    margin-bottom: var(--space-2);
  }
  .title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1.8rem;
    line-height: 1.2;
    margin: 0 0 var(--space-4);
  }

  .meta,
  .shared-fields,
  .card-fields {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.45rem var(--space-4);
    margin: 0;
    max-width: var(--measure-wide);
  }
  .row {
    display: contents;
  }
  dt {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-ash);
    padding-top: 0.25em;
  }
  dd {
    margin: 0;
    min-width: 0;
    color: var(--color-ivory);
    font-size: 0.9rem;
  }
  .hex {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--color-ivory-dim);
    word-break: break-all;
  }

  .section-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--color-ash);
    font-weight: 400;
    margin-bottom: var(--space-3);
  }
  .section-intro {
    max-width: var(--measure-body);
    font-size: 0.92rem;
    line-height: 1.55;
    color: var(--color-ivory-dim);
    margin-bottom: var(--space-4);
  }
  .sub-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--color-ash);
    font-weight: 400;
    margin: var(--space-5) 0 var(--space-3);
  }

  .defined-keys {
    margin: var(--space-6) 0;
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-hairline);
  }
  .key-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .key-item {
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--color-hairline);
  }
  .key-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .key-uri {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--color-ivory);
  }
  .key-iaddr {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--color-vermilion);
    word-break: break-all;
  }
  .key-resolving {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--color-ash);
    font-style: italic;
  }
  .resolve-btn {
    appearance: none;
    background: transparent;
    color: var(--color-ash);
    border: 1px solid var(--color-hairline);
    border-radius: 0;
    padding: 0.2rem 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }
  .resolve-btn:hover {
    border-color: var(--color-vermilion);
    color: var(--color-vermilion);
  }
  .raw-toggle {
    margin-top: var(--space-2);
  }
  .raw-toggle summary {
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-ash);
    list-style: none;
    outline-offset: 4px;
  }
  .raw-toggle summary::-webkit-details-marker {
    display: none;
  }
  .raw-toggle summary::before {
    content: '▸ ';
    color: var(--color-vermilion);
    display: inline-block;
  }
  .raw-toggle[open] summary::before {
    content: '▾ ';
  }
  .raw-toggle summary:hover {
    color: var(--color-vermilion);
  }
  .raw-hex {
    display: block;
    margin-top: var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--color-ash);
    word-break: break-all;
    line-height: 1.5;
  }

  .delivery-summary {
    margin: var(--space-6) 0;
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-hairline);
  }

  .delivery-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .delivery-card {
    padding: var(--space-4) 0;
    border-bottom: 1px solid var(--color-hairline);
  }
  .card-name {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 400;
    margin: 0 0 var(--space-3);
    color: var(--color-ivory);
  }
  .card-name a {
    color: var(--color-ivory);
    text-decoration: none;
    border-bottom: 1px solid var(--color-hairline);
    padding-bottom: 1px;
  }
  .card-name a:hover {
    border-bottom-color: var(--color-vermilion);
  }
  .card-fields {
    margin-bottom: var(--space-3);
  }
  .card-link {
    font-family: var(--font-body);
    font-size: 0.88rem;
    color: var(--color-ivory);
    text-decoration: none;
    border-bottom: 1px solid var(--color-vermilion);
    padding-bottom: 2px;
  }
  .card-link:hover {
    color: var(--color-vermilion);
  }
  .card-link.dim {
    color: var(--color-ash);
    border-bottom-color: var(--color-hairline);
  }

  .footer-nav {
    margin-top: var(--space-7);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-hairline);
  }
  .footer-nav a {
    color: var(--color-ivory);
    text-decoration: none;
    border-bottom: 1px solid var(--color-hairline);
    padding-bottom: 2px;
  }
  .footer-nav a:hover {
    border-bottom-color: var(--color-vermilion);
  }
</style>
