<script lang="ts">
  import type { AttributesJson } from '$lib/cmm';

  let { attributes }: { attributes: AttributesJson } = $props();

  // Prefer a stable order for known fields, then append anything else we don't
  // know about (forward-compat for future attributes).
  const KNOWN: ReadonlyArray<readonly [keyof AttributesJson, string]> = [
    ['name', 'Name'],
    ['edition', 'Edition'],
    ['bitcoinItem', 'Bitcoin item'],
    ['background', 'Background'],
    ['seed', 'Seed'],
    ['generatorVersion', 'Generator version'],
    ['identity', 'Identity'],
    ['iaddress', 'i-address'],
  ];

  const rows = $derived.by(() => {
    const out: Array<[string, string]> = [];
    const seen = new Set<string>();
    for (const [key, label] of KNOWN) {
      const val = attributes[key];
      if (val !== undefined && val !== null && val !== '') {
        out.push([label, String(val)]);
        seen.add(key as string);
      }
    }
    for (const [key, val] of Object.entries(attributes)) {
      if (seen.has(key)) continue;
      if (val === undefined || val === null || val === '') continue;
      out.push([key, typeof val === 'string' ? val : JSON.stringify(val)]);
    }
    return out;
  });
</script>

<section class="attrs" aria-label="Attributes">
  <h2 class="section-label">Attributes</h2>
  <dl>
    {#each rows as [label, value] (label)}
      <div class="row">
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    {/each}
  </dl>
</section>

<style>
  .attrs {
    margin: var(--space-5) 0;
  }
  .section-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--color-ash);
    font-weight: 400;
    margin-bottom: var(--space-3);
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.4rem var(--space-4);
    margin: 0;
    max-width: var(--measure-wide);
  }
  .row {
    display: contents;
  }
  dt {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-ash);
    padding-top: 0.15em;
  }
  dd {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--color-ivory);
    margin: 0;
    word-break: break-word;
  }
</style>
