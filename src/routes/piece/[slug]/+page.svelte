<script lang="ts">
  import { onMount } from 'svelte';
  import PieceHeader from '$lib/components/PieceHeader.svelte';
  import AttributesTable from '$lib/components/AttributesTable.svelte';
  import RightsBlock from '$lib/components/RightsBlock.svelte';
  import VerificationBadge from '$lib/components/VerificationBadge.svelte';
  import VerificationTheatre from '$lib/components/VerificationTheatre.svelte';
  import DecryptPanel from '$lib/components/DecryptPanel.svelte';
  import { CHAIN } from '$lib/env';
  import { fetchPngBytes } from '$lib/verify';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const piece = $derived(data.piece);
  const content = $derived(data.content);
  const identityName = $derived(data.identityName);
  const identityAddress = $derived(data.identityAddress);

  let imageUrl: string | null = $state(null);

  onMount(() => {
    fetchPngBytes(CHAIN, content.delivery.filename, content.delivery.txid, content.delivery.evk)
      .then((bytes) => {
        imageUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      })
      .catch(() => {});
    return () => { if (imageUrl) URL.revokeObjectURL(imageUrl); };
  });

  const metaDescription = $derived(
    `${content.name} — Bitcoin Kali Series 1, piece ${piece.position} of 7. ` +
      `Verus identity ${piece.iaddr}, signed at block ${piece.signatureHeight}, ` +
      `image uint256 ${piece.expectedImageUint256LE}. ` +
      `All claims independently verifiable against the Verus blockchain.`
  );

  // Schema.org VisualArtwork JSON-LD so crawlers + LLMs can read the piece
  // without running JS. Everything here is derived from the parsed on-chain
  // CMM; nothing is manually re-typed.
  const jsonld = $derived({
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: content.name,
    alternateName: piece.friendlyName,
    identifier: piece.iaddr,
    url: `/piece/${piece.slug}`,
    image: imageUrl ?? undefined,
    inLanguage: 'sa-Deva',
    description: content.description,
    artform: 'digital image',
    artMedium: 'generative digital',
    artworkSurface: 'PNG',
    creator: { '@type': 'Organization', name: 'Bitcoin Kali' },
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: 'Bitcoin Kali — Series 1',
      numberOfEpisodes: 7,
    },
    position: piece.position,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Verus i-address',
        value: piece.iaddr,
      },
      {
        '@type': 'PropertyValue',
        name: 'Registration block height',
        value: piece.registrationHeight,
      },
      {
        '@type': 'PropertyValue',
        name: 'Image SHA-256 (on-chain, little-endian)',
        value: piece.expectedImageUint256LE,
      },
      {
        '@type': 'PropertyValue',
        name: 'mmrroot (little-endian)',
        value: piece.expectedMmrRootLE,
      },
      {
        '@type': 'PropertyValue',
        name: 'Curator signature',
        value: content.signature.signature,
      },
      {
        '@type': 'PropertyValue',
        name: 'Curator i-address',
        value: content.signature.identityid,
      },
    ],
  });
  const jsonldSafe = $derived(JSON.stringify(jsonld).replace(/</g, '\\u003c'));
</script>

<svelte:head>
  <title>{content.name} — Bitcoin Kali piece {piece.position} of 7</title>
  <meta name="description" content={metaDescription} />
  <meta property="og:title" content={`${content.name} — Bitcoin Kali piece ${piece.position} of 7`} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:type" content="article" />
  <meta property="article:section" content="Bitcoin Kali — Series 1" />
  {@html `<script type="application/ld+json">${jsonldSafe}</script>`}
</svelte:head>

