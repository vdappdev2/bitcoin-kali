<svelte:head>
  <title>sendcurrency — Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="The PNG you see in the gallery was decrypted from the Verus blockchain seconds ago. sendcurrency delivers encrypted files via shielded transactions — and a published viewing key makes it verifiable by anyone."
  />
</svelte:head>

<article class="learn-topic">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; Topic 6 of 8</p>
    <h1>sendcurrency</h1>
    <p class="lede">
      The PNG you see in the gallery was decrypted from the Verus blockchain
      three seconds ago.
    </p>
  </header>

  <section class="topic-section">
    <h2>What it is</h2>
    <p>
      <code>sendcurrency</code> is a Verus RPC call that sends value — but it
      can also attach arbitrary data to the transaction. When the daemon is
      running with <code>-enablefileencryption</code> and the destination is
      a shielded z-address, the attached data is encrypted automatically.
      The format is <code>data: {"{"} filename: "image.png" {"}"}</code>,
      and the file contents (up to ~1 MB) are included in the shielded
      transaction output.
    </p>
    <p>
      To read the encrypted data, you need the z-address's extended viewing
      key (EVK). The Sapling EVK reveals all incoming notes to that address —
      which is exactly why the curator uses a <strong>single-purpose
      z-address</strong> that only ever held these 7 deliveries. Publishing
      the EVK leaks the contents of those 7 transactions and nothing else.
    </p>
    <p>
      The decryption call is <code>decryptdata</code>, which takes the
      encrypted objectdata and the EVK and returns the original plaintext
      bytes. The viewer does this live — every image you see is decrypted
      from the blockchain in real time via the whitelisted endpoint at
      <code>rpc.vrsc.syncproof.net</code>.
    </p>
  </section>

  <section class="topic-section">
    <h2>Why it matters</h2>
    <p>
      This is cryptographic proof of delivery. The encrypted bytes are on
      chain, the viewing key is published, and anyone can run
      <code>decryptdata</code> to recover the original file. Then they
      SHA-256 the result and compare against the on-chain
      <code>image-datahash</code> that the curator signed. If the hashes
      match, the delivery is proven: the file the curator sent is exactly
      the file the curator signed.
    </p>
    <p>
      The pattern generalises. Healthcare records where a patient publishes
      a scoped viewing key to their doctor. Legal documents delivered with
      cryptographic proof of content. Evidence chains where the delivery
      itself is independently verifiable. Any scenario where "I sent you
      exactly this file" needs to be provable to third parties.
    </p>
  </section>

  <section class="topic-section worked-example">
    <h2>Worked example</h2>
    <p>
      The curator sent <em>Destroyer of Fiat</em>'s PNG to a single-purpose
      z-address via <code>sendcurrency</code>:
    </p>
    <dl class="example-fields">
      <div class="row">
        <dt>z-address</dt>
        <dd><code class="hex">zs1lvuwaz6npsfwhcxc6mhxcsr7n8hs7qz4v3wqzewhqm8sk8ygt2p74pk2dqhku7h5dljrwmghc7s</code></dd>
      </div>
      <div class="row">
        <dt>PNG txid</dt>
        <dd><code class="hex">3c3aa7af01ca1d2ea6714fad2cc9d76ee02a1083426a11f80365dd1fa1db7150</code></dd>
      </div>
      <div class="row">
        <dt>filename</dt>
        <dd><code>Kali-Destroyer-of-Fiat.png</code></dd>
      </div>
      <div class="row">
        <dt>EVK</dt>
        <dd><code class="hex evk">zxviews1q0gjmgj6qyqqpqrkzas7rfgvksaqsdjfyxu6gt9l8zn8jm6mf36keqv6mljvz0az3vmmwt3787qez35gqxf7jvun2xer8tr0dmsand0rnzmz774aefj0xqg9j22pymgr6vr8jf974ek0e8grmduhg7qx0at5eqvwqukvtuv2dckduwmfux8j76rsmcpk7s03ztc4rpmjgreevxj76xu00mfvp9t4typy4haeaxz4d8xev6pp8dekcz2za76xpd8vnftravsn6w55vfgjg8net</code></dd>
      </div>
    </dl>
    <p>
      The viewer calls <code>decryptdata</code> with the objectdata from that
      transaction and the EVK above. The response is raw PNG bytes. It then
      computes SHA-256 over those bytes:
    </p>
    <dl class="example-fields">
      <div class="row">
        <dt>SHA-256 (BE)</dt>
        <dd><code class="hex">da1c74478f035afe1a4f9cc1499d2e7c1530777241a68b2604ed65aba1aa087a</code></dd>
      </div>
      <div class="row">
        <dt>on-chain (LE)</dt>
        <dd><code class="hex">7a08aaa1ab65ed04268ba641727730157c2e9d49c19c4f1afe5a038f47741cda</code></dd>
      </div>
    </dl>
    <p>
      Verus stores uint256 values in little-endian byte order. Reverse the
      SHA-256 bytes and they match the on-chain value exactly. The delivery
      is verified.
    </p>
  </section>

  <p class="see-live">
    <a href="/piece/destroyer-of-fiat">Watch the image decrypt live on the piece page →</a>
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
    min-width: 10ch;
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
  .evk {
    font-size: 0.68rem;
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
