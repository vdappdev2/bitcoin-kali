<svelte:head>
  <title>verifysignature — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="One RPC call, no API key, no account. verifysignature checks that a Verus signature is valid for the claimed identity and data — anyone can run it."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 4 of 8</p>
    <h1>verifysignature</h1>
    <p class="lede">
      One RPC call. No API key. No account. Pass the data, pass the
      signature, get a boolean.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      <code>verifysignature</code> is a Verus RPC call that checks whether a
      signature is valid for the claimed identity and data hash. You pass in
      the signer's i-address, the data hash (in this project, the mmrroot),
      the signature block, and the VDXF key it's bound to. The daemon returns
      a boolean.
    </p>
    <p>
      The call is public, read-only, and stateless. It runs against any Verus
      node — your own, or a public RPC endpoint like
      <code>api.verus.services</code>. No authentication, no rate limits, no
      account creation.
    </p>
    <p>
      In the viewer, this is step 4 of the six-step
      <a href="/verify/destroyer-of-fiat">verification theatre</a>. The
      viewer calls <code>verifysignature</code> live against mainnet and
      streams the result as you watch.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      Any system that produces signed assertions needs a way for third parties
      to verify them independently. On most platforms, verification requires
      an SDK, an API key, a specific library, or trust in the issuer's
      infrastructure. On Verus, it's a single RPC call that any node can
      answer.
    </p>
    <p>
      This makes verification accessible to autonomous agents. An AI agent
      evaluating a credential, a supply chain robot checking a provenance
      claim, or a smart contract on another chain can call
      <code>verifysignature</code> and get a cryptographic yes/no — no OAuth
      flow, no API key management, no rate limit negotiation.
    </p>
  </section>

  <section class="topic-section worked-example">
    <h2>Worked example</h2>
    <p>
      To verify the curator's signature on <em>Destroyer of Fiat</em>, the
      viewer constructs this call:
    </p>
    <dl class="example-fields">
      <div class="row">
        <dt>method</dt>
        <dd><code>verifysignature</code></dd>
      </div>
      <div class="row">
        <dt>address</dt>
        <dd><code class="hex">i5FXH74Xnqm3AS6iWJSLoMW1PZaev2F1bj</code> (kali.bitcoins@)</dd>
      </div>
      <div class="row">
        <dt>datahash</dt>
        <dd><code class="hex">00bf9330f74f3201cf014df24435c844009ea9e76ba1f8e7e8fdc5ddfed90b02</code> (mmrroot, LE)</dd>
      </div>
      <div class="row">
        <dt>hashtype</dt>
        <dd><code>1</code> (SHA-256)</dd>
      </div>
      <div class="row">
        <dt>vdxfkeys</dt>
        <dd><code class="hex">["i5mntfEpcAWot1dses5qu3hGom3y7r6VHm"]</code> (series1)</dd>
      </div>
      <div class="row">
        <dt>signature</dt>
        <dd><code class="hex">AgX/Xz0AAUEgqOiR6yhqQTgnAzvpe2jzL/6geOvL+Xm...</code></dd>
      </div>
    </dl>
    <p>
      The daemon checks the signature against the curator's public key at the
      specified block height, confirms it commits to the given datahash and
      vdxfkeys, and returns <code>true</code>. The entire process is one
      HTTP POST to any public Verus RPC endpoint.
    </p>
  </section>

  <p class="see-live">
    <a href="/verify/destroyer-of-fiat">Watch verifysignature run live in the verification theatre →</a>
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
