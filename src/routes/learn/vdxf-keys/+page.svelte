<svelte:head>
  <title>VDXF Keys — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="How Verus deterministically derives i-addresses from URI strings using getvdxfid — no registration, no authority, no trust."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 1 of 8</p>
    <h1>VDXF Keys</h1>
    <p class="lede">
      A URI goes in, a deterministic i-address comes out — no registration,
      no authority, no trust.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      VDXF (Verus Data eXchange Format) is a deterministic key derivation
      system built into the Verus protocol. Given any URI string — like
      <code>kali.bitcoins.vrsc::series1.name</code> — the RPC call
      <code>getvdxfid</code> hashes it to produce a unique i-address. That
      i-address becomes the key in a <a href="/learn/contentmultimap">contentmultimap</a>.
    </p>
    <p>
      The derivation is pure computation: same input, same output, on any
      machine, before or after any identity is registered. No lookup table,
      no registry, no authority. The URI encodes semantic meaning (what this
      slot is for), and the resulting i-address is its on-chain identifier.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      Deterministic keys mean that any viewer, auditor, or autonomous agent
      can independently compute which slot holds which data — without
      trusting a registry or calling an API. If you know the URI naming
      convention, you know where to look. If the data is at the expected
      key, the schema is self-describing.
    </p>
    <p>
      This pattern generalises beyond NFTs. Supply chain identifiers,
      credential schemas, document type registries — any system where
      structured data needs a deterministic, collision-resistant key can use
      VDXF derivation.
    </p>
  </section>

  <section class="topic-section worked-example">
    <h2>Worked example</h2>
    <p>
      Bitcoin Kali uses eight VDXF keys, all under the
      <code>kali.bitcoins.vrsc::</code> namespace. Here are three resolved
      on VRSC mainnet:
    </p>
    <dl class="example-fields">
      <div class="row">
        <dt>URI</dt>
        <dd><code>kali.bitcoins.vrsc::series1</code></dd>
      </div>
      <div class="row">
        <dt>i-address</dt>
        <dd><code class="hex">i5mntfEpcAWot1dses5qu3hGom3y7r6VHm</code></dd>
      </div>
      <div class="row">
        <dt>Role</dt>
        <dd>Outer key — the contentmultimap container for each piece's 10 DataDescriptors</dd>
      </div>
    </dl>
    <dl class="example-fields">
      <div class="row">
        <dt>URI</dt>
        <dd><code>kali.bitcoins.vrsc::series1.name</code></dd>
      </div>
      <div class="row">
        <dt>i-address</dt>
        <dd><code class="hex">iQtY1MAM98kf4Ep9AkF6yZ2LRbRUH1Jy1r</code></dd>
      </div>
      <div class="row">
        <dt>Role</dt>
        <dd>Label for the name DataDescriptor (e.g. "Mahāmāyā")</dd>
      </div>
    </dl>
    <dl class="example-fields">
      <div class="row">
        <dt>URI</dt>
        <dd><code>kali.bitcoins.vrsc::series1.provenance</code></dd>
      </div>
      <div class="row">
        <dt>i-address</dt>
        <dd><code class="hex">i58zX14hJD7TqbLsnKMN6RHyPxtUC3jExx</code></dd>
      </div>
      <div class="row">
        <dt>Role</dt>
        <dd>Label for the signature, mmrroot, and mmrdescriptor reference</dd>
      </div>
    </dl>
    <p>
      Anyone with access to a Verus node can run
      <code>getvdxfid "kali.bitcoins.vrsc::series1.name"</code> and get the
      same <code class="hex">iQtY1MAM98kf4Ep9AkF6yZ2LRbRUH1Jy1r</code> —
      no trust involved.
    </p>
  </section>

  <p class="see-live">
    <a href="/curator">See the full key table on the Curator page →</a>
  </p>
</article>

<style>
  .learn-topic header {
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
    font-size: 2.2rem;
    color: var(--color-ivory);
    margin: 0 0 var(--space-4);
    line-height: 1.15;
  }
  .lede {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--color-ivory);
  }

  .topic-section {
    margin-bottom: var(--space-6);
  }
  .topic-section h2 {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ash);
    margin-bottom: var(--space-3);
  }
  .topic-section p {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-ivory);
    margin-bottom: var(--space-3);
  }

  .example-fields {
    margin: var(--space-3) 0 var(--space-4);
    padding: var(--space-3);
    background: var(--color-ink-2);
    border-left: 2px solid var(--color-hairline);
  }
  .row {
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-1);
  }
  .row:last-child {
    margin-bottom: 0;
  }
  dt {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    color: var(--color-ash);
    min-width: 7ch;
    padding-top: 0.2em;
  }
  dd {
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--color-ivory-dim);
  }
  .hex {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    word-break: break-all;
  }

  .see-live {
    margin-top: var(--space-5);
    font-family: var(--font-body);
    font-size: 1rem;
  }
  .see-live a {
    color: var(--color-vermilion);
    text-decoration: none;
    border-bottom: 1px solid transparent;
  }
  .see-live a:hover {
    border-bottom-color: var(--color-vermilion);
  }
</style>
