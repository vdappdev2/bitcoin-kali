<script lang="ts">
  import { CHAIN } from '$lib/env';
  import type { NftContent } from '$lib/cmm';
  import type { PieceManifest } from '$lib/manifest';
  import { GENERIC_MEMO_DD, fetchPngBytes } from '$lib/verify';
  import { reverseHex, bytesToHex } from '$lib/hex';

  let { content, piece }: { content: NftContent; piece: PieceManifest } = $props();

  let walkState: 'idle' | 'request' | 'fetching' | 'hashing' | 'done' | 'error' = $state('idle');
  let errorMsg = $state('');
  let pngBytes: Uint8Array | null = $state(null);
  let computedHashBE = $state('');
  let computedHashLE = $state('');
  let drawerEl: HTMLDetailsElement | undefined = $state();

  const requestParams = $derived({
    datadescriptor: GENERIC_MEMO_DD,
    evk: content.delivery.evk,
    txid: content.delivery.txid,
    retrieve: true,
  });

  const requestJson = $derived(JSON.stringify(requestParams, null, 2));

  const hashMatch = $derived(
    computedHashLE !== '' &&
      computedHashLE === piece.expectedImageUint256LE
  );

  async function runWalkthrough() {
    walkState = 'request';
    pngBytes = null;
    computedHashBE = '';
    computedHashLE = '';
    errorMsg = '';
    if (drawerEl) drawerEl.open = true;

    await sleep(900);
    walkState = 'fetching';

    try {
      pngBytes = await fetchPngBytes(
        CHAIN,
        content.delivery.filename,
        content.delivery.txid,
        content.delivery.evk
      );
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
      walkState = 'error';
      return;
    }

    await sleep(600);
    walkState = 'hashing';

    const digest = await crypto.subtle.digest(
      'SHA-256',
      pngBytes as unknown as BufferSource
    );
    computedHashBE = bytesToHex(new Uint8Array(digest));
    computedHashLE = reverseHex(computedHashBE);

    await sleep(400);
    walkState = 'done';
  }

  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
</script>

