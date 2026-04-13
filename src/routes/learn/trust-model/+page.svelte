<svelte:head>
  <title>The Trust Model — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="Five independent verification paths, zero trusted servers. How Verus identity, signdata, verifysignature, encrypted delivery, and on-chain rights compose into a zero-trust system — and what that means for autonomous agents."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 8 of 8</p>
    <h1>The Trust Model</h1>
    <p class="lede">
      Five independent verification paths, zero trusted servers.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      Bitcoin Kali doesn't ask you to trust the viewer, the curator, or any
      server. Everything the viewer claims is independently verifiable
      through public RPC calls. Here are the five paths:
    </p>
    <ol class="path-list">
      <li>
        <strong>Identity</strong> — call
        <code>getidentity "Destroyer of Fiat.bitcoins@"</code> on any Verus
        node. The identity exists, the CMM is populated, the primary
        addresses are visible. No auth required.
      </li>
      <li>
        <strong>Provenance</strong> — call
        <a href="/learn/verifysignature"><code>verifysignature</code></a>
        with the curator's i-address, the mmrroot, and the signature from
        the CMM. One RPC call, one boolean. The curator's signature is
        either valid or it isn't.
      </li>
      <li>
        <strong>Image integrity</strong> — call
        <a href="/learn/sendcurrency"><code>decryptdata</code></a> with the
        delivery txid and the published EVK. SHA-256 the decrypted bytes.
        Reverse the endianness. Compare against the on-chain
        <code>image-datahash</code> uint256. If they match, the file the
        curator delivered is the file the curator signed.
      </li>
      <li>
        <strong>Delivery</strong> — the encrypted bytes are on chain in a
        shielded transaction. The viewing key is published. Anyone can
        decrypt. The delivery is not a claim — it's a cryptographic fact.
      </li>
      <li>
        <strong>Rights</strong> — the rights assertion is stored on chain in
        the CMM and is the fifth leaf of the signed MMR. Modifying it would
        break the curator's signature. It's publicly readable and
        tamper-evident.
      </li>
    </ol>
    <p>
      The viewer's <a href="/verify/destroyer-of-fiat">verification
      theatre</a> runs paths 1–3 live, streaming each step as it happens.
      You watch the proof reconstruct in real time — no pre-computed results,
      no cached answers.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      Trust-minimized systems are valuable because they remove single points
      of failure. If the curator disappears, the data is still on chain. If
      the viewer goes offline, anyone can rebuild it from public RPC. If
      someone claims the rights text was different, the signed MMR settles
      the dispute. No oracle, no arbitrator, no trusted third party.
    </p>
    <p>
      This composability is the point. Each primitive —
      <a href="/learn/identity">VerusID</a>,
      <a href="/learn/vdxf-keys">VDXF keys</a>,
      <a href="/learn/contentmultimap">contentmultimap</a>,
      <a href="/learn/signdata">signdata</a>,
      <a href="/learn/verifysignature">verifysignature</a>,
      <a href="/learn/sendcurrency">sendcurrency</a>,
      <a href="/learn/on-chain-rights">on-chain rights</a> — is useful on
      its own. Together, they form a complete system for identity-bound,
      provenance-signed, cryptographically-delivered, rights-asserted
      digital assets.
    </p>
  </section>

  <section class="topic-section">
    <h2>Beyond NFTs</h2>
    <p>
      These primitives aren't specific to art. The same trust model applies
      wherever "who said what, and can you prove it" matters:
    </p>
    <ul class="use-case-list">
      <li>
        <strong>Supply chain provenance</strong> — a manufacturer signs
        origin + test results into an MMR. Any downstream buyer verifies
        with one <code>verifysignature</code> call.
      </li>
      <li>
        <strong>Credentials and certificates</strong> — a university issues
        a diploma as a signed DataDescriptor on a VerusID. The graduate
        controls the identity; any employer verifies the signature.
      </li>
      <li>
        <strong>Legal documents</strong> — a signed rights assertion bound
        to an identity, transferable by updating primary addresses.
      </li>
      <li>
        <strong>Healthcare records</strong> — encrypted delivery via
        <code>sendcurrency</code> with selective disclosure through scoped
        viewing keys.
      </li>
      <li>
        <strong>Evidence chains</strong> — a chain of custody where each
        handoff is a signed identity transfer, and the full history is
        publicly auditable.
      </li>
    </ul>
  </section>

  <section class="topic-section">
    <h2>Autonomous agents</h2>
    <p>
      The trust model is particularly relevant for AI agents operating in an
      on-chain economy. Agents need to verify claims without trusting the
      claimant, deliver data with proof of content, and hold identity that
      persists across sessions. Verus gives them the tools:
    </p>
    <ul class="use-case-list">
      <li>
        <strong>Verify provenance</strong> — an agent evaluating a credential
        calls <code>verifysignature</code>. No OAuth, no API key, no rate
        limit.
      </li>
      <li>
        <strong>Signed data trees</strong> — the MMR lets agents verify
        individual fields without downloading the full dataset. The tree
        structure is self-proving.
      </li>
      <li>
        <strong>Encrypted delivery</strong> — agents send data to each
        other's z-addresses. The shielded transaction is cryptographic proof
        of sender. Scoped viewing keys control who can read what.
      </li>
      <li>
        <strong>Identity-as-mailbox</strong> — send to
        <code>AgentID@:private</code> and the data arrives at the agent's
        shielded address. No server, no inbox, no intermediary.
      </li>
      <li>
        <strong>Self-sovereign identity</strong> — an agent registers a
        VerusID, controls its own keys, signs its own assertions. It enters
        the on-chain economy as a first-class participant, not a tenant of
        someone else's platform.
      </li>
    </ul>
    <p>
      Bitcoin Kali is a seven-piece art series. But the infrastructure it
      runs on — the identity system, the signing primitives, the encrypted
      delivery, the marketplace — is general-purpose. If seven NFTs can do
      this, imagine what these primitives enable when the participants are
      autonomous.
    </p>
  </section>

  <p class="see-live">
    <a href="/verify/destroyer-of-fiat">Run the full verification theatre →</a>
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
  .path-list,
  .use-case-list {
    max-width: var(--measure-body);
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-ivory);
    margin: 0 0 var(--space-4) var(--space-4);
    padding: 0;
  }
  .path-list li,
  .use-case-list li {
    margin-bottom: var(--space-3);
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
