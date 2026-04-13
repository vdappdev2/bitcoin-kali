<svelte:head>
  <title>Verus Marketplace — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="No platform, no escrow, no intermediary. The Verus marketplace uses makeoffer, getoffers, and takeoffer for decentralized atomic swaps — built into the protocol."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 10 of 10</p>
    <h1>Verus Marketplace</h1>
    <p class="lede">
      No smart contract. No escrow. No intermediary.
      <code>makeoffer</code> locks the asset on chain;
      <code>takeoffer</code> executes the swap atomically.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      The Verus marketplace is built into the protocol. Three RPC calls
      do everything:
    </p>
    <ul class="call-list">
      <li>
        <strong><code>makeoffer</code></strong> — creates a listing. The
        offered asset is locked on chain until the offer is taken, expires,
        or is cancelled via <code>closeoffers</code>.
      </li>
      <li>
        <strong><code>getoffers</code></strong> — discovers listings.
        Anyone can query offers for any currency. No account, no auth,
        no rate limit.
      </li>
      <li>
        <strong><code>takeoffer</code></strong> — executes the swap.
        Both sides exchange in a single transaction, or neither does.
        The swap is atomic — the protocol enforces it, not a third party.
      </li>
    </ul>
    <p>
      No marketplace contract to audit. No platform that can be shut
      down, censored, or hacked. No fee beyond the network transaction
      cost (~0.0001 VRSC). The offers are public and discoverable by
      anyone via <code>getoffers</code>.
    </p>
  </section>

  <section class="topic-section">
    <h2>How it works for Bitcoin Kali</h2>
    <p>
      The curator (<code>kali.bitcoins@</code>) holds the
      <a href="/learn/control-tokens">control token</a> for each piece.
      Each token has a total supply of 0.00000001 — one satoshi,
      indivisible. The curator lists each token via <code>makeoffer</code>
      for 258 VRSC, with payment directed to
      <code>Verus Coin Foundation@</code>.
    </p>
    <p>
      A buyer calls <code>takeoffer</code> with the offer's txid,
      delivers 258 VRSC, and receives the control token atomically. The
      buyer now holds the token that represents the identity on the
      marketplace. They can then revoke the identity and recover it with a new primary address
      to take full control.
    </p>
  </section>

  <section class="topic-section">
    <h2>Worked example</h2>
    <p>
      Here's what the <code>makeoffer</code> call looks like for one
      piece:
    </p>
    <pre><code>makeoffer
  fromaddress: "kali.bitcoins@"
  offer: &#123;
    "currency": "Destroyer of Fiat.bitcoins",
    "amount": 0.00000001
  &#125;
  for: &#123;
    "currency": "VRSC",
    "amount": 258,
    "address": "Verus Coin Foundation@"
  &#125;
  expiryheight: ~current + 1000000
  changeaddress: "kali.bitcoins@"</code></pre>
    <p>
      The offer locks 0.00000001 of the control token on chain. The
      <code>expiryheight</code> is set roughly two years into the future
      (~1,000,000 blocks). If nobody takes the offer by that height, the
      token unlocks and returns to the curator.
    </p>
    <p>
      To check if the offer is still active, call
      <code>getoffers "Destroyer of Fiat.bitcoins" true</code>. The
      response lists all open offers for that currency, including the
      offered amount, the asking price, and the block height at which the
      offer expires. Compare the expiry height against the current block
      height (from <code>getinfo</code>) to see if the offer is live.
    </p>
  </section>

  <section class="topic-section">
    <h2>Offer lifecycle</h2>
    <ul class="call-list">
      <li>
        <strong>Active</strong> — the offer is on chain, the asset is
        locked, the current block height is below the expiry height.
        Anyone can take it.
      </li>
      <li>
        <strong>Taken</strong> — a buyer called <code>takeoffer</code>.
        The swap executed atomically. The offer no longer appears in
        <code>getoffers</code>.
      </li>
      <li>
        <strong>Expired</strong> — the block height passed the expiry.
        The asset unlocks and returns to the offerer. The offer may still
        appear in <code>getoffers</code> until the chain prunes it.
      </li>
      <li>
        <strong>Cancelled</strong> — the offerer called
        <code>closeoffers</code> before expiry. The asset unlocks
        immediately.
      </li>
    </ul>
  </section>

  <section class="topic-section">
    <h2>Autonomous agents</h2>
    <p>
      The marketplace is particularly interesting for AI agents. An agent
      can discover offers via <code>getoffers</code>, evaluate prices
      programmatically, and execute swaps via <code>takeoffer</code> —
      all via RPC. No account creation, no OAuth flow, no platform
      approval. The same three RPC calls that a human uses are the same
      three an agent uses.
    </p>
    <p>
      An agent with a VerusID and some VRSC can participate in the
      marketplace as a first-class actor. It can list assets, take
      offers, check expiry heights, and manage its own portfolio — all
      autonomously, all on chain, all verifiable.
    </p>
  </section>

  <section class="topic-section">
    <h2>What this enables</h2>
    <p>
      True p2p swaps. No middleman takes a cut. No platform decides what can be listed.
      No server needs to stay online. The chain itself is the marketplace. Trustless, permissionless exchange of ownership, rights, assets and more.
    </p>
  </section>

  <p class="see-live">
    <a href="/offers">See the live marketplace listings →</a>
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
  .call-list {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-ivory);
    margin: 0 0 var(--space-4) var(--space-4);
    padding: 0;
  }
  .call-list li {
    margin-bottom: var(--space-3);
  }
  pre {
    max-width: var(--measure-body);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-hairline);
    border-radius: 4px;
    padding: var(--space-3);
    margin-bottom: var(--space-3);
    overflow-x: auto;
  }
  pre code {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-ivory);
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