<section class="decrypt" aria-label="Decrypt walkthrough for {content.name}">
  <p class="explainer">
    The extended viewing key (evk) is published on-chain inside the curator identity.
    Anyone who reads the chain can combine the evk with a delivery transaction ID and
    call <code>decryptdata</code> to retrieve the original file. The DataDescriptor
    below is a fixed sentinel — identical across all deliveries.
  </p>

  <dl class="fields">
    <div class="row">
      <dt>z-addr (shielded)</dt>
      <dd><code class="hex">{content.delivery.zaddr}</code></dd>
    </div>
    <div class="row">
      <dt>Extended viewing key</dt>
      <dd><code class="hex">{content.delivery.evk}</code></dd>
    </div>
    <div class="row">
      <dt>Delivery txid</dt>
      <dd><code class="hex">{content.delivery.txid}</code></dd>
    </div>
    <div class="row">
      <dt>Filename</dt>
      <dd><code>{content.delivery.filename}</code></dd>
    </div>
  </dl>

  <div class="walk-controls">
    <button
      type="button"
      class="walk-btn"
      onclick={runWalkthrough}
      disabled={walkState !== 'idle' && walkState !== 'done' && walkState !== 'error'}
    >
      {#if walkState === 'idle'}
        Decrypt live in browser
      {:else if walkState === 'done' || walkState === 'error'}
        Run again
      {:else}
        Running…
      {/if}
    </button>
  </div>

  <details class="drawer" bind:this={drawerEl}>
    <summary>
      {#if walkState === 'idle'}
        Show decrypt walkthrough
      {:else if walkState === 'done'}
        Decrypt walkthrough — complete
      {:else if walkState === 'error'}
        Decrypt walkthrough — error
      {:else}
        Decrypt walkthrough — running…
      {/if}
    </summary>

    {#if walkState !== 'idle'}
      <ol class="walk-steps" aria-live="polite">
        <!-- Step 1: Request -->
        <li
          class="walk-step"
          class:active={walkState === 'request'}
          class:done={walkState !== 'request'}
        >
          <header class="ws-head">
            <span class="ws-num">1</span>
            <span class="ws-label">Send decryptdata request</span>
            <span class="ws-status">
              {#if walkState === 'request'}building…{:else}✓{/if}
            </span>
          </header>
          <div class="ws-body">
            <p class="ws-detail">
                Sending to <code>decryptdata</code> on the Verus RPC.
                The daemon uses the evk to locate the shielded note, then decrypts
                and returns the raw PNG bytes.
            </p>
            <pre class="request-json"><code>{requestJson}</code></pre>
          </div>
        </li>

        <!-- Step 2: Fetch / decrypt -->
        {#if walkState !== 'request'}
          <li
            class="walk-step"
            class:active={walkState === 'fetching'}
            class:done={walkState === 'hashing' || walkState === 'done'}
            class:error={walkState === 'error'}
          >
            <header class="ws-head">
              <span class="ws-num">2</span>
              <span class="ws-label">Daemon decrypts shielded note</span>
              <span class="ws-status">
                {#if walkState === 'fetching'}fetching…
                {:else if walkState === 'error'}✗
                {:else}✓{/if}
              </span>
            </header>
            <div class="ws-body">
              {#if walkState === 'error'}
                <p class="ws-error"><strong>Error:</strong> {errorMsg}</p>
              {:else if pngBytes}
                <p class="ws-detail">
                    The daemon decrypted the shielded note and returned the raw file
                    bytes. The response contains <code>objectdata</code> (hex-encoded
                    PNG), a version, flags, and a 32-byte salt.
                </p>
                <dl class="ws-values">
                  <div class="row">
                    <dt>Byte length</dt>
                    <dd><code>{pngBytes.length.toLocaleString()}</code></dd>
                  </div>
                  <div class="row">
                    <dt>PNG magic</dt>
                    <dd>
                      <code>
                        {pngBytes[0]?.toString(16).padStart(2, '0')}
                        {pngBytes[1]?.toString(16).padStart(2, '0')}
                        {pngBytes[2]?.toString(16).padStart(2, '0')}
                        {pngBytes[3]?.toString(16).padStart(2, '0')}
                      </code>
                      {#if pngBytes[0] === 0x89 && pngBytes[1] === 0x50}
                        — valid PNG header
                      {/if}
                    </dd>
                  </div>
                </dl>
              {/if}
            </div>
          </li>
        {/if}

        <!-- Step 3: Hash verify -->
        {#if walkState === 'hashing' || walkState === 'done'}
          <li
            class="walk-step"
            class:active={walkState === 'hashing'}
            class:done={walkState === 'done'}
          >
            <header class="ws-head">
              <span class="ws-num">3</span>
              <span class="ws-label">SHA-256 and compare to on-chain uint256</span>
              <span class="ws-status">
                {#if walkState === 'hashing'}hashing…
                {:else if hashMatch}✓
                {:else}✗{/if}
              </span>
            </header>
            <div class="ws-body">
              {#if walkState === 'done'}
                <p class="ws-detail">
                  {#if hashMatch}
                    The SHA-256 of the fetched bytes — reversed to match Verus
                    uint256 endianness — is identical to the on-chain hash.
                  {:else}
                    Hash mismatch. The fetched bytes do not match the on-chain uint256.
                  {/if}
                </p>
                <dl class="ws-values">
                  <div class="row">
                    <dt>Computed SHA-256 (big-endian)</dt>
                    <dd><code class="hex">{computedHashBE}</code></dd>
                  </div>
                  <div class="row">
                    <dt>Reversed to little-endian</dt>
                    <dd><code class="hex">{computedHashLE}</code></dd>
                  </div>
                  <div class="row">
                    <dt>On-chain uint256 (LE)</dt>
                    <dd><code class="hex">{piece.expectedImageUint256LE}</code></dd>
                  </div>
                  <div class="row">
                    <dt>Match</dt>
                    <dd>
                      {#if hashMatch}
                        <span class="match-yes">yes</span>
                      {:else}
                        <span class="match-no">no — mismatch</span>
                      {/if}
                    </dd>
                  </div>
                </dl>
              {/if}
            </div>
          </li>
        {/if}
      </ol>
    {:else}
      <p class="drawer-idle">Press the button above to start the walkthrough.</p>
    {/if}
  </details>

  <p class="learn-links">
    <a href="/learn/sendcurrency-files">How sendcurrency file delivery works →</a>
  </p>
</section>

<style>
  .decrypt {
    margin: 0;
  }

  .explainer {
    max-width: var(--measure-body);
    font-size: 0.92rem;
    line-height: 1.55;
    color: var(--color-ivory-dim);
    margin-bottom: var(--space-4);
  }
  .explainer code {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--color-ivory);
  }

  .fields {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.45rem var(--space-4);
    margin: 0 0 var(--space-5);
    max-width: var(--measure-wide);
  }
  .row {
    display: contents;
  }
  dt {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-ash);
    padding-top: 0.25em;
  }
  dd {
    margin: 0;
    min-width: 0;
    color: var(--color-ivory);
    font-size: 0.9rem;
  }
  .hex {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--color-ivory-dim);
    word-break: break-all;
  }

  .walk-controls {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }
  .walk-btn {
    appearance: none;
    background: transparent;
    color: var(--color-ivory);
    border: 1px solid var(--color-hairline);
    border-radius: 0;
    padding: 0.45rem 0.9rem;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }
  .walk-btn:hover:not(:disabled) {
    border-color: var(--color-vermilion);
    color: var(--color-vermilion);
  }
  .walk-btn:disabled {
    color: var(--color-ash);
    cursor: default;
  }
  .walk-hint {
    font-size: 0.78rem;
    color: var(--color-ash);
    font-style: italic;
  }
  .walk-hint code {
    font-style: normal;
    font-family: var(--font-mono);
    font-size: 0.74rem;
  }

  .drawer {
    max-width: var(--measure-wide);
  }
  .drawer summary {
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-ash);
    padding: 0.4rem 0;
    list-style: none;
    outline-offset: 4px;
  }
  .drawer summary::-webkit-details-marker {
    display: none;
  }
  .drawer summary::before {
    content: '▸ ';
    color: var(--color-vermilion);
    display: inline-block;
  }
  .drawer[open] summary::before {
    content: '▾ ';
  }
  .drawer summary:hover {
    color: var(--color-vermilion);
  }
  .drawer-idle {
    color: var(--color-ash);
    font-size: 0.85rem;
    font-style: italic;
    margin: var(--space-3) 0 0;
  }

  .walk-steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .walk-step {
    padding: var(--space-4) 0;
    border-top: 1px solid var(--color-hairline);
    transition: opacity 0.2s ease;
  }
  .walk-step:last-child {
    border-bottom: 1px solid var(--color-hairline);
  }
  .walk-step.active {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(193, 74, 48, 0.06) 50%,
      transparent 100%
    );
  }

  .ws-head {
    display: grid;
    grid-template-columns: 2rem 1fr auto;
    align-items: baseline;
    gap: var(--space-3);
  }
  .ws-num {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--color-ash);
    text-align: right;
  }
  .ws-label {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--color-ivory);
  }
  .ws-status {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-ash);
    min-width: 4rem;
    text-align: right;
  }
  .walk-step.done .ws-status {
    color: var(--color-vermilion);
  }
  .walk-step.error .ws-status {
    color: #d14040;
  }

  .ws-body {
    margin: var(--space-3) 0 0 calc(2rem + var(--space-3));
  }
  .ws-detail {
    max-width: var(--measure-body);
    color: var(--color-ivory-dim);
    font-size: 0.88rem;
    line-height: 1.55;
    margin-bottom: var(--space-3);
  }
  .ws-detail code {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--color-ivory);
  }

  .request-json {
    margin: var(--space-3) 0 0;
    padding: var(--space-3);
    border: 1px solid var(--color-hairline);
    background: rgba(10, 8, 5, 0.5);
    overflow-x: auto;
    max-width: var(--measure-wide);
  }
  .request-json code {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    line-height: 1.5;
    color: var(--color-ivory-dim);
    white-space: pre;
  }

  .ws-values {
    display: grid;
    grid-template-columns: minmax(max-content, 16rem) 1fr;
    gap: 0.35rem var(--space-3);
    margin: var(--space-3) 0 0;
  }
  .ws-values .row {
    display: contents;
  }
  .ws-values dt {
    padding-top: 0.2em;
  }
  .ws-values dd {
    font-size: 0.88rem;
  }
  .ws-values code {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--color-ivory-dim);
  }

  .match-yes {
    color: var(--color-vermilion);
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }
  .match-no {
    color: #d14040;
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }

  .ws-error {
    padding: var(--space-3);
    border-left: 2px solid #d14040;
    background: rgba(209, 64, 64, 0.06);
    color: #f0c0c0;
    font-size: 0.9rem;
    max-width: var(--measure-body);
    font-family: var(--font-mono);
    word-break: break-all;
  }
  .ws-error strong {
    color: #d14040;
    font-weight: 600;
  }

  .learn-links {
    margin-top: var(--space-4);
  }
  .learn-links a {
    color: var(--color-ivory);
    text-decoration: none;
    border-bottom: 1px solid var(--color-hairline);
    padding-bottom: 2px;
    font-size: 0.88rem;
  }
  .learn-links a:hover {
    border-bottom-color: var(--color-vermilion);
  }
</style>
