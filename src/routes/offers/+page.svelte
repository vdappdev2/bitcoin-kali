<script lang="ts">
  import { onMount } from 'svelte';
  import { CHAIN, MANIFEST } from '$lib/env';
  import { rpcCall } from '$lib/rpc';
  import OfferPieceThumb from '$lib/components/OfferPieceThumb.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Fetch the tip once on page load so the badge shows immediately,
  // not only after the user expands their first piece.
  onMount(() => { fetchBlockHeight(); });

  const VRSC_IADDR = 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV';

  // Build a lookup from i-address → friendly name for the 7 pieces + VRSC
  const knownNames: Record<string, string> = {
    [VRSC_IADDR]: 'VRSC',
  };
  for (const p of MANIFEST.pieces) {
    // Currency name = identity friendly name without the trailing @
    knownNames[p.iaddr] = p.friendlyName.replace(/@$/, '');
  }

  type ParsedOffer = {
    offeringAmount: number;
    offeringCurrency: string;
    askingAmount: number;
    askingCurrency: string;
    blockExpiry: number;
    txid: string;
    price: number;
  };

  type PieceOffers = {
    slug: string;
    currencyName: string;
    iaddr: string;
    deliveryTxid: string;
    evk: string;
    filename: string;
    loading: boolean;
    error: string | null;
    offers: ParsedOffer[];
    expanded: boolean;
  };

  let pieces: PieceOffers[] = $state(
    data.livePieces.map((lp) => ({
      slug: lp.piece.slug,
      currencyName: lp.piece.friendlyName.replace(/@$/, ''),
      iaddr: lp.piece.iaddr,
      deliveryTxid: lp.deliveryTxid,
      evk: lp.evk,
      filename: lp.filename,
      loading: false,
      error: null,
      offers: [],
      expanded: false,
    }))
  );

  let currentHeight: number | null = $state(null);
  let heightError: string | null = $state(null);

  // Cache for resolved currency names from getcurrency
  const resolvedNames: Record<string, string> = {};

  async function resolveCurrencyName(iaddr: string): Promise<string> {
    if (knownNames[iaddr]) return knownNames[iaddr];
    if (resolvedNames[iaddr]) return resolvedNames[iaddr];
    try {
      const res = await rpcCall<{ name?: string; fullyqualifiedname?: string }>(
        CHAIN, 'getcurrency', [iaddr]
      );
      const name = res.data.fullyqualifiedname || res.data.name || iaddr;
      resolvedNames[iaddr] = name;
      return name;
    } catch {
      return iaddr;
    }
  }

  let heightRefreshing: boolean = $state(false);

  async function fetchBlockHeight() {
    heightRefreshing = true;
    try {
      // getblockcount returns the height as a raw JSON number — no object to parse.
      const res = await rpcCall<number>(CHAIN, 'getblockcount', []);
      currentHeight = res.data;
      heightError = null;
    } catch {
      heightError = 'Could not fetch current block height';
    } finally {
      heightRefreshing = false;
    }
  }

  async function fetchOffers(index: number) {
    const piece = pieces[index];
    pieces[index].expanded = !piece.expanded;

    // If collapsing or already loaded, just toggle
    if (!pieces[index].expanded || piece.offers.length > 0) return;

    pieces[index].loading = true;
    pieces[index].error = null;

    // Fetch block height if we don't have it yet
    if (currentHeight === null && heightError === null) {
      await fetchBlockHeight();
    }

    try {
      const res = await rpcCall<Record<string, unknown>>(
        CHAIN, 'getoffers', [piece.currencyName, true]
      );

      const result = res.data;
      const parsed: ParsedOffer[] = [];

      // Result keys are dynamic strings like:
      // "currency_<iaddr>_offers_in_currency_<iaddr>"
      for (const [, group] of Object.entries(result)) {
        if (!Array.isArray(group)) continue;
        for (const entry of group) {
          const offer = entry?.offer;
          if (!offer) continue;

          // Parse the offer.offer object (what's being offered)
          const offerAmounts = offer.offer ?? {};
          const acceptAmounts = offer.accept ?? {};

          // Find offering currency + amount.
          // offer.offer contains the asset being offered PLUS a small VRSC
          // dust output that keeps the offer UTXO alive on-chain. Prefer the
          // non-VRSC entry (the actual asset); fall back to VRSC if that's all
          // there is.
          let offeringCurrency = '';
          let offeringAmount = 0;
          for (const [addr, amt] of Object.entries(offerAmounts)) {
            if (typeof amt !== 'number' || amt <= 0) continue;
            if (addr === VRSC_IADDR && offeringCurrency !== '') continue;
            offeringCurrency = await resolveCurrencyName(addr);
            offeringAmount = amt;
            if (addr !== VRSC_IADDR) break;
          }

          // Find asking currency + amount
          let askingCurrency = '';
          let askingAmount = 0;
          for (const [addr, amt] of Object.entries(acceptAmounts)) {
            if (typeof amt === 'number' && amt > 0) {
              askingCurrency = await resolveCurrencyName(addr);
              askingAmount = amt;
            }
          }

          parsed.push({
            offeringCurrency,
            offeringAmount,
            askingCurrency,
            askingAmount,
            blockExpiry: offer.blockexpiry ?? 0,
            txid: offer.txid ?? '',
            price: entry.price ?? 0,
          });
        }
      }

      pieces[index].offers = parsed;
      if (parsed.length === 0) {
        pieces[index].error = 'No offers currently listed';
      }
    } catch (err) {
      pieces[index].error =
        err instanceof Error ? err.message : 'Failed to fetch offers';
    } finally {
      pieces[index].loading = false;
    }
  }

  function isExpired(blockExpiry: number): boolean {
    if (currentHeight === null) return false;
    return blockExpiry <= currentHeight;
  }

  // Per-txid "just copied" flash. Cleared after 1.5s.
  let copiedTxids: Record<string, boolean> = $state({});

  async function copyTxid(txid: string) {
    try {
      await navigator.clipboard.writeText(txid);
      copiedTxids = { ...copiedTxids, [txid]: true };
      setTimeout(() => {
        copiedTxids = { ...copiedTxids, [txid]: false };
      }, 1500);
    } catch {
      // Clipboard API unavailable (non-HTTPS dev server or permission denied).
      // Silently ignore — the full txid is still visible for manual selection.
    }
  }
