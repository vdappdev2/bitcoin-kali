<script lang="ts">
  import { onMount } from 'svelte';
  import { CHAIN, CHAIN_NAME } from '$lib/env';
  import type { PieceManifest } from '$lib/manifest';
  import {
    makeRealDeps,
    runTheatre,
    type StepRecord,
    type TheatreResult,
  } from '$lib/theatre';

  let { piece, variant = 'standalone' }: {
    piece: PieceManifest;
    variant?: 'standalone' | 'drawer';
  } = $props();

  // State: an array of 6 StepRecord slots, plus a top-level status and a run id
  // (incremented on Replay so we can key the rendered step list and retrigger).
  let runId = $state(0);
  let steps = $state<StepRecord[]>([]);
  let result = $state<TheatreResult | null>(null);
  let running = $state(false);
  let startedAt = $state<number | null>(null);
  let finishedAt = $state<number | null>(null);

  async function run() {
    running = true;
    result = null;
    steps = [];
    startedAt = Date.now();
    finishedAt = null;
    runId += 1;
    const myRun = runId;

    const deps = makeRealDeps(CHAIN);
    const next: StepRecord[] = [];

    const final = await runTheatre(deps, piece, CHAIN_NAME, (s) => {
      // A Replay during a slow run can race the previous run's callbacks.
      // Drop events from outdated runs.
      if (myRun !== runId) return;
      const existingIdx = next.findIndex((x) => x.id === s.id);
      if (existingIdx >= 0) next[existingIdx] = s;
      else next.push(s);
      steps = [...next];
    });

    if (myRun !== runId) return;
    result = final;
    running = false;
    finishedAt = Date.now();
  }

  onMount(() => {
    void run();
  });

  function durationLabel(): string {
    if (startedAt === null) return '';
    const end = finishedAt ?? Date.now();
    const ms = end - startedAt;
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  }
</script>

<section
  class="theatre"
  class:variant-standalone={variant === 'standalone'}
  class:variant-drawer={variant === 'drawer'}
  aria-label="Verification theatre for {piece.friendlyName}"
