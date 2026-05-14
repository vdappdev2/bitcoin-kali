<script lang="ts">
  import { CHAIN, MANIFEST } from '$lib/env';
  import { rpcCall } from '$lib/rpc';

  // ─── Wallet target toggle ────────────────────────────────────────────────
  // CLI:  ./verus <command>
  // GUI:  run <command>
  type WalletKind = 'cli' | 'gui';
  let wallet: WalletKind = $state('cli');
  const prefix = $derived(wallet === 'cli' ? './verus ' : 'run ');

  const VRSC_IADDR = 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV';

  const knownNames: Record<string, string> = { [VRSC_IADDR]: 'VRSC' };
  for (const p of MANIFEST.pieces) {
    knownNames[p.iaddr] = p.friendlyName.replace(/@$/, '');
  }
  const pieces = MANIFEST.pieces.map((p) => ({
    slug: p.slug,
    iaddr: p.iaddr,
    fullName: p.friendlyName,                          // "Foo.bitcoins@"
    currencyName: p.friendlyName.replace(/@$/, ''),    // "Foo.bitcoins"
  }));

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

  function jsonInline(obj: unknown): string {
    return JSON.stringify(obj);
  }

  // ─── Section 1: Takeoffer ────────────────────────────────────────────────
  type TakeofferOfferRow = {
    txid: string;
    offeringCurrency: string;
    offeringAmount: number;
    askingCurrency: string;
    askingAmount: number;
  };

  let takeSlug: string = $state('');
  let takeLoading: boolean = $state(false);
  let takeError: string | null = $state(null);
  let takeOffers: TakeofferOfferRow[] = $state([]);
  let takeOfferTxid: string = $state('');
  let takeFromAddress: string = $state('');
  let takeChangeAddress: string = $state('');
  let takeDestAddress: string = $state('');

  async function loadOffers() {
    takeError = null;
    takeOffers = [];
    takeOfferTxid = '';
    const piece = pieces.find((p) => p.slug === takeSlug);
    if (!piece) return;
    takeLoading = true;
    try {
      const res = await rpcCall<Record<string, unknown>>(
        CHAIN, 'getoffers', [piece.currencyName, true]
      );
      const result = res.data;
      const parsed: TakeofferOfferRow[] = [];
      for (const [, group] of Object.entries(result)) {
        if (!Array.isArray(group)) continue;
        for (const entry of group) {
          const offer = entry?.offer;
          if (!offer) continue;
          const offerAmounts = offer.offer ?? {};
          const acceptAmounts = offer.accept ?? {};

          // Offer side: the asset being sold. Skip the dust VRSC if a real
          // asset is also present on that side of the offer.
          let offeringCurrency = '';
          let offeringAmount = 0;
          for (const [addr, amt] of Object.entries(offerAmounts)) {
            if (typeof amt !== 'number' || amt <= 0) continue;
            if (addr === VRSC_IADDR && offeringCurrency !== '') continue;
            offeringCurrency = await resolveCurrencyName(addr);
            offeringAmount = amt;
            if (addr !== VRSC_IADDR) break;
          }

          // Accept side: what the offer wants in return.
          let askingCurrency = '';
          let askingAmount = 0;
          for (const [addr, amt] of Object.entries(acceptAmounts)) {
            if (typeof amt === 'number' && amt > 0) {
              askingCurrency = await resolveCurrencyName(addr);
              askingAmount = amt;
            }
          }

          parsed.push({
            txid: offer.txid ?? '',
            offeringCurrency,
            offeringAmount,
            askingCurrency,
            askingAmount,
          });
        }
      }
      takeOffers = parsed;
      if (parsed.length === 1) takeOfferTxid = parsed[0].txid;
      if (parsed.length === 0) takeError = 'No open offers for this token.';
    } catch (err) {
      takeError = err instanceof Error ? err.message : 'Failed to fetch offers';
    } finally {
      takeLoading = false;
    }
  }

  const selectedTakeOffer = $derived(
    takeOffers.find((o) => o.txid === takeOfferTxid) ?? takeOffers[0]
  );

  const takeCommand = $derived.by(() => {
    if (!selectedTakeOffer) return '';
    if (!takeFromAddress || !takeChangeAddress || !takeDestAddress) return '';
    const payload = {
      txid: selectedTakeOffer.txid,
      changeaddress: takeChangeAddress,
      deliver: {
        currency: selectedTakeOffer.askingCurrency,
        amount: selectedTakeOffer.askingAmount,
      },
      accept: {
        address: takeDestAddress,
        currency: selectedTakeOffer.offeringCurrency,
        amount: selectedTakeOffer.offeringAmount,
      },
    };
    return `${prefix}takeoffer "${takeFromAddress}" '${jsonInline(payload)}'`;
  });

  // ─── Section 2: Revokeidentity (token revoke) ────────────────────────────
  let revokeSlug: string = $state('');
  let revokeSourceOfFunds: string = $state('');

  const revokeCommand = $derived.by(() => {
    const piece = pieces.find((p) => p.slug === revokeSlug);
    if (!piece) return '';
    const base = `${prefix}revokeidentity "${piece.fullName}" false true`;
    if (revokeSourceOfFunds.trim()) {
      // Positional args order: nameorID, returntx=false, tokenrevoke=true,
      // feeoffer (skipped via null), sourceoffunds=<addr>.
      return `${base} null "${revokeSourceOfFunds.trim()}"`;
    }
    return base;
  });

  // ─── Section 3: Recoveridentity (token recover) ──────────────────────────
  type IdentityShape = {
    name?: string;
    parent?: string;
    systemid?: string;
    identityaddress?: string;
    primaryaddresses?: string[];
    minimumsignatures?: number;
    contentmultimap?: unknown;
    revocationauthority?: string;
    recoveryauthority?: string;
    privateaddress?: string;
    timelock?: number;
    [key: string]: unknown;
  };

  // Address shape guards — not exhaustive base58 / bech32 checks, just enough
  // to catch the common copy-paste mistakes (pasting an i-address where a
  // primary address goes, or vice-versa).
  const R_ADDR = /^R[1-9A-HJ-NP-Za-km-z]{33}$/;        // transparent
  const I_ADDR = /^i[1-9A-HJ-NP-Za-km-z]{33}$/;        // identity
  const Z_ADDR = /^zs1[02-9ac-hj-np-z]{75}$/;          // sapling shielded

  let recoverSlug: string = $state('');
  let recoverLoading: boolean = $state(false);
  let recoverError: string | null = $state(null);
  let recoverIdentity: IdentityShape | null = $state(null);

  let recoverPrimaryAddresses: string = $state('');     // comma-separated
  let recoverMinSignatures: number = $state(1);
  let recoverPrivateAddress: string = $state('');       // optional z-address
  let recoverRevocationAuthority: string = $state('');  // override; blank keeps current
  let recoverRecoveryAuthority: string = $state('');    // override; blank keeps current
  let recoverSourceOfFunds: string = $state('');        // top-level CLI arg

  async function loadIdentity() {
    recoverError = null;
    recoverIdentity = null;
    recoverPrimaryAddresses = '';
    recoverPrivateAddress = '';
    recoverRevocationAuthority = '';
    recoverRecoveryAuthority = '';
    const piece = pieces.find((p) => p.slug === recoverSlug);
    if (!piece) return;
    recoverLoading = true;
    try {
      const res = await rpcCall<{ identity?: IdentityShape }>(
        CHAIN, 'getidentity', [piece.fullName]
      );
      const id = res.data.identity;
      if (!id) throw new Error('No identity object returned.');
      recoverIdentity = id;
      recoverMinSignatures =
        typeof id.minimumsignatures === 'number' ? id.minimumsignatures : 1;
    } catch (err) {
      recoverError = err instanceof Error ? err.message : 'Failed to fetch identity';
    } finally {
      recoverLoading = false;
    }
  }

  // Validation results for the recover form. Used both to gate command
  // generation and to render inline warnings.
  const recoverPrimaryParsed = $derived(
    recoverPrimaryAddresses
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const recoverPrimaryErrors = $derived(
    recoverPrimaryParsed
      .map((a) => {
        if (I_ADDR.test(a)) return `${a} is an i-address; primary addresses must be R-addresses`;
        if (!R_ADDR.test(a)) return `${a} doesn't look like a valid R-address`;
        return null;
      })
      .filter((m): m is string => !!m)
  );
  const recoverPrivateError = $derived(
    recoverPrivateAddress.trim() && !Z_ADDR.test(recoverPrivateAddress.trim())
      ? 'Doesn\'t look like a sapling (zs...) address'
      : null
  );

  // True when the on-chain authority points at the identity itself — the
  // common case for token-controlled IDs (kali control tokens). In that
  // case the placeholder reads "current: self" rather than the raw i-addr.
  const authIsSelf = $derived.by(() => {
    const idAddr = recoverIdentity?.identityaddress;
    return {
      revocation:
        !!idAddr && recoverIdentity?.revocationauthority === idAddr,
      recovery:
        !!idAddr && recoverIdentity?.recoveryauthority === idAddr,
    };
  });

  const recoverCommand = $derived.by(() => {
    if (!recoverIdentity) return '';

    const primary = recoverPrimaryParsed;
    if (primary.length === 0) return '';
    if (recoverPrimaryErrors.length > 0) return '';
    if (recoverPrivateError) return '';

    // Build the identity JSON from the live getidentity result. All fields
    // come from the chain so name, parent, systemid, etc. are authoritative.
    // The user only overrides primary addresses, signatures, and optionally
    // authorities + z-address. CMM is preserved verbatim.
    const json: Record<string, unknown> = {
      name: recoverIdentity.name,
      parent: recoverIdentity.parent,
      primaryaddresses: primary,
      minimumsignatures: recoverMinSignatures,
    };
    if (recoverIdentity.systemid) {
      json.systemid = recoverIdentity.systemid;
    }
    if (recoverIdentity.contentmultimap) {
      json.contentmultimap = recoverIdentity.contentmultimap;
    }

    // Authorities: user override wins; otherwise keep the on-chain value so
    // we never accidentally blank them.
    const rev = recoverRevocationAuthority.trim() || recoverIdentity.revocationauthority;
    if (rev) json.revocationauthority = rev;
    const rec = recoverRecoveryAuthority.trim() || recoverIdentity.recoveryauthority;
    if (rec) json.recoveryauthority = rec;

    // Z-address: user input wins; otherwise keep the existing on-chain
    // privateaddress if present.
    const priv = recoverPrivateAddress.trim() || recoverIdentity.privateaddress;
    if (priv) json.privateaddress = priv;

    const base = `${prefix}recoveridentity '${jsonInline(json)}' false true`;
    if (recoverSourceOfFunds.trim()) {
      return `${base} null "${recoverSourceOfFunds.trim()}"`;
    }
    return base;
  });

  // ─── Clipboard ───────────────────────────────────────────────────────────
  let copiedKey: string | null = $state(null);
  async function copy(text: string, key: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copiedKey = key;
      setTimeout(() => {
        if (copiedKey === key) copiedKey = null;
      }, 1500);
    } catch {
      // Clipboard API unavailable — user can still select & copy manually.
    }
  }
