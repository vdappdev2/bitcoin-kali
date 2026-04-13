<svelte:head>
  <title>signdata — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="How signdata builds a Merkle Mountain Range over six data leaves and signs the root with a VerusID — one signature covering name, description, attributes, image hash, rights, and delivery."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 3 of 10</p>
    <h1>signdata</h1>
    <p class="lede">
      Six pieces of data, one signature, one provable tree.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      <code>signdata</code> is a Verus RPC call that builds a
      <strong>Merkle Mountain Range</strong> (MMR) over a set of data leaves,
      then signs the root hash with a VerusID's private key. The result is a
      compact cryptographic commitment: one signature that covers every leaf
      atomically.
    </p>
    <p>
      In Bitcoin Kali, each piece has six leaves:
    </p>
    <ol class="leaf-list">
      <li><strong>name</strong> — the Sanskrit epithet (e.g. "Mahāmāyā")</li>
      <li><strong>description</strong> — the devotional verse</li>
      <li><strong>attributes</strong> — generative metadata as JSON</li>
      <li><strong>image-datahash</strong> — the SHA-256 of the PNG file</li>
      <li><strong>rights</strong> — the on-chain rights assertion</li>
      <li><strong>delivery</strong> — z-address, EVK, txid, filename</li>
    </ol>
    <p>
      The signature is bound to a specific VDXF key
      (<code class="hex">i5mntfEpcAWot1dses5qu3hGom3y7r6VHm</code> —
      <code>series1</code>), scoping it to this project's data schema.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      Because the MMR covers all six fields, tampering with any single leaf
      changes the root hash and breaks the signature. The curator can't sign
      the name and image but leave the rights unsigned — it's all or nothing.
      And because the signature is bound to a named VDXF key, verifiers know
      exactly which schema the signature applies to.
    </p>
    <p>
      This atomic signing pattern extends naturally to any domain where
      multiple fields need joint provenance: an audit report with findings
      and recommendations, a medical record with diagnosis and treatment, a
      supply chain certificate with origin and test results.
    </p>
  </section>

  <section class="topic-section worked-example">
    <h2>Worked example</h2>
    <p>
      The curator <code>kali.bitcoins@</code>
      (<code class="hex">i5FXH74Xnqm3AS6iWJSLoMW1PZaev2F1bj</code>) signed
      piece 1 (<em>Destroyer of Fiat</em>) at block height
      <strong>4022271</strong>. The resulting outputs:
    </p>
    <dl class="example-fields">
      <div class="row">
        <dt>mmrroot</dt>
        <dd><code class="hex">020bd9feddc5fde8e7f8a16be7a99e0044c83544f24d01cf01324ff73093bf00</code></dd>
      </div>
      <div class="row">
        <dt>vdxfkeys</dt>
        <dd><code class="hex">["i5mntfEpcAWot1dses5qu3hGom3y7r6VHm"]</code></dd>
      </div>
      <div class="row">
        <dt>signer</dt>
        <dd><code class="hex">i5FXH74Xnqm3AS6iWJSLoMW1PZaev2F1bj</code></dd>
      </div>
    </dl>
    <p>
      The signature, the mmrroot, and a crosschaindataref pointing to the
      full mmrdescriptor are all stored in the piece's
      <a href="/learn/contentmultimap">contentmultimap</a> under the
      <code>series1.provenance</code> label
      (<code class="hex">i58zX14hJD7TqbLsnKMN6RHyPxtUC3jExx</code>).
    </p>
    <p>
      The mmrdescriptor itself — containing the per-leaf salts needed to
      reconstruct the tree — is delivered via
      <a href="/learn/sendcurrency">sendcurrency</a> to a shielded
      transaction:
      <code class="hex">be429f049365e4556becc05da181839e1ba6f999ae9f3999b615bb55db54276d</code>.
    </p>
  </section>

  <p class="see-live">
    <a href="/verify/destroyer-of-fiat">Watch the verification theatre reconstruct this proof →</a>
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
  .leaf-list {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-ivory);
    margin: 0 0 var(--space-3) var(--space-4);
    padding: 0;
  }
  .leaf-list li {
    margin-bottom: var(--space-1);
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