<article class="piece">
  <PieceHeader {content} {piece} {identityName} {identityAddress} />

  <figure class="hero-image">
    {#if imageUrl}
      <img
        src={imageUrl}
        alt="{content.name} — Bitcoin Kali Series 1 piece {piece.position}: generative digital artwork, {content.attributes.bitcoinItem ?? ''} / {content.attributes.background ?? ''}"
        width="1024"
        height="1024"
        decoding="async"
      />
    {:else}
      <div class="image-pending" aria-hidden="true"></div>
    {/if}
    <figcaption>
      File: <code>{content.delivery.filename}</code>
    </figcaption>
  </figure>

  <section class="verse" aria-label="Verse">
    <h2 class="section-label">Verse</h2>
    <blockquote>{content.description}</blockquote>
  </section>

  <AttributesTable attributes={content.attributes} />

  <section class="collapsible-section" aria-label="Verification">
    <details class="section-drawer">
      <summary><h2 class="section-label">Verification</h2></summary>
      <div class="section-body">
        <VerificationBadge {content} {piece} />
        <div class="theatre-links">
          <a class="theatre-cta" href="/verify/{piece.slug}">
            Run the full six-step verification theatre →
          </a>
          <details class="drawer">
            <summary>Or open the live theatre inline on this page</summary>
            <VerificationTheatre {piece} variant="drawer" />
          </details>
        </div>
      </div>
    </details>
  </section>

  <RightsBlock text={content.rights} />

  <section class="collapsible-section" aria-label="Provenance details">
    <details class="section-drawer">
      <summary><h2 class="section-label">Provenance</h2></summary>
      <div class="section-body">
        <dl>
          <div class="row">
            <dt>Curator identity</dt>
            <dd><code>{content.signature.identityid}</code></dd>
          </div>
          <div class="row">
            <dt>Image reference (tx)</dt>
            <dd>
              <code class="hex">{content.imageRef.txid}</code>
              <span class="vout">vout {content.imageRef.voutnum}</span>
            </dd>
          </div>
          <div class="row">
            <dt>mmrdescriptor (tx)</dt>
            <dd>
              <code class="hex">{content.mmrdescriptorRef.txid}</code>
              <span class="vout">vout {content.mmrdescriptorRef.voutnum}</span>
            </dd>
          </div>
          <div class="row">
            <dt>Signature (base64)</dt>
            <dd><code class="hex">{content.signature.signature}</code></dd>
          </div>
          <div class="row">
            <dt>Bound vdxfkeys</dt>
            <dd>
              {#each content.signature.vdxfkeys as key (key)}
                <code class="hex block">{key}</code>
              {/each}
            </dd>
          </div>
          <div class="row">
            <dt>Registration block</dt>
            <dd><code>{piece.registrationHeight}</code></dd>
          </div>
          <div class="row">
            <dt>Signature block</dt>
            <dd><code>{piece.signatureHeight}</code></dd>
          </div>
        </dl>
      </div>
    </details>
  </section>

  <section class="collapsible-section" aria-label="Delivery and decrypt">
    <details class="section-drawer">
      <summary><h2 class="section-label">Delivery &amp; Decrypt</h2></summary>
      <div class="section-body">
        <DecryptPanel {content} {piece} />
      </div>
    </details>
  </section>

  <nav class="footer-nav" aria-label="Piece navigation">
    <a href="/gallery">← Back to gallery</a>
  </nav>
</article>

<style>
  .piece {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4) var(--space-7);
  }

  .hero-image {
    margin: 0 0 var(--space-6) 0;
  }
  .hero-image img {
    width: 100%;
    max-width: 720px;
    height: auto;
    display: block;
    border: 1px solid var(--color-hairline);
  }
  .hero-image figcaption {
    margin-top: var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--color-ash);
  }
  .image-pending {
    width: 100%;
    max-width: 720px;
    aspect-ratio: 1 / 1;
    background: repeating-linear-gradient(
      45deg,
      transparent 0 14px,
      var(--color-hairline) 14px 15px
    );
  }

  .verse {
    margin: var(--space-5) 0;
  }
  .verse blockquote {
    margin: 0;
    padding: 0 0 0 var(--space-4);
    max-width: var(--measure-body);
    border-left: 2px solid var(--color-hairline);
    font-size: 1.2rem;
    line-height: 1.55;
    font-style: italic;
    white-space: pre-line;
  }

  .section-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--color-ash);
    font-weight: 400;
    margin: 0;
    display: inline;
  }

  .collapsible-section {
    margin: var(--space-6) 0;
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-hairline);
  }
  .section-drawer summary {
    cursor: pointer;
    list-style: none;
    outline-offset: 4px;
  }
  .section-drawer summary::-webkit-details-marker {
    display: none;
  }
  .section-drawer .section-label::before {
    content: '▸ ';
    color: var(--color-vermilion);
    display: inline;
  }
  .section-drawer[open] .section-label::before {
    content: '▾ ';
  }
  .section-drawer summary:hover .section-label {
    color: var(--color-vermilion);
  }
  .section-body {
    margin-top: var(--space-3);
  }
  dl {
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
  .hex.block {
    display: block;
  }
  .vout {
    margin-left: 0.6em;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--color-ash);
  }

  .theatre-links {
    margin-top: var(--space-4);
  }
  .theatre-cta {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 1.05rem;
    color: var(--color-ivory);
    border-bottom: 1px solid var(--color-vermilion);
    padding-bottom: 2px;
    text-decoration: none;
  }
  .theatre-cta:hover {
    color: var(--color-vermilion);
  }
  .drawer {
    margin-top: var(--space-4);
    max-width: var(--measure-wide);
  }
  .drawer summary {
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-ash);
    padding: 0.4rem 0;
    list-style: none;
    outline-offset: 4px;
  }
  .drawer summary::-webkit-details-marker {
    display: none;
  }
  .drawer summary::before {
    content: '▸ ';
    color: var(--color-vermilion);
    transition: transform 0.15s ease;
    display: inline-block;
  }
  .drawer[open] summary::before {
    content: '▾ ';
  }
  .drawer summary:hover {
    color: var(--color-vermilion);
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
