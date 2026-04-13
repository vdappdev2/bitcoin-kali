<svelte:head>
  <title>ID Control Tokens — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="Every Bitcoin Kali identity has a control token — a currency with a supply of one satoshi that represents ownership on the Verus decentralized marketplace."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 9 of 10</p>
    <h1>ID Control Tokens</h1>
    <p class="lede">
      A currency with a supply of one satoshi, having independent revocation and recovery authority over its namespace ID@,
      transferrable, and tradeable on a decentralized marketplace.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      Every Bitcoin Kali piece has a control token — a currency created
      with <code>definecurrency</code> that shares its name and i-address
      with the identity it's bound to. The token for
      <code>Destroyer of Fiat.bitcoins@</code> is the currency
      <code>Destroyer of Fiat.bitcoins</code> (no <code>@</code> —
      currencies don't have <code>@</code>). Same i-address:
      <code class="mono">i3xD7bRKEtJdMmKjoxMHyBjoURebQsGFhV</code>.
    </p>
    <p>
      The total supply is 0.00000001 — one satoshi, indivisible. It was
      preallocated to the curator (<code>kali.bitcoins@</code>) at
      creation. There's exactly one unit in existence, and whoever holds
      it gains control over the identity by way of revoke and recover authorities.  They can also make or take offers on the marketplace. (An ID@ with a control token can only be offered on the marketplace as control token)
    </p>
  </section>

  <section class="topic-section">
    <h2>How it's created</h2>
    <p>
      The <code>definecurrency</code> RPC call creates the token. The
      key parameters:
    </p>
    <ul class="param-list">
      <li>
        <strong>name</strong> — matches the identity
        (e.g., <code>"Destroyer of Fiat.bitcoins"</code>)
      </li>
      <li>
        <strong>options flag 2080</strong> — a combination of protocol
        flags that mark this as an identity-bound token eligible for
        marketplace trading. The specifics of the flags are less important
        than what they enable: the token can be offered, transferred, and
        settled atomically on the Verus marketplace.
      </li>
      <li>
        <strong>preallocations</strong> — 0.00000001 to
        <code>kali.bitcoins@</code>. One satoshi, allocated to the
        curator at genesis. No additional supply can ever be minted.
      </li>
      <li>
        <strong>maxpreconversion: [0]</strong> — required parameter that
        prevents any pre-launch conversion. Without it, the currency
        definition fails.
      </li>
    </ul>
    <p>
      Before <code>definecurrency</code> will succeed, the identity must
      hold a small balance (~0.02 VRSC) to cover the definition fee.
      The call returns a raw transaction hex that must be broadcast via
      <code>sendrawtransaction</code>. Once confirmed, the currency
      exists on chain permanently.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      Verus identities can already be traded on the
      <a href="/learn/marketplace">decentralized marketplace</a> without
      a control token. So what does the token add?
    </p>
    <p>
      <strong>Independent revoke/recover authority.</strong> The token
      holder gains revocation and recovery authority over the identity,
      independent of whatever authorities are set in the identity object.
      Even if the identity's primary addresses are compromised, the
      token holder can recover it.
    </p>
    <p>
      <strong>Third-party oversight.</strong> A control token can be
      held by a different party than the one spending from the identity.
      This separates day-to-day use from ultimate control — useful
      anywhere you want one party to operate an identity while another
      retains the ability to revoke or recover it.
    </p>
    <p>
      <strong>Marketplace routing.</strong> When an identity has a
      control token, the protocol requires marketplace offers to go
      through the token. The buyer receives the token and the
      revoke/recover authority it carries in a single atomic swap.
    </p>
  </section>

  <section class="topic-section">
    <h2>Worked example</h2>
    <p>
      <code>Destroyer of Fiat.bitcoins</code> — currency i-address
      <code class="mono">i3xD7bRKEtJdMmKjoxMHyBjoURebQsGFhV</code>
      (identical to the identity's i-address). Total supply: 0.00000001.
      Preallocated to <code>kali.bitcoins@</code>. Anyone can query it:
    </p>
    <pre><code>getcurrency "Destroyer of Fiat.bitcoins"</code></pre>
    <p>
      The response confirms the currency name, supply, options flags, and
      preallocation. The same call works for all seven pieces — each has
      its own control token with the same parameters, differing only in
      name and i-address.
    </p>
    <p>
      Once created, the token can be listed on the marketplace via
      <code>makeoffer</code>. The curator offers 0.00000001 of the
      control token in exchange for VRSC. A buyer takes the offer via
      <code>takeoffer</code>, and the swap happens atomically on chain.
    </p>
  </section>

  <section class="topic-section">
    <h2>All seven control tokens</h2>
    <ol class="token-list">
      <li><code>Destroyer of Fiat.bitcoins</code></li>
      <li><code>Slayer of Bankers.bitcoins</code></li>
      <li><code>Bane of Debasement.bitcoins</code></li>
      <li><code>Goddess of Sovereignty.bitcoins</code></li>
      <li><code>Devourer of Time.bitcoins</code></li>
      <li><code>Kali of the Cremation Ground.bitcoins</code></li>
      <li><code>Mother of the Immutable.bitcoins</code></li>
    </ol>
    
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
  .param-list,
  .token-list {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-ivory);
    margin: 0 0 var(--space-4) var(--space-4);
    padding: 0;
  }
  .param-list li,
  .token-list li {
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
  .mono {
    font-family: var(--font-mono);
    font-size: 0.85em;
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
