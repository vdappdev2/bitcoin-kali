<svelte:head>
  <title>About — Bitcoin Kali</title>
  <meta
    name="description"
    content="Bitcoin Kali is a seven-piece Verus NFT series demonstrating on-chain identity, typed provenance, encrypted delivery, and publicly-verifiable rights — built entirely on Verus blockchain primitives."
  />
</svelte:head>

<article class="about">
  <header>
    <p class="eyebrow">Series 1 &nbsp;·&nbsp; live on Verus</p>
    <h1>About Bitcoin Kali</h1>
  </header>

  <section class="about-section">
    <h2>The project</h2>
    <p>
      Bitcoin Kali is a seven-piece generative art series registered as
      Verus identities on the VRSC mainnet. Each piece carries its own
      name, devotional verse, generative attributes, image hash, curator
      signature, rights assertion, and encrypted file delivery — all stored
      inside the identity's <a href="/learn/contentmultimap">contentmultimap</a>,
      all verifiable from public RPC.
    </p>
    <p>
      The series draws on the iconography of Kali — the Hindu goddess of
      time, destruction, and renewal — reframed through the lens of
      Bitcoin's challenge to fiat monetary systems. Each piece is named
      with a Sanskrit epithet and accompanied by a devotional verse.
    </p>
    <p>
      But the project isn't primarily about the art. It's a demonstration
      of what Verus can do: typed on-chain data, cryptographic provenance,
      encrypted file delivery, identity-bound rights, and a zero-trust
      verification model — all composed from protocol-level primitives.
    </p>
  </section>

  <section class="about-section">
    <h2>Why Verus</h2>
    <p>
      Most blockchain NFT systems store metadata off-chain (IPFS, Arweave,
      or a server) and reference it with a URL. If the host disappears,
      the metadata is gone. The NFT is a token ID and an owner address —
      everything else is a trust assumption.
    </p>
    <p>
      Verus enables a different approach. Each NFT is a
      <a href="/learn/identity">VerusID</a> — a self-sovereign identity
      with a human-readable name, an on-chain data store, and transferable
      control. The metadata isn't pointed-to; it's <em>part of</em> the
      identity. The curator's signature covers the data directly, not a URL.
      Verification is a single RPC call, not a chain of trust through
      intermediaries.
    </p>
    <p>
      Bitcoin Kali exists to show this in practice, with real mainnet data
      that anyone can check.
    </p>
  </section>

  <section class="about-section">
    <h2>Tech stack</h2>
    <dl class="tech-list">
      <div class="row">
        <dt>Chain</dt>
        <dd>Verus (VRSC) mainnet — public RPC via <code>api.verus.services</code></dd>
      </div>
      <div class="row">
        <dt>Viewer</dt>
        <dd>SvelteKit + adapter-static, Svelte 5, TypeScript</dd>
      </div>
      <div class="row">
        <dt>Images</dt>
        <dd>Decrypted live from chain via <code>decryptdata</code> on <code>rpc.vrsc.syncproof.net</code></dd>
      </div>
      <div class="row">
        <dt>Verification</dt>
        <dd>Client-side SHA-256 + live <code>verifysignature</code> RPC — no backend</dd>
      </div>
      <div class="row">
        <dt>Hosting</dt>
        <dd>Static files, no server, no database, no analytics, no tracking</dd>
      </div>
    </dl>
  </section>

  <section class="about-section">
    <h2>What you can verify</h2>
    <p>
      Nothing on this site is trusted. Every claim is independently
      checkable:
    </p>
    <ul class="verify-list">
      <li>Identity existence — <code>getidentity</code> on any Verus node</li>
      <li>Curator signature — <code>verifysignature</code> with the mmrroot and signature from the CMM</li>
      <li>Image integrity — <code>decryptdata</code> + SHA-256, compared against the on-chain uint256</li>
      <li>Rights assertion — stored on chain, signed into the MMR, tamper-evident</li>
      <li>Delivery — encrypted bytes on chain, viewing key published, anyone can decrypt</li>
    </ul>
    <p>
      The <a href="/learn">Learn</a> section walks through each primitive.
      The <a href="/verify/destroyer-of-fiat">verification theatre</a>
      runs the checks live, streaming each step as it happens.
    </p>
  </section>

  <section class="about-section">
    <h2>Links</h2>
    <ul class="link-list">
      <li><a href="https://verus.io" target="_blank" rel="noopener">verus.io</a> — Verus project home</li>
      <li><a href="https://docs.verus.io" target="_blank" rel="noopener">docs.verus.io</a> — Verus documentation</li>
      <li><a href="https://discord.com/invite/Mur4c8dgxD" target="_blank" rel="noopener">Verus Discord</a> — community</li>
      <li><a href="/gallery">Gallery</a> — the seven pieces</li>
      <li><a href="/learn">Learn</a> — ten guides to the Verus primitives used here</li>
    </ul>
  </section>

  <section class="about-section">
    <h2>Credits</h2>
    <p>
      Built on the Verus protocol. The identity, signing, and encrypted
      delivery primitives are Verus core features — this project
      demonstrates them, it didn't invent them. Thanks to the Verus
      community and core development team for building the infrastructure
      that makes this possible.
    </p>
    <p>
      Donate to "Verus Coin Foundation@"
    </p>
  </section>
</article>

<style>
  .about {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4) var(--space-7);
  }
  .about header {
    margin-bottom: var(--space-6);
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-vermilion);
    margin-bottom: var(--space-2);
  }
  h1 {
    font-family: var(--font-display);
    font-size: 2.4rem;
    color: var(--color-ivory);
    margin: 0;
    line-height: 1.15;
  }
  .about-section {
    margin-bottom: var(--space-6);
  }
  .about-section h2 {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ash);
    margin-bottom: var(--space-3);
  }
  .about-section p {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-ivory);
    margin-bottom: var(--space-3);
  }

  .tech-list {
    margin: 0;
    padding: var(--space-3);
    background: var(--color-ink-2);
    border-left: 2px solid var(--color-hairline);
  }
  .tech-list .row {
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
  }
  .tech-list .row:last-child {
    margin-bottom: 0;
  }
  .tech-list dt {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    color: var(--color-ash);
    min-width: 10ch;
    padding-top: 0.2em;
    flex-shrink: 0;
  }
  .tech-list dd {
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--color-ivory-dim);
  }

  .verify-list,
  .link-list {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-ivory);
    margin: 0 0 var(--space-3) var(--space-4);
    padding: 0;
  }
  .verify-list li,
  .link-list li {
    margin-bottom: var(--space-2);
  }
</style>
