<svelte:head>
  <title>VerusID — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="Each Bitcoin Kali artwork isn't stored on an identity — it IS an identity. VerusID is a self-sovereign identity with human-readable names, on-chain data, and transferable control."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 5 of 8</p>
    <h1>VerusID</h1>
    <p class="lede">
      Each artwork isn't stored on an identity — it <em>is</em> an identity.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      A VerusID is a self-sovereign identity on the Verus blockchain. It has
      a human-readable name (like <code>Destroyer of Fiat.bitcoins@</code>),
      a deterministic i-address
      (<code class="hex">i3xD7bRKEtJdMmKjoxMHyBjoURebQsGFhV</code>),
      primary addresses that control it, revocation and recovery authorities,
      and a <a href="/learn/contentmultimap">contentmultimap</a> — an
      on-chain key-value store.
    </p>
    <p>
      Identities are registered under parent namespaces.
      <code>bitcoins@</code> is the parent namespace for this project, and
      each piece is a child identity under it. The curator
      <code>kali.bitcoins@</code> is also a child of the same namespace.
    </p>
    <p>
      This is fundamentally different from Ethereum NFTs. On Ethereum, an NFT
      is a row in a contract's storage — a token ID and an owner address. The
      metadata is elsewhere. On Verus, the identity <em>is</em> the asset. It
      carries its own name, data, provenance, and rights. Transfer the
      identity's primary addresses and you transfer everything — no separate
      instrument required.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      Identity as a container means that control, data, and rights are
      unified in one on-chain object. When you update the primary addresses
      of <code>Destroyer of Fiat.bitcoins@</code>, the new controller
      inherits the name, the CMM data, the signed provenance, and the
      <a href="/learn/on-chain-rights">rights assertion</a> — atomically.
    </p>
    <p>
      VerusIDs also support a <code>privateaddress</code> field — a shielded
      z-address that acts as the identity's mailbox. Send to
      <code>ID@:private</code> and the data arrives encrypted at the
      identity's z-address. This makes identity-to-identity messaging
      possible without revealing who is communicating, which is a building
      block for agent-to-agent communication in an on-chain economy.
    </p>
    <p>
      The same identity primitive works for credentials, certificates, legal
      entities, or autonomous agents. Anything that needs a name, an owner,
      and structured on-chain data can be a VerusID.
    </p>
  </section>

  <section class="topic-section worked-example">
    <h2>Worked example</h2>
    <p>
      Bitcoin Kali has 8 identities on VRSC mainnet — 1 curator and 7 NFTs:
    </p>
    <dl class="example-fields">
      <div class="row">
        <dt>curator</dt>
        <dd>
          <code>kali.bitcoins@</code><br />
          <code class="hex">i5FXH74Xnqm3AS6iWJSLoMW1PZaev2F1bj</code><br />
          Block 4022359
        </dd>
      </div>
      <div class="row">
        <dt>piece 1</dt>
        <dd>
          <code>Destroyer of Fiat.bitcoins@</code><br />
          <code class="hex">i3xD7bRKEtJdMmKjoxMHyBjoURebQsGFhV</code><br />
          Block 4022399
        </dd>
      </div>
      <div class="row">
        <dt>piece 2</dt>
        <dd>
          <code>Slayer of Bankers.bitcoins@</code><br />
          <code class="hex">iNjVMpJ5UHzFkPqj2pnKNTydCqL8cqg7EK</code><br />
          Block 4022399
        </dd>
      </div>
      <div class="row">
        <dt>piece 3</dt>
        <dd>
          <code>Bane of Debasement.bitcoins@</code><br />
          <code class="hex">iBLqEpqnCriDbpwavQL1PNffQQe9qp6SW3</code><br />
          Block 4022403
        </dd>
      </div>
      <div class="row">
        <dt>piece 4</dt>
        <dd>
          <code>Goddess of Sovereignty.bitcoins@</code><br />
          <code class="hex">iE2g92tYqhq17Pgwj5xJtn2W14q3QKQbK2</code><br />
          Block 4022410
        </dd>
      </div>
      <div class="row">
        <dt>piece 5</dt>
        <dd>
          <code>Devourer of Time.bitcoins@</code><br />
          <code class="hex">iJwuAi1htck5yxJQVSEaWXczGnXNo5d47P</code><br />
          Block 4022414
        </dd>
      </div>
      <div class="row">
        <dt>piece 6</dt>
        <dd>
          <code>Kali of the Cremation Ground.bitcoins@</code><br />
          <code class="hex">i81vUWkBiVjk2GXbNChv2A2VHan1QpWdwn</code><br />
          Block 4022414
        </dd>
      </div>
      <div class="row">
        <dt>piece 7</dt>
        <dd>
          <code>Mother of the Immutable.bitcoins@</code><br />
          <code class="hex">iQz4vqD43Zj1snj91wGPHZxeEWd1K1jYj1</code><br />
          Block 4022421
        </dd>
      </div>
    </dl>
    <p>
      Each of these is queryable with a single call:
      <code>getidentity "Destroyer of Fiat.bitcoins@"</code>. The returned
      object includes the full contentmultimap, primary addresses, and all
      authority keys.
    </p>
  </section>

  <p class="see-live">
    <a href="/piece/destroyer-of-fiat">See Destroyer of Fiat's identity data →</a>
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
    margin-bottom: var(--space-3);
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
    flex-shrink: 0;
  }
  dd {
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--color-ivory-dim);
    line-height: 1.6;
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
