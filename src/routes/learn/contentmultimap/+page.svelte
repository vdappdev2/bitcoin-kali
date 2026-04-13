<svelte:head>
  <title>contentmultimap — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="The contentmultimap is an on-chain key-value store inside every Verus identity. Bitcoin Kali puts the entire NFT — all ten typed DataDescriptors — inside it."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 2 of 8</p>
    <h1>contentmultimap</h1>
    <p class="lede">
      Every Verus identity carries a built-in key-value store, and this
      project puts the entire NFT inside it.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      The contentmultimap (CMM) is a data structure attached to every
      VerusID. It maps <a href="/learn/vdxf-keys">VDXF i-address keys</a>
      to arrays of typed DataDescriptor values. Think of it as an on-chain
      document store where the keys are deterministic and the values are
      self-describing.
    </p>
    <p>
      This is fundamentally different from the contract-and-tokenURI model
      used by Ethereum NFTs. On Ethereum, the token contract stores a URL
      that points to metadata hosted elsewhere — IPFS, Arweave, or a
      server. If the host goes down, the metadata is gone. On Verus, the
      metadata is <em>part of the identity itself</em>. It lives on chain,
      typed, signed, and retrievable via a single RPC call.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      Because the data is on chain and self-describing, there is no external
      dependency to break. No IPFS pin to expire, no server to go offline,
      no API to rate-limit. Anyone with a Verus node (or access to a public
      RPC endpoint) can call <code>getidentity</code>, <code>getidentitycontent</code>, or <code>getidentityhistory</code> and read the full CMM
      directly. This viewer uses <code>getidentity</code>.
    </p>
    <p>
      The typed DataDescriptor format means each entry carries its own
      structure information — a viewer doesn't need out-of-band knowledge
      to parse it. The combination of deterministic keys and self-describing
      values makes the CMM a general-purpose on-chain data layer for any
      application: credentials, supply chain records, legal instruments, or
      NFTs.
    </p>
  </section>

  <section class="topic-section worked-example">
    <h2>Worked example</h2>
    <p>
      Each Bitcoin Kali piece has one outer key
      (<code class="hex">i5mntfEpcAWot1dses5qu3hGom3y7r6VHm</code> —
      <code>series1</code>) containing an array of 10 DataDescriptors.
      Three distinct types are used:
    </p>

    <h3>Message DataDescriptors <span class="dd-flag">(flags: 96)</span></h3>
    <p>
      Human-readable text or JSON with an explicit mimetype. Five of the ten
      slots use this type:
    </p>
    <dl class="example-fields">
      <div class="row">
        <dt>name</dt>
        <dd><code class="hex">iQtY1MAM98kf4Ep9AkF6yZ2LRbRUH1Jy1r</code> — <code>text/plain</code> → "Mahāmāyā"</dd>
      </div>
      <div class="row">
        <dt>desc</dt>
        <dd><code class="hex">iCnywaD6yMYuao5cc5WJmNPcpvCDrDXtNE</code> — <code>text/plain</code> → devotional verse</dd>
      </div>
      <div class="row">
        <dt>attrs</dt>
        <dd><code class="hex">iLZq1iNgauVEfV4tN3eapkZcpw3cXTyfyH</code> — <code>application/json</code> → generative attributes</dd>
      </div>
      <div class="row">
        <dt>rights</dt>
        <dd><code class="hex">iMkRBt9sEbrXLxYLxo6s9CgaGEfTeJQf5i</code> — <code>text/plain</code> → rights assertion (~1500 bytes)</dd>
      </div>
      <div class="row">
        <dt>delivery</dt>
        <dd><code class="hex">iMd6GTxpdqoUJjXC87aXVPpKjzZQ3y4bzA</code> — <code>application/json</code> → z-addr, EVK, txid, filename</dd>
      </div>
    </dl>

    <h3>Typed DataDescriptors <span class="dd-flag">(flags: 32, auto-set)</span></h3>
    <p>
      Structured data where the daemon sets the type automatically. Three
      sub-types appear:
    </p>
    <dl class="example-fields">
      <div class="row">
        <dt>crosschaindataref</dt>
        <dd>Pointer to a transaction (txid + vout). Used for the image
          reference and the mmrdescriptor reference.</dd>
      </div>
      <div class="row">
        <dt>uint256</dt>
        <dd>32-byte hash. Used for the image SHA-256 and the mmrroot.</dd>
      </div>
      <div class="row">
        <dt>signaturedata</dt>
        <dd>The curator's signature block — identity, hash, base64 signature,
          and the VDXF key it's bound to.</dd>
      </div>
    </dl>

    <p>
      All 10 DataDescriptors fit in roughly 5000 bytes on chain. The entire
      NFT — name, verse, attributes, image hash, signature, provenance root,
      rights, and delivery info — lives inside a single identity's CMM.
    </p>
  </section>

  <p class="see-live">
    <a href="/piece/destroyer-of-fiat">See the parsed CMM for Destroyer of Fiat →</a>
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
  .topic-section h3 {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-ivory);
    margin: var(--space-4) 0 var(--space-2);
  }
  .dd-flag {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--color-ash);
    font-weight: 400;
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
    min-width: 9ch;
    padding-top: 0.2em;
    flex-shrink: 0;
  }
  dd {
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--color-ivory-dim);
    line-height: 1.5;
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
