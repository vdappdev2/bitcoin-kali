<script lang="ts">
  import type { NftContent } from '$lib/cmm';
  import type { PieceManifest } from '$lib/manifest';
  import { SERIES_TOTAL } from '$lib/manifest';

  let { content, piece, identityName, identityAddress }: {
    content: NftContent;
    piece: PieceManifest;
    identityName: string;
    identityAddress: string;
  } = $props();

  const edition = $derived(
    typeof content.attributes.edition === 'string'
      ? content.attributes.edition
      : `${piece.position} of ${SERIES_TOTAL}`
  );
</script>

<header class="piece-header">
  <p class="eyebrow">
    Piece {piece.position} / {SERIES_TOTAL} &nbsp;·&nbsp; {edition}
  </p>
  <h1 class="identity-name">{identityName}</h1>
  <p class="iaddress" aria-label="Verus i-address">
    <span class="label">Verus identity</span>
    <code>{identityAddress}</code>
  </p>
</header>

<style>
  .piece-header {
    margin-bottom: var(--space-5);
  }
  .eyebrow {
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.72rem;
    color: var(--color-vermilion);
    margin-bottom: var(--space-3);
  }
  .identity-name {
    font-family: var(--font-display);
    font-size: 3.4rem;
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: 0.005em;
    margin-bottom: var(--space-2);
  }
  .iaddress {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin-top: var(--space-4);
    font-family: var(--font-mono);
    max-width: none;
  }
  .iaddress .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--color-ash);
  }
  .iaddress code {
    font-size: 0.82rem;
    color: var(--color-ivory-dim);
    word-break: break-all;
  }
</style>
