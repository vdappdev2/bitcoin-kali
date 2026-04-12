<script lang="ts">
  import { MANIFEST, CHAIN_NAME } from '$lib/env';
  import { SERIES_TOTAL } from '$lib/manifest';
  const liveCount = MANIFEST.pieces.length;

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bitcoin Kali',
    alternateName: 'बिटकॉइन काली',
    url: '/',
    description:
      'A seven-piece Verus NFT series. Each work is a cryptographic identity on chain with typed VDXF contentmultimap provenance, curator-signed mmrroots, and publicly-verifiable encrypted file delivery. Every claim is checkable against the Verus blockchain.',
    inLanguage: ['en', 'sa-Deva'],
    publisher: { '@type': 'Organization', name: 'Bitcoin Kali' },
    potentialAction: {
      '@type': 'SearchAction',
      target: '/gallery',
      description: 'Browse the seven-piece gallery',
    },
  };
  const jsonldSafe = JSON.stringify(jsonld).replace(/</g, '\\u003c');
</script>

<svelte:head>
  <title>Bitcoin Kali — a seven-piece Verus NFT series with on-chain provenance</title>
  <meta
    property="og:title"
    content="Bitcoin Kali — a seven-piece Verus NFT series"
  />
  <meta
    property="og:description"
    content="Seven generative digital works, each a Verus identity. Typed VDXF contentmultimap provenance, curator-signed mmrroots, publicly-verifiable encrypted delivery."
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable project summary" />
  {@html `<script type="application/ld+json">${jsonldSafe}</script>`}
</svelte:head>

<article class="home">
  <header class="hero">
    <p class="eyebrow">Series 1 &nbsp;·&nbsp; {liveCount} of {SERIES_TOTAL} live on {CHAIN_NAME}</p>
    <h1>
      <span class="devanagari" lang="sa">बिटकॉइन काली</span>
      <span class="translit">Bitcoin Kali</span>
    </h1>
    <p class="lede">
      A seven-piece Verus NFT series. Each work is a cryptographic identity on chain,
      carrying its own name, verse, attributes, image hash, signed provenance, rights
      assertion, and encrypted file delivery — all inside a typed
      <code>contentmultimap</code>, all reproducible from public RPC.
    </p>
    <p class="lede">
      Nothing on this page is trusted. Every claim — the image bytes, the signature,
      the curator attribution — is checkable against the Verus blockchain. The viewer
      shows its work at every step.
    </p>
    <p class="cta-row">
      <a class="cta" href="/gallery">Enter the gallery →</a>
    </p>
  </header>

  <section class="pillars" aria-label="What this site proves">
    <h2 class="section-label">What you can verify here</h2>
    <ol class="pillar-list">
      <li>
        <strong>Chain-anchored identity.</strong>
        Each piece is a Verus identity. The i-address, the <code>contentmultimap</code>,
        and the block it was registered at are all queryable from public RPC.
      </li>
      <li>
        <strong>Typed VDXF provenance.</strong>
        Ten <code>DataDescriptor</code>s per piece cover name, verse, attributes, image
        reference, image hash, signature, mmrroot, mmrdescriptor reference, rights,
        and delivery. Types are bound by vdxfid, not string schemas.
      </li>
      <li>
        <strong>Signed mmrroot.</strong>
        The curator signs the Merkle Mountain Range root of each piece's data tree.
        <code>verifysignature</code> against the curator's i-address confirms it.
      </li>
      <li>
        <strong>Hash-matched image.</strong>
        The PNG is delivered via a shielded <code>sendcurrency</code> note. After
        decrypt, <code>SHA-256</code> on the bytes matches the on-chain
        <code>uint256</code> byte-for-byte.
      </li>
    </ol>
  </section>

</article>

<style>
  .home {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-7) var(--space-4);
  }

  .hero {
    max-width: var(--measure-wide);
  }
  .eyebrow {
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.72rem;
    color: var(--color-vermilion);
    margin-bottom: var(--space-4);
  }
  h1 {
    font-size: 3.2rem;
    line-height: 1.05;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: var(--space-5);
  }
  .devanagari {
    font-family: var(--font-display);
    letter-spacing: 0.005em;
  }
  .translit {
    font-family: var(--font-body);
    font-size: 1.1rem;
    font-style: italic;
    color: var(--color-ivory-dim);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .lede {
    max-width: var(--measure-body);
    font-size: 1.1rem;
  }
  .lede code {
    color: var(--color-ivory);
    font-size: 0.92em;
  }

  .cta-row {
    margin-top: var(--space-5);
    margin-bottom: var(--space-7);
  }
  .cta {
    font-family: var(--font-body);
    font-size: 1.05rem;
    color: var(--color-ivory);
    border-bottom: 1px solid var(--color-vermilion);
    padding-bottom: 2px;
    text-decoration: none;
  }
  .cta:hover {
    color: var(--color-vermilion);
  }

  .pillars {
    margin-top: var(--space-6);
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-hairline);
  }
  .section-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--color-ash);
    margin-bottom: var(--space-4);
    font-weight: 400;
  }
  .pillar-list {
    list-style: decimal;
    padding-left: 1.2em;
    max-width: var(--measure-body);
  }
  .pillar-list li {
    margin-bottom: var(--space-3);
    padding-left: 0.3em;
  }
  .pillar-list strong {
    font-weight: 600;
    color: var(--color-ivory);
  }
  .pillar-list code {
    color: var(--color-ivory);
  }

</style>
