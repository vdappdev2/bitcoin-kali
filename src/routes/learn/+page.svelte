<script lang="ts">
  import { LEARN_TOPICS } from '$lib/learn-topics';
</script>

<svelte:head>
  <title>Learn — Bitcoin Kali</title>
  <meta
    name="description"
    content="Ten short guides to the Verus primitives behind Bitcoin Kali: VDXF keys, contentmultimaps, signdata, verifysignature, identity, encrypted delivery, on-chain rights, the trust model, ID control tokens, and the Verus marketplace."
  />
</svelte:head>

<article class="learn-index">
  <header>
    <p class="eyebrow">Series 1 &nbsp;·&nbsp; live on Verus</p>
    <h1>Learn</h1>
    <p class="lede">
      Bitcoin Kali uses a handful of Verus primitives to put seven NFTs
      entirely on chain — identity, provenance, encrypted delivery, rights,
      and marketplace — with nothing trusted and everything verifiable from
      public RPC.
    </p>
    <p class="lede">
      These ten pages walk through each primitive with real mainnet data:
      actual i-addresses, transaction IDs, block heights, and hex values you
      can check yourself. Every page links to the live viewer so you can
      watch the proof reconstruct in front of you.
    </p>
    <p class="lede secondary">
      These aren't just NFT tools. They're primitives for any system where
      identity, provenance, and delivery matter — supply chains, credentials,
      legal documents, autonomous agents, and more.
    </p>
  </header>

  <ol class="topic-list">
    {#each LEARN_TOPICS as topic (topic.slug)}
      <li>
        <a href="/learn/{topic.slug}" class="topic-link">
          <span class="topic-title">{topic.title}</span>
          <span class="topic-sub">{topic.subtitle}</span>
        </a>
      </li>
    {/each}
  </ol>
</article>

<style>
  .learn-index header {
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
    font-size: 2.4rem;
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
    margin-bottom: var(--space-3);
  }
  .lede.secondary {
    color: var(--color-ivory-dim);
    font-size: 1rem;
  }

  .topic-list {
    list-style: none;
    padding: 0;
    margin: 0;
    counter-reset: topic;
  }
  .topic-list li {
    counter-increment: topic;
    border-top: 1px solid var(--color-hairline);
  }
  .topic-list li:last-child {
    border-bottom: 1px solid var(--color-hairline);
  }

  .topic-link {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    padding: var(--space-3) 0;
    text-decoration: none;
    color: var(--color-ivory);
  }
  .topic-link:hover .topic-title {
    color: var(--color-vermilion);
  }
  .topic-link::before {
    content: counter(topic);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--color-ash);
    min-width: 1.5ch;
  }

  .topic-title {
    font-family: var(--font-body);
    font-size: 1.05rem;
    font-weight: 600;
    transition: color 0.15s;
  }
  .topic-sub {
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--color-ivory-dim);
  }

  @media (max-width: 600px) {
    .topic-link {
      flex-direction: column;
      gap: var(--space-1);
    }
  }
</style>
