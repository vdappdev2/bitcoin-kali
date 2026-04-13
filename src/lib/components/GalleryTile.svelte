<script lang="ts">
  import { onMount } from 'svelte';
  import { CHAIN } from '$lib/env';
  import { fetchPngBytes } from '$lib/verify';
  import type { PieceManifest } from '$lib/manifest';

  type LiveProps = {
    kind: 'live';
    piece: PieceManifest;
    name: string;
    imageUrl: string | null;
    deliveryTxid: string;
    evk: string;
    filename: string;
  };
  type PlaceholderProps = {
    kind: 'placeholder';
    position: number;
  };

  let props: LiveProps | PlaceholderProps = $props();

  let blobUrl: string | null = $state(null);

  const resolvedUrl = $derived(
    props.kind === 'live' ? (props.imageUrl ?? blobUrl) : null
  );

  onMount(() => {
    if (props.kind !== 'live' || props.imageUrl) return;
    fetchPngBytes(CHAIN, props.filename, props.deliveryTxid, props.evk)
      .then((bytes) => {
        blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      })
      .catch(() => {});
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  });
</script>

{#if props.kind === 'live'}
  <a class="tile live" href="/piece/{props.piece.slug}" aria-label="View piece {props.piece.position}: {props.name}">
    <figure>
      {#if resolvedUrl}
        <img
          src={resolvedUrl}
          alt="Generative artwork for {props.name} — Bitcoin Kali Series 1 piece {props.piece.position} of 7"
          loading="lazy"
          decoding="async"
        />
      {/if}
      <figcaption>
        <span class="position">Piece {props.piece.position} / 7</span>
        <span class="name devanagari" lang="sa">{props.name}</span>
      </figcaption>
    </figure>
  </a>
{:else}
  <div class="tile placeholder" aria-label="Piece {props.position} — pending mainnet launch">
    <figure>
      <div class="empty" aria-hidden="true"></div>
      <figcaption>
        <span class="position">Piece {props.position} / 7</span>
        <span class="pending">Arrives at mainnet launch</span>
      </figcaption>
    </figure>
  </div>
{/if}

<style>
  .tile {
    display: block;
    text-decoration: none;
    color: var(--color-ivory);
    border: 1px solid var(--color-hairline);
    background: var(--color-ink-2);
    transition: border-color 0.2s ease;
  }
  .tile.live:hover {
    border-color: var(--color-vermilion);
  }
  figure {
    margin: 0;
    display: flex;
    flex-direction: column;
  }
  img {
    width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    background: var(--color-ink);
  }
  .empty {
    width: 100%;
    aspect-ratio: 1 / 1;
    background:
      repeating-linear-gradient(
        45deg,
        transparent 0 14px,
        var(--color-hairline) 14px 15px
      );
  }
  figcaption {
    padding: var(--space-3) var(--space-3) var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    border-top: 1px solid var(--color-hairline);
  }
  .position {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--color-ash);
  }
  .name {
    font-family: var(--font-display);
    font-size: 1.3rem;
    line-height: 1.2;
    color: var(--color-ivory);
  }
  .pending {
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--color-ash);
    font-style: italic;
  }
  .devanagari {
    letter-spacing: 0.005em;
  }
</style>
