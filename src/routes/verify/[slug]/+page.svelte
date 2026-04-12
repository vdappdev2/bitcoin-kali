<script lang="ts">
  import VerificationTheatre from '$lib/components/VerificationTheatre.svelte';
  import { CHAIN_NAME } from '$lib/env';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const piece = $derived(data.piece);

  const metaDescription = $derived(
    `Live verification of ${piece.friendlyName} — fetches the contentmultimap from Verus ${CHAIN_NAME}, extracts the signed mmrroot, calls verifysignature, fetches the PNG, hashes it locally, and compares to the on-chain uint256. All six steps run in your browser.`
  );
</script>

<svelte:head>
  <title>Verify {piece.friendlyName} — live on-chain verification</title>
  <meta name="description" content={metaDescription} />
  <meta property="og:title" content="Verify {piece.friendlyName}" />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:type" content="article" />
  <meta name="robots" content="index, follow" />
</svelte:head>

<article class="verify-page">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="/gallery">Gallery</a>
    <span aria-hidden="true">/</span>
    <a href="/piece/{piece.slug}">Piece {piece.position}</a>
    <span aria-hidden="true">/</span>
    <span aria-current="page">Verify</span>
  </nav>

  <header class="intro">
    <h1>Live verification</h1>
    <p class="lede">
      Your browser is about to run six independent checks against the Verus
      blockchain — every one with its work shown. Nothing is cached; nothing is
      faked. The RPC calls happen from this page, right now, as you watch.
    </p>
    <p class="lede">
      If any single step fails, the whole sequence halts and tells you which check
      broke and why. That's the point: verification that shows its work, and that
      anyone can re-run.
    </p>
  </header>

  <VerificationTheatre {piece} variant="standalone" />

  <footer class="page-footer">
    <a href="/piece/{piece.slug}" class="back">← Return to {piece.friendlyName}</a>
  </footer>
</article>

<style>
  .verify-page {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4) var(--space-7);
  }
  .crumbs {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-ash);
    margin-bottom: var(--space-5);
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .crumbs a {
    color: var(--color-ivory-dim);
    text-decoration: none;
    border-bottom: 1px solid var(--color-hairline);
  }
  .crumbs a:hover {
    border-bottom-color: var(--color-vermilion);
  }
  .intro {
    margin-bottom: var(--space-5);
  }
  h1 {
    font-size: 2.8rem;
    margin-bottom: var(--space-4);
  }
  .lede {
    max-width: var(--measure-body);
    color: var(--color-ivory-dim);
  }
  .page-footer {
    margin-top: var(--space-7);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-hairline);
  }
  .back {
    color: var(--color-ivory);
    text-decoration: none;
    border-bottom: 1px solid var(--color-hairline);
    padding-bottom: 2px;
  }
  .back:hover {
    border-bottom-color: var(--color-vermilion);
  }
</style>
