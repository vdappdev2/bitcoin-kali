<script lang="ts">
  import { onMount } from 'svelte';
  import { CHAIN } from '$lib/env';
  import { fetchPngBytes } from '$lib/verify';

  let {
    slug,
    name,
    deliveryTxid,
    evk,
    filename,
  }: {
    slug: string;
    name: string;
    deliveryTxid: string;
    evk: string;
    filename: string;
  } = $props();

  let blobUrl: string | null = $state(null);

  onMount(() => {
    fetchPngBytes(CHAIN, filename, deliveryTxid, evk)
      .then((bytes) => {
        blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      })
      .catch(() => {});
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  });
</script>

<a
  class="thumb-link"
  href="/piece/{slug}"
  aria-label="View {name} detail page"
>
  {#if blobUrl}
    <img
      src={blobUrl}
      alt="{name} — thumbnail"
      width="80"
      height="80"
      loading="lazy"
      decoding="async"
    />
  {:else}
    <div class="placeholder" aria-hidden="true"></div>
  {/if}
</a>

<style>
  .thumb-link {
    display: block;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border: 1px solid var(--color-hairline);
    overflow: hidden;
    background: var(--color-ink);
  }
  .thumb-link:hover {
    border-color: var(--color-vermilion);
  }
  .thumb-link img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
  .placeholder {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      transparent 0 6px,
      var(--color-hairline) 6px 7px
    );
  }
</style>
