<script lang="ts">
  import type { NftContent } from '$lib/cmm';
  import type { PieceManifest } from '$lib/manifest';

  let {
    content,
    piece,
  }: {
    content: NftContent;
    piece: PieceManifest;
  } = $props();

  // Step 4 shows the static "on-chain hashes match manifest" summary. The
  // interactive 6-step theatre lands in Step 5; the link below will become
  // live then.
  const checks = $derived([
    {
      label: 'Image uint256',
      value: content.imageHashLE,
      ok: content.imageHashLE === piece.expectedImageUint256LE,
    },
    {
      label: 'mmrroot',
      value: content.mmrrootLE,
      ok: content.mmrrootLE === piece.expectedMmrRootLE,
    },
    {
      label: 'Signature hash',
      value: content.signature.signaturehash,
      ok: content.signature.signaturehash === piece.expectedMmrRootLE,
    },
  ]);
  const allOk = $derived(checks.every((c) => c.ok));
</script>

<aside class="badge" class:ok={allOk} aria-label="Verification summary">
  <header>
    <p class="status">
      {#if allOk}
        <span class="mark" aria-hidden="true">✓</span>
        <span>Chain state matches committed manifest</span>
      {:else}
        <span class="mark warn" aria-hidden="true">✗</span>
        <span>Chain divergence detected</span>
      {/if}
    </p>
  </header>

  <dl>
    {#each checks as check (check.label)}
      <div class="row" class:fail={!check.ok}>
        <dt>{check.label}</dt>
        <dd>
          <code class="hex">{check.value}</code>
        </dd>
      </div>
    {/each}
  </dl>

  <p class="footnote">
    This summary compares the chain-returned hashes for this piece against the
    hashes baked into the viewer at build time. The full interactive
    verification (fetch CMM → extract signature → call
    <code>verifysignature</code> → SHA-256 the PNG → compare) arrives in the
    next step of the viewer build.
  </p>
</aside>

<style>
  .badge {
    margin: 0;
    padding: var(--space-4);
    border: 1px solid var(--color-hairline);
    background: var(--color-ink-2);
  }
  .badge.ok {
    border-left: 2px solid var(--color-vermilion);
  }
  header {
    margin-bottom: var(--space-3);
  }
  .status {
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    color: var(--color-ivory);
    font-size: 0.95rem;
  }
  .mark {
    font-family: var(--font-mono);
    color: var(--color-vermilion);
    font-size: 1rem;
  }
  .mark.warn {
    color: #d14040;
  }
  dl {
    margin: var(--space-3) 0 0 0;
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.35rem var(--space-3);
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
  }
  .hex {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-ivory-dim);
    word-break: break-all;
  }
  .row.fail .hex {
    color: #d14040;
  }
  .footnote {
    margin-top: var(--space-4);
    max-width: var(--measure-body);
    font-size: 0.82rem;
    color: var(--color-ash);
    font-style: italic;
  }
  .footnote code {
    font-style: normal;
  }
</style>
