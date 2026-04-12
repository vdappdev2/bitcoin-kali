<script lang="ts">
  import type { ChainName } from '$lib/chain';
  let { chain }: { chain: ChainName } = $props();
</script>

<span
  class="chain-badge"
  class:testnet={chain === 'testnet'}
  class:mainnet={chain === 'mainnet'}
  aria-label="Current chain: {chain}"
>
  {chain}
</span>

<style>
  .chain-badge {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 0.15rem 0.55rem;
    border: 1px solid var(--color-vermilion);
    color: var(--color-vermilion);
    background: transparent;
  }
  .mainnet {
    border-color: var(--color-ivory);
    color: var(--color-ivory);
  }
</style>