</script>

<svelte:head>
  <title>RPC Builders — Bitcoin Kali</title>
  <meta
    name="description"
    content="Interactive RPC builders for takeoffer, revokeidentity, and recoveridentity. Generates copy-paste commands for the Verus CLI or Desktop GUI terminal."
  />
</svelte:head>

<article class="builders-page">
  <header>
    <p class="eyebrow">Learn &nbsp;·&nbsp; build &amp; copy</p>
    <h1>RPC Builders</h1>
    <p class="lede">
      Build the exact RPC commands you need to take an offer, revoke a
      Bitcoin Kali identity, or recover one. Pick a piece, fill in your
      addresses, then copy the command into your own Verus wallet — no
      keys ever touch this page.
    </p>
  </header>

  <div class="wallet-toggle" role="radiogroup" aria-label="Wallet target">
    <button
      type="button"
      class:active={wallet === 'cli'}
      onclick={() => (wallet = 'cli')}
      role="radio"
      aria-checked={wallet === 'cli'}
    >
      CLI wallet <span class="muted">(./verus ...)</span>
    </button>
    <button
      type="button"
      class:active={wallet === 'gui'}
      onclick={() => (wallet = 'gui')}
      role="radio"
      aria-checked={wallet === 'gui'}
    >
      Desktop GUI <span class="muted">(run ...)</span>
    </button>
  </div>

  <!-- ────────────────── Take an Offer ────────────────── -->
  <section class="builder">
    <h2>Take an offer</h2>
    <p class="hint">
      Pick a piece. We'll query <code>getoffers</code> for the open listing
      and fill in the offer-side fields. You supply the addresses.
    </p>

    <label class="field">
      <span class="label">Piece</span>
      <select bind:value={takeSlug} onchange={loadOffers}>
        <option value="">— select a piece —</option>
        {#each pieces as p (p.slug)}
          <option value={p.slug}>{p.currencyName}</option>
        {/each}
      </select>
    </label>

    {#if takeLoading}
      <p class="status">Querying chain…</p>
    {:else if takeError}
      <p class="status error">{takeError}</p>
    {:else if takeOffers.length > 0 && selectedTakeOffer}
      <div class="offer-summary">
        <div><span class="lbl">Offering</span> {selectedTakeOffer.offeringAmount} {selectedTakeOffer.offeringCurrency}</div>
        <div><span class="lbl">Asking</span> {selectedTakeOffer.askingAmount} {selectedTakeOffer.askingCurrency}</div>
        <div class="full-row"><span class="lbl">Txid</span> <code>{selectedTakeOffer.txid}</code></div>
      </div>

      {#if takeOffers.length > 1}
        <label class="field">
          <span class="label">Pick offer (multiple found)</span>
          <select bind:value={takeOfferTxid}>
            {#each takeOffers as o (o.txid)}
              <option value={o.txid}>
                {o.offeringAmount} {o.offeringCurrency} for {o.askingAmount} {o.askingCurrency} — {o.txid.slice(0, 12)}…
              </option>
            {/each}
          </select>
        </label>
      {/if}

      <label class="field">
        <span class="label">From address <span class="req">*</span></span>
        <input
          type="text"
          placeholder='your address paying VRSC (e.g. "myname@" or "R..." or "*")'
          bind:value={takeFromAddress}
        />
      </label>
      <label class="field">
        <span class="label">Change address <span class="req">*</span></span>
        <input
          type="text"
          placeholder="where leftover VRSC goes"
          bind:value={takeChangeAddress}
        />
      </label>
      <label class="field">
        <span class="label">Destination for received token <span class="req">*</span></span>
        <input
          type="text"
          placeholder="address or identity that receives the token"
          bind:value={takeDestAddress}
        />
      </label>

      {#if takeCommand}
        <div class="output">
          <pre>{takeCommand}</pre>
          <button
            type="button"
            class="copy"
            onclick={() => copy(takeCommand, 'take')}
          >
            {copiedKey === 'take' ? 'Copied' : 'Copy'}
          </button>
        </div>
      {:else}
        <p class="status muted">Fill all three address fields to generate the command.</p>
      {/if}
    {/if}
  </section>

  <!-- ────────────────── Revoke (token revoke) ────────────────── -->
  <section class="builder">
    <h2>Revoke identity <span class="subtle">(token revoke)</span></h2>
    <p class="hint">
      The wallet running this command must hold the control token of the
      same name as the identity. The third positional argument
      <code>true</code> is <code>tokenrevoke</code>.
    </p>

    <label class="field">
      <span class="label">Piece</span>
      <select bind:value={revokeSlug}>
        <option value="">— select a piece —</option>
        {#each pieces as p (p.slug)}
          <option value={p.slug}>{p.currencyName}</option>
        {/each}
      </select>
    </label>

    <label class="field">
      <span class="label">Source of funds <span class="opt">(optional)</span></span>
      <input
        type="text"
        placeholder="transparent or private address to source fees from"
        bind:value={revokeSourceOfFunds}
      />
    </label>

    {#if revokeCommand}
      <div class="output">
        <pre>{revokeCommand}</pre>
        <button
          type="button"
          class="copy"
          onclick={() => copy(revokeCommand, 'revoke')}
        >
          {copiedKey === 'revoke' ? 'Copied' : 'Copy'}
        </button>
      </div>
    {:else}
      <p class="status muted">Select a piece to generate the command.</p>
    {/if}
  </section>

  <!-- ────────────────── Recover (token recover) ────────────────── -->
  <section class="builder">
    <h2>Recover identity <span class="subtle">(token recover)</span></h2>
    <p class="hint">
      We call <code>getidentity</code> to fetch the current on-chain state,
      then embed the existing <code>contentmultimap</code> and authorities
      so nothing is accidentally wiped on recovery. You supply new primary
      address(es); other fields are optional overrides.
    </p>

    <label class="field">
      <span class="label">Piece</span>
      <select bind:value={recoverSlug} onchange={loadIdentity}>
        <option value="">— select a piece —</option>
        {#each pieces as p (p.slug)}
          <option value={p.slug}>{p.currencyName}</option>
        {/each}
      </select>
    </label>

    {#if recoverLoading}
      <p class="status">Loading identity…</p>
    {:else if recoverError}
      <p class="status error">{recoverError}</p>
    {:else if recoverIdentity}
      <label class="field">
        <span class="label">New primary addresses <span class="req">*</span></span>
        <input
          type="text"
          placeholder="comma-separated R-addresses (NOT i-addresses)"
          bind:value={recoverPrimaryAddresses}
          aria-invalid={recoverPrimaryErrors.length > 0}
        />
        {#each recoverPrimaryErrors as msg}
          <span class="field-error">{msg}</span>
        {/each}
      </label>

      <label class="field">
        <span class="label">Minimum signatures</span>
        <input
          type="number"
          min="1"
          bind:value={recoverMinSignatures}
        />
      </label>

      <label class="field">
        <span class="label">Private address (z-address) <span class="opt">(optional; blank keeps current)</span></span>
        <input
          type="text"
          placeholder={recoverIdentity.privateaddress
            ? `current: ${recoverIdentity.privateaddress}`
            : 'zs... — optional sapling address'}
          bind:value={recoverPrivateAddress}
          aria-invalid={!!recoverPrivateError}
        />
        {#if recoverPrivateError}
          <span class="field-error">{recoverPrivateError}</span>
        {/if}
      </label>

      <label class="field">
        <span class="label">
          Revocation authority <span class="opt">(optional; blank keeps current)</span>
        </span>
        <input
          type="text"
          placeholder={authIsSelf.revocation
            ? 'current: self'
            : `current: ${recoverIdentity.revocationauthority ?? ''}`}
          bind:value={recoverRevocationAuthority}
        />
      </label>

      <label class="field">
        <span class="label">
          Recovery authority <span class="opt">(optional; blank keeps current)</span>
        </span>
        <input
          type="text"
          placeholder={authIsSelf.recovery
            ? 'current: self'
            : `current: ${recoverIdentity.recoveryauthority ?? ''}`}
          bind:value={recoverRecoveryAuthority}
        />
      </label>

      <label class="field">
        <span class="label">Source of funds <span class="opt">(optional)</span></span>
        <input
          type="text"
          placeholder="transparent or private address to source fees from"
          bind:value={recoverSourceOfFunds}
        />
      </label>

      {#if recoverCommand}
        <div class="output">
          <pre>{recoverCommand}</pre>
          <button
            type="button"
            class="copy"
            onclick={() => copy(recoverCommand, 'recover')}
          >
            {copiedKey === 'recover' ? 'Copied' : 'Copy'}
          </button>
        </div>
      {:else}
        <p class="status muted">Enter at least one primary address to generate the command.</p>
      {/if}
    {/if}
  </section>
</article>

<style>
  .builders-page {
    max-width: var(--measure-wide);
    margin: 0 auto;
  }
  header {
    margin-bottom: var(--space-5);
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
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--color-ivory);
  }

  .wallet-toggle {
    display: inline-flex;
    border: 1px solid var(--color-hairline);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--space-5);
  }
  .wallet-toggle button {
    background: transparent;
    border: none;
    border-right: 1px solid var(--color-hairline);
    color: var(--color-ash);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    padding: 0.6em 1.1em;
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
  }
  .wallet-toggle button:last-child {
    border-right: none;
  }
  .wallet-toggle button:hover {
    color: var(--color-ivory);
  }
  .wallet-toggle button.active {
    color: var(--color-vermilion);
    background: rgba(193, 74, 48, 0.08);
  }
  .wallet-toggle .muted {
    color: var(--color-ash);
    margin-left: 0.4em;
  }

  .builder {
    border: 1px solid var(--color-hairline);
    border-radius: 4px;
    padding: var(--space-4);
    margin-bottom: var(--space-5);
  }
  .builder h2 {
    font-family: var(--font-display);
    font-size: 1.4rem;
    color: var(--color-ivory);
    margin: 0 0 var(--space-2);
  }
  .builder h2 .subtle {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: var(--color-ash);
    margin-left: 0.4em;
  }
  .hint {
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--color-ivory-dim);
    margin: 0 0 var(--space-4);
    line-height: 1.55;
  }
  .hint code {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--color-ivory);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: var(--space-3);
  }
  .field .label {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-ash);
  }
  .field .req {
    color: var(--color-vermilion);
  }
  .field .opt {
    color: var(--color-ash);
    text-transform: none;
    letter-spacing: 0;
    margin-left: 0.3em;
  }
  .field input,
  .field select {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-ivory);
    background: var(--color-ink);
    border: 1px solid var(--color-hairline);
    border-radius: 3px;
    padding: 0.55em 0.7em;
    width: 100%;
    max-width: 100%;
  }
  .field input:focus,
  .field select:focus {
    outline: none;
    border-color: var(--color-vermilion);
  }
  .field input[aria-invalid='true'] {
    border-color: var(--color-vermilion);
  }
  .field-error {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--color-vermilion);
    margin-top: 0.25rem;
  }

  .offer-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-3);
    margin-bottom: var(--space-3);
    border: 1px solid var(--color-hairline);
    border-radius: 3px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--color-ivory);
  }
  .offer-summary .full-row {
    grid-column: 1 / -1;
    word-break: break-all;
  }
  .offer-summary .lbl {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ash);
    display: block;
  }
  .offer-summary code {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--color-ivory);
  }

  .status {
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--color-ash);
    margin: var(--space-2) 0;
  }
  .status.error {
    color: var(--color-vermilion);
  }
  .status.muted {
    color: var(--color-ash);
  }

  .output {
    position: relative;
    margin-top: var(--space-3);
    border: 1px solid var(--color-vermilion);
    border-radius: 3px;
    background: var(--color-ink);
  }
  .output pre {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--color-ivory);
    padding: var(--space-3) 5.5em var(--space-3) var(--space-3);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.5;
  }
  .copy {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
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
  .copy:hover {
    color: var(--color-ivory);
    border-color: var(--color-vermilion);
  }
</style>