</script>

<svelte:head>
  <title>Offers — Bitcoin Kali</title>
  <meta
    name="description"
    content="Live marketplace listings for all seven Bitcoin Kali control tokens. Each piece is listed for 258 VRSC via the Verus decentralized marketplace — no platform, no escrow, atomic swaps only."
  />
</svelte:head>

<article class="offers-page">
  <header>
    <p class="eyebrow">Series 1 &nbsp;·&nbsp; live on Verus</p>
    <h1>Marketplace</h1>
    <p class="lede">
      Seven control tokens, each listed on the Verus decentralized
      marketplace. Click a piece to query live offers from the chain.
    </p>
  </header>

  <p class="chain-height">
    Current block height:
    {#if currentHeight !== null}
      <code>{currentHeight.toLocaleString()}</code>
    {:else if heightError}
      <span class="height-error">{heightError}</span>
    {:else}
      <span class="height-pending">…</span>
    {/if}
    <button
      type="button"
      class="refresh-btn"
      onclick={fetchBlockHeight}
      disabled={heightRefreshing}
      aria-label="Refresh current block height"
    >
      {heightRefreshing ? 'Refreshing…' : 'Refresh'}
    </button>
  </p>

  <div class="piece-list">
    {#each pieces as piece, i (piece.iaddr)}
      <div class="piece-card" class:expanded={piece.expanded}>
        <div class="piece-header">
          <OfferPieceThumb
            slug={piece.slug}
            name={piece.currencyName}
            deliveryTxid={piece.deliveryTxid}
            evk={piece.evk}
            filename={piece.filename}
          />
          <button
            class="piece-toggle"
            onclick={() => fetchOffers(i)}
            aria-expanded={piece.expanded}
            aria-controls="piece-body-{i}"
          >
            <span class="piece-name">{piece.currencyName}</span>
            <span class="toggle" aria-hidden="true">{piece.expanded ? '−' : '+'}</span>
          </button>
        </div>

        {#if piece.expanded}
          <div class="piece-body" id="piece-body-{i}">
            {#if piece.loading}
              <p class="status">Querying chain...</p>
            {:else if piece.error && piece.offers.length === 0}
              <p class="status">{piece.error}</p>
            {:else}
              {#each piece.offers as offer}
                <div class="offer-row">
                  <div class="offer-detail">
                    <span class="label">Offering</span>
                    <span class="value">
                      {offer.offeringAmount} {offer.offeringCurrency}
                    </span>
                  </div>
                  <div class="offer-detail">
                    <span class="label">Asking</span>
                    <span class="value">
                      {offer.askingAmount} {offer.askingCurrency}
                    </span>
                  </div>
                  <div class="offer-detail">
                    <span class="label">Price</span>
                    <span class="value">
                      {offer.price} VRSC
                    </span>
                  </div>
                  <div class="offer-detail">
                    <span class="label">Expiry</span>
                    <span
                      class="value"
                      class:expired={isExpired(offer.blockExpiry)}
                    >
                      {offer.blockExpiry.toLocaleString()}
                      {#if currentHeight !== null}
                        {#if isExpired(offer.blockExpiry)}
                          <span class="badge badge-expired">expired</span>
                        {:else}
                          <span class="badge badge-active">active</span>
                        {/if}
                      {/if}
                    </span>
                  </div>
                  <div class="offer-detail offer-detail-txid">
                    <span class="label">Txid</span>
                    <span class="txid-row">
                      <code class="txid-full">{offer.txid}</code>
                      <button
                        type="button"
                        class="copy-btn"
                        onclick={() => copyTxid(offer.txid)}
                        aria-label="Copy txid to clipboard"
                      >
                        {copiedTxids[offer.txid] ? 'Copied' : 'Copy'}
                      </button>
                    </span>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <section class="learn-more">
    <p>
      Learn how control tokens and the marketplace work:
      <a href="/learn/control-tokens">ID Control Tokens</a> and
      <a href="/learn/marketplace">Verus Marketplace</a>.
    </p>
  </section>
</article>

<style>
  .offers-page {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-5) var(--space-4);
  }
  .offers-page header {
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
  .chain-height {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--color-ash);
    margin-bottom: var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  .chain-height code {
    font-family: var(--font-mono);
    color: var(--color-ivory-dim);
  }
  .height-pending,
  .height-error {
    font-family: var(--font-mono);
    color: var(--color-ivory-dim);
  }
  .height-error {
    color: var(--color-vermilion);
  }
  .refresh-btn {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ash);
    background: transparent;
    border: 1px solid var(--color-hairline);
    border-radius: 3px;
    padding: 0.3em 0.7em;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;
  }
  .refresh-btn:hover:not(:disabled) {
    color: var(--color-ivory);
    border-color: var(--color-vermilion);
  }
  .refresh-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .piece-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }
  .piece-card {
    border: 1px solid var(--color-hairline);
    border-radius: 4px;
    overflow: hidden;
  }
  .piece-card.expanded {
    border-color: var(--color-vermilion);
  }
  .piece-header {
    display: flex;
    align-items: stretch;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    color: var(--color-ivory);
  }
  .piece-toggle {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    color: var(--color-ivory);
    padding: 0;
  }
  .piece-toggle:hover .piece-name {
    color: var(--color-vermilion);
  }
  .piece-name {
    font-family: var(--font-display);
    font-size: 1.25rem;
    line-height: 1.2;
    color: var(--color-ivory);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .toggle {
    font-family: var(--font-mono);
    font-size: 1.2rem;
    color: var(--color-vermilion);
    flex-shrink: 0;
    width: 1.5em;
    text-align: center;
  }

  .piece-body {
    padding: 0 var(--space-4) var(--space-4);
    border-top: 1px solid var(--color-hairline);
  }
  .status {
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--color-ash);
    padding-top: var(--space-3);
  }

  .offer-row {
    padding: var(--space-3) 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2) var(--space-4);
  }
  .offer-row + .offer-row {
    border-top: 1px solid var(--color-hairline);
  }
  .offer-detail {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .offer-detail .label {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ash);
  }
  .offer-detail .value {
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--color-ivory);
  }
  .offer-detail .value.mono {
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }
  /* Txid gets full-width — a 64-char hash does not fit a 1fr column cleanly. */
  .offer-detail-txid {
    grid-column: 1 / -1;
  }
  .txid-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
  }
  .txid-full {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--color-ivory);
    word-break: break-all;
    min-width: 0;
    flex: 1;
  }
  .copy-btn {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ash);
    background: transparent;
    border: 1px solid var(--color-hairline);
    border-radius: 3px;
    padding: 0.3em 0.7em;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;
  }
  .copy-btn:hover {
    color: var(--color-ivory);
    border-color: var(--color-vermilion);
  }
  .offer-detail .value.expired {
    color: var(--color-ash);
  }

  .badge {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.1em 0.5em;
    border-radius: 3px;
    margin-left: 0.5em;
    vertical-align: middle;
  }
  .badge-active {
    color: #3a7d44;
    border: 1px solid #3a7d44;
  }
  .badge-expired {
    color: var(--color-ash);
    border: 1px solid var(--color-ash);
  }

  .learn-more {
    max-width: var(--measure-body);
  }
  .learn-more p {
    font-family: var(--font-body);
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--color-ivory-dim);
  }
  .learn-more a {
    color: var(--color-vermilion);
    text-decoration: none;
    border-bottom: 1px solid transparent;
  }
  .learn-more a:hover {
    border-bottom-color: var(--color-vermilion);
  }
</style>
