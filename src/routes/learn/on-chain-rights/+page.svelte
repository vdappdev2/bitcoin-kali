<svelte:head>
  <title>On-Chain Rights — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="The rights assertion is signed into the same Merkle tree as the image hash — tamper with one and you break both. Rights travel with identity control, no separate instrument needed."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 7 of 8</p>
    <h1>On-Chain Rights</h1>
    <p class="lede">
      The rights assertion is signed into the same Merkle tree as the
      image hash — tamper with one and you break both.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      Each Bitcoin Kali piece carries a rights assertion as a DataDescriptor
      in its <a href="/learn/contentmultimap">contentmultimap</a>, stored
      under the <code>series1.rights</code> label
      (<code class="hex">iMkRBt9sEbrXLxYLxo6s9CgaGEfTeJQf5i</code>). The
      text is approximately 1500 bytes of plain English stating that the
      current holder of the identity receives all transferable property
      rights in the underlying image.
    </p>
    <p>
      Crucially, the rights text is the fifth leaf of the six-leaf MMR that
      the curator <a href="/learn/signdata">signed</a>. It sits alongside
      the name, description, attributes, image hash, and delivery info.
      Modifying the rights text changes the MMR root and invalidates the
      curator's signature — the rights assertion and the image provenance
      are cryptographically bound together.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      Rights travel with identity control. When the identity's primary
      addresses change hands, the new controller inherits the rights
      assertion automatically. No separate legal instrument, no escrow
      service, no intermediary. The on-chain state <em>is</em> the rights
      record.
    </p>
    <p>
      This is a demonstration of <em>capability</em>, not a legal opinion.
      The rights text itself includes a disclaimer acknowledging that
      on-chain rights assertions are a new pattern and recommends holders
      consult their own counsel. But the mechanism — a signed, immutable,
      publicly-verifiable rights statement bound to a transferable identity —
      is general-purpose.
    </p>
    <p>
      Licenses, warranties, terms of service, evidence certifications — any
      assertion that needs to be (a) publicly verifiable, (b) bound to a
      specific asset, and (c) tamper-evident can use this pattern. The
      signature ensures nobody can change the terms after the fact.
    </p>
  </section>

  <section class="topic-section worked-example">
    <h2>Worked example</h2>
    <p>
      The rights assertion for <em>Destroyer of Fiat</em> opens with:
    </p>
    <blockquote class="rights-excerpt">
      "This artwork is part of the Bitcoin Kali Series 1, a limited set of
      seven (7) original digital works created by the curator and registered
      as Verus identities under the <code>bitcoins@</code> namespace. The
      current holder of this NFT's Verus identity — that is, the party in
      control of the identity's primary authority at any given time — is
      hereby granted all transferable property rights in the underlying
      image that the curator is lawfully able to convey..."
    </blockquote>
    <dl class="example-fields">
      <div class="row">
        <dt>label</dt>
        <dd><code class="hex">iMkRBt9sEbrXLxYLxo6s9CgaGEfTeJQf5i</code> (series1.rights)</dd>
      </div>
      <div class="row">
        <dt>type</dt>
        <dd>Message DataDescriptor, <code>text/plain</code>, flags: 96</dd>
      </div>
      <div class="row">
        <dt>MMR leaf</dt>
        <dd>Leaf 5 of 6 in the curator's signed data tree</dd>
      </div>
    </dl>
    <p>
      The same rights text appears in all 7 pieces' CMMs. Each is
      independently signed by the curator and independently verifiable via
      <a href="/learn/verifysignature"><code>verifysignature</code></a>.
    </p>
  </section>

  <p class="see-live">
    <a href="/piece/destroyer-of-fiat">Read the full rights assertion on the piece page →</a>
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
  .rights-excerpt {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-style: italic;
    line-height: 1.6;
    color: var(--color-ivory-dim);
    border-left: 2px solid var(--color-vermilion);
    padding: var(--space-3) var(--space-4);
    margin: var(--space-3) 0 var(--space-4);
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
    margin-bottom: var(--space-2);
  }
  .row:last-child {
    margin-bottom: 0;
  }
  dt {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    color: var(--color-ash);
    min-width: 8ch;
    padding-top: 0.2em;
    flex-shrink: 0;
  }
  dd {
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--color-ivory-dim);
  }
  .hex {
    font-family: var(--font-mono);
    font-size: 0.78rem;
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
