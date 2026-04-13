<script lang="ts">
  import { page } from '$app/state';
  import { LEARN_TOPICS, getAdjacentTopics } from '$lib/learn-topics';
  let { children } = $props();

  const currentSlug = $derived(
    page.url.pathname.replace('/learn/', '').replace(/\/$/, '') || ''
  );
  const adjacent = $derived(getAdjacentTopics(currentSlug));
  const isIndex = $derived(page.url.pathname === '/learn' || page.url.pathname === '/learn/');
</script>

<div class="learn-shell">
  <nav class="topic-nav" aria-label="Learn topics">
    <a href="/learn" class="nav-link" class:active={isIndex}>Overview</a>
    {#each LEARN_TOPICS as topic (topic.slug)}
      <a
        href="/learn/{topic.slug}"
        class="nav-link"
        class:active={currentSlug === topic.slug}
      >
        <span class="num">{topic.position}</span>
        {topic.title}
      </a>
    {/each}
  </nav>

  <div class="learn-body">
    {@render children()}
  </div>

  {#if !isIndex && (adjacent.prev || adjacent.next)}
    <nav class="footer-nav" aria-label="Topic navigation">
      {#if adjacent.prev}
        <a href="/learn/{adjacent.prev.slug}" class="prev">
          ← {adjacent.prev.title}
        </a>
      {:else}
        <span></span>
      {/if}
      {#if adjacent.next}
        <a href="/learn/{adjacent.next.slug}" class="next">
          {adjacent.next.title} →
        </a>
      {/if}
    </nav>
  {/if}
</div>

<style>
  .learn-shell {
    max-width: var(--measure-wide);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4) var(--space-7);
  }

  .topic-nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--color-hairline);
    margin-bottom: var(--space-6);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .nav-link {
    color: var(--color-ash);
    text-decoration: none;
    padding: var(--space-1) 0;
    border-bottom: 1px solid transparent;
    white-space: nowrap;
  }
  .nav-link:hover {
    color: var(--color-ivory-dim);
    border-bottom-color: var(--color-vermilion);
  }
  .nav-link.active {
    color: var(--color-vermilion);
    border-bottom-color: var(--color-vermilion);
  }

  .num {
    color: var(--color-ash);
    margin-right: 0.15em;
  }
  .nav-link.active .num {
    color: var(--color-vermilion);
  }

  .footer-nav {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-7);
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-hairline);
    font-family: var(--font-body);
    font-size: 0.95rem;
  }
  .footer-nav a {
    color: var(--color-ivory-dim);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    padding-bottom: 2px;
  }
  .footer-nav a:hover {
    color: var(--color-ivory);
    border-bottom-color: var(--color-vermilion);
  }
  .footer-nav .next {
    margin-left: auto;
  }
</style>
