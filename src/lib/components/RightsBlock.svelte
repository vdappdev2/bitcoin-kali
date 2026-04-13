<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<section class="rights" aria-label="Rights assertion">
  <details class="drawer">
    <summary>
      <h2 class="section-label">Rights</h2>
    </summary>
    <blockquote>
      {text}
    </blockquote>
    <p class="footnote">
      This text is stored on chain as a signed <code>contentmultimap</code> entry.
      Rights travel with control of the Verus identity — no separate instrument
      required.
    </p>
  </details>
</section>

<style>
  .rights {
    margin: var(--space-6) 0;
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-hairline);
  }
  .drawer summary {
    cursor: pointer;
    list-style: none;
    outline-offset: 4px;
  }
  .drawer summary::-webkit-details-marker {
    display: none;
  }
  .section-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--color-ash);
    font-weight: 400;
    margin: 0;
    display: inline;
  }
  .section-label::before {
    content: '▸ ';
    color: var(--color-vermilion);
    display: inline;
  }
  .drawer[open] .section-label::before {
    content: '▾ ';
  }
  .drawer summary:hover .section-label {
    color: var(--color-vermilion);
  }
  blockquote {
    margin: var(--space-3) 0 0;
    padding: 0 0 0 var(--space-4);
    max-width: var(--measure-body);
    border-left: 2px solid var(--color-vermilion);
    color: var(--color-ivory);
    font-size: 1rem;
    line-height: 1.65;
    white-space: pre-wrap;
  }
  .footnote {
    margin-top: var(--space-3);
    max-width: var(--measure-body);
    color: var(--color-ash);
    font-size: 0.85rem;
    font-style: italic;
  }
  .footnote code {
    font-style: normal;
  }
</style>