>
  <header class="header">
    <p class="eyebrow">Live verification &nbsp;·&nbsp; Piece {piece.position} / 7</p>
    <div class="header-row">
      <h2 class="title">
        <span>Verifying</span>
        <code class="iaddr">{piece.iaddr}</code>
      </h2>
      <button
        type="button"
        class="replay"
        onclick={run}
        disabled={running}
        aria-label="Replay verification from step 1"
      >
        {running ? 'Running…' : 'Replay ↻'}
      </button>
    </div>
    <p class="meta" aria-live="polite">
      {#if running}
        <span class="pulse">●</span>
        <span>Calling Verus RPC live from your browser…</span>
      {:else if result?.ok}
        <span class="ok-dot" aria-hidden="true">●</span>
        <span>All six checks passed in {durationLabel()}.</span>
      {:else if result && !result.ok}
        <span class="err-dot" aria-hidden="true">●</span>
        <span>Verification halted — see failed step below.</span>
      {/if}
    </p>
  </header>

  <ol class="steps" aria-live="polite">
    {#each steps as step (step.id)}
      <li
        class="step"
        class:pending={step.status === 'pending'}
        class:running={step.status === 'running'}
        class:ok={step.status === 'ok'}
        class:error={step.status === 'error'}
      >
        <header class="step-head">
          <span class="step-num" aria-hidden="true">{step.index}</span>
          <span class="step-label">{step.label}</span>
          <span class="step-status" aria-label="Status: {step.status}">
            {#if step.status === 'pending'}&nbsp;
            {:else if step.status === 'running'}running…
            {:else if step.status === 'ok'}✓
            {:else}✗{/if}
          </span>
        </header>

        {#if step.detail}
          <p class="step-detail">{step.detail}</p>
        {/if}

        {#if step.values && step.values.length > 0}
          <dl class="values">
            {#each step.values as v (v.label)}
              <div class="row">
                <dt>{v.label}</dt>
                <dd>
                  <code class:hex={v.className === 'hex'}>{v.value}</code>
                </dd>
              </div>
            {/each}
          </dl>
        {/if}

        {#if step.error}
          <p class="step-error">
            <strong>Error:</strong> {step.error}
          </p>
        {/if}
      </li>
    {/each}
  </ol>

  <footer class="footnote">
    <p>
      Everything above is executed live by your browser against the Verus public RPC.
      The source for this component is
      <code>src/lib/theatre.ts</code> — 200 lines, no frameworks, no magic. If a single
      check fails, the whole sequence halts; you see which one, and why.
    </p>
  </footer>
</section>

<style>
  .theatre {
    display: block;
    font-family: var(--font-body);
  }
  .variant-standalone {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
  }
  .variant-drawer {
    padding: var(--space-4) 0 0;
    border-top: 1px solid var(--color-hairline);
    margin-top: var(--space-4);
  }

  .header {
    margin-bottom: var(--space-5);
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--color-vermilion);
    margin-bottom: var(--space-3);
  }
  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }
  .title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 1.2;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .title .iaddr {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-ivory-dim);
    word-break: break-all;
  }
  .replay {
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
  .replay:hover:not(:disabled) {
    border-color: var(--color-vermilion);
    color: var(--color-vermilion);
  }
  .replay:disabled {
    color: var(--color-ash);
    cursor: default;
  }
  .meta {
    margin: var(--space-3) 0 0 0;
    font-size: 0.9rem;
    color: var(--color-ivory-dim);
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .pulse,
  .ok-dot,
  .err-dot {
    font-family: var(--font-mono);
    font-size: 0.7rem;
  }
  .pulse {
    color: var(--color-vermilion);
    animation: pulse 1.2s ease-in-out infinite;
  }
  .ok-dot {
    color: var(--color-vermilion);
  }
  .err-dot {
    color: #d14040;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .step {
    padding: var(--space-4) 0;
    border-top: 1px solid var(--color-hairline);
    transition: opacity 0.2s ease;
  }
  .step:last-child {
    border-bottom: 1px solid var(--color-hairline);
  }
  .step.pending {
    opacity: 0.4;
  }
  .step.running {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(193, 74, 48, 0.06) 50%,
      transparent 100%
    );
  }

  .step-head {
    display: grid;
    grid-template-columns: 2.4rem 1fr auto;
    align-items: baseline;
    gap: var(--space-3);
  }
  .step-num {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--color-ash);
    text-align: right;
  }
  .step-label {
    font-family: var(--font-body);
    font-size: 1.05rem;
    color: var(--color-ivory);
  }
  .step-status {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--color-ash);
    min-width: 4rem;
    text-align: right;
  }
  .step.ok .step-status {
    color: var(--color-vermilion);
  }
  .step.error .step-status {
    color: #d14040;
  }

  .step-detail {
    margin: var(--space-3) 0 var(--space-2) calc(2.4rem + var(--space-3));
    max-width: var(--measure-body);
    color: var(--color-ivory-dim);
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .values {
    margin: var(--space-3) 0 0 calc(2.4rem + var(--space-3));
    display: grid;
    grid-template-columns: minmax(max-content, 16rem) 1fr;
    gap: 0.35rem var(--space-3);
  }
  .values .row {
    display: contents;
  }
  .values dt {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-ash);
    padding-top: 0.2em;
  }
  .values dd {
    margin: 0;
    min-width: 0;
    color: var(--color-ivory);
    font-size: 0.88rem;
  }
  .values code {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--color-ivory-dim);
  }
  .values code.hex {
    word-break: break-all;
  }

  .step-error {
    margin: var(--space-3) 0 0 calc(2.4rem + var(--space-3));
    padding: var(--space-3);
    border-left: 2px solid #d14040;
    background: rgba(209, 64, 64, 0.06);
    color: #f0c0c0;
    font-size: 0.9rem;
    max-width: var(--measure-body);
    font-family: var(--font-mono);
    word-break: break-all;
  }
  .step-error strong {
    color: #d14040;
    font-weight: 600;
  }

  .footnote {
    margin-top: var(--space-5);
    max-width: var(--measure-body);
  }
  .footnote p {
    color: var(--color-ash);
    font-size: 0.82rem;
    font-style: italic;
    line-height: 1.55;
  }
  .footnote code {
    font-family: var(--font-mono);
    font-style: normal;
    color: var(--color-ivory-dim);
  }
</style>
