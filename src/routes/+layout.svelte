<script lang="ts">
  import '../app.css';
  import ChainBadge from '$lib/components/ChainBadge.svelte';
  import { CHAIN_NAME } from '$lib/env';
  let { children } = $props();
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0a0805" />
  <meta name="color-scheme" content="dark" />
  <meta name="generator" content="SvelteKit + adapter-static" />
  <meta name="author" content="Bitcoin Kali" />
  <meta
    name="description"
    content="Bitcoin Kali — a seven-piece Verus NFT series with on-chain identity, typed VDXF contentmultimap provenance, curator-signed mmrroots, and publicly-verifiable encrypted file delivery. Every claim on this site is checkable against the Verus blockchain."
  />
</svelte:head>

<header class="site-header">
  <div class="masthead">
    <a href="/" class="title">
      <span class="devanagari" lang="sa">बिटकॉइन काली</span>
      <span class="roman">Bitcoin Kali</span>
    </a>
    <ChainBadge chain={CHAIN_NAME} />
  </div>
  <nav aria-label="Primary">
    <a href="/gallery">Gallery</a>
    <a href="/curator">Curator</a>
    <a href="/offers">Offers</a>
    <a href="/learn">Learn</a>
    <a href="/about">About</a>
  </nav>
</header>

<main>
  {@render children()}
</main>

<footer class="site-footer">
  <p class="line">
    Seven generative works. Signed leaves, typed contentmultimap, publicly-verifiable delivery.
    Anyone can run the same checks the viewer does.
  </p>
  <p class="line meta">
    <ChainBadge chain={CHAIN_NAME} />
  </p>
</footer>

<style>
  .site-header {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-5) var(--space-4) var(--space-4);
    border-bottom: 1px solid var(--color-hairline);
  }
  .masthead {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .title {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    text-decoration: none;
    color: var(--color-ivory);
  }
  .title:hover {
    text-decoration: none;
  }
  .devanagari {
    font-family: var(--font-display);
    font-size: 1.6rem;
    line-height: 1;
    letter-spacing: 0.01em;
  }
  .roman {
    font-family: var(--font-body);
    font-size: 0.75rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-ivory-dim);
  }
  nav {
    margin-top: var(--space-3);
    display: flex;
    gap: var(--space-4);
    font-family: var(--font-body);
    font-size: 0.95rem;
  }
  nav a {
    color: var(--color-ivory);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    padding-bottom: 2px;
  }
  nav a:hover {
    border-bottom-color: var(--color-vermilion);
  }
  main {
    min-height: 60vh;
  }

  .site-footer {
    max-width: var(--measure-wide);
    margin: var(--space-8) auto var(--space-6);
    padding: var(--space-5) var(--space-4) var(--space-4);
    border-top: 1px solid var(--color-hairline);
  }
  .site-footer .line {
    max-width: var(--measure-body);
    color: var(--color-ivory-dim);
    font-size: 0.9rem;
  }
  .site-footer .meta {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-ash);
    margin-top: var(--space-3);
  }
</style>
