<script lang="ts">
  import { onMount } from 'svelte';
  import { NAME_ROUND_TEXT_FONTS } from '../constants/nameRoundTextFonts';

  type FontRow = {
    name: string;
    size: number;
    status: 'loading' | 'loaded' | 'failed';
  };

  const SAMPLE_TEXT = 'Scribble Beast 0123456789 AaBbYy';
  let fonts = $state<FontRow[]>(
    NAME_ROUND_TEXT_FONTS.map((font) => ({
      name: font.name,
      size: font.size,
      status: 'loading',
    })),
  );

  async function checkFontLoad(index: number) {
    const font = fonts[index];
    if (!font) return;

    try {
      await document.fonts.load(`${font.size}px '${font.name}'`);
      const loaded = document.fonts.check(`${font.size}px '${font.name}'`);
      fonts[index].status = loaded ? 'loaded' : 'failed';
    } catch {
      fonts[index].status = 'failed';
    }

    // Trigger state update for nested mutation.
    fonts = [...fonts];
  }

  function updateFontSize(index: number, value: string) {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    fonts[index].size = Math.round(parsed);
    fonts = [...fonts];
  }

  function resetSizes() {
    fonts = NAME_ROUND_TEXT_FONTS.map((font) => ({
      name: font.name,
      size: font.size,
      status: 'loading',
    }));
  }

  onMount(() => {
    fonts.forEach((_, i) => {
      void checkFontLoad(i);
    });
  });
</script>

<main class="font-test">
  <header>
    <h1>Font Test (Dev Only)</h1>
    <p>
      Compare all NameRound fonts and adjust sizes live. Share final numbers and
      we can update the input pen config.
    </p>
    <button onclick={resetSizes}>Reset to current config</button>
  </header>

  <section class="font-grid">
    {#each fonts as font, i (font.name)}
      <article class="font-row">
        <div class="font-head">
          <strong>{font.name}</strong>
          <span class:loaded={font.status === 'loaded'} class:failed={font.status === 'failed'}>
            {font.status}
          </span>
        </div>

        <label for={`size-${font.name}`}>Size (px)</label>
        <input
          id={`size-${font.name}`}
          type="number"
          min="8"
          max="120"
          step="1"
          value={font.size}
          oninput={(event) => updateFontSize(i, (event.target as HTMLInputElement).value)}
        />

        <p class="preview" style={`font-family: '${font.name}', sans-serif; font-size: ${font.size}px;`}>
          {SAMPLE_TEXT}
        </p>

        <button class="check-btn" onclick={() => checkFontLoad(i)}>Check Load</button>
      </article>
    {/each}
  </section>

  <section>
    <h2>Updated Config Preview</h2>
    <pre>{JSON.stringify(fonts.map(({ name, size }) => ({ name, size })), null, 2)}</pre>
  </section>
</main>

<style>
  .font-test {
    max-width: 72rem;
    margin: 0 auto;
    padding: 1rem;
  }

  header p {
    max-width: 60ch;
  }

  .font-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .font-row {
    border: 1px solid #cfd8dc;
    border-radius: 0.5rem;
    padding: 0.75rem;
    background: #fff;
  }

  .font-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .loaded {
    color: #1b5e20;
  }

  .failed {
    color: #b71c1c;
  }

  input {
    width: 6rem;
    margin-left: 0.5rem;
  }

  .preview {
    min-height: 3rem;
    margin: 0.75rem 0;
    line-height: 1.25;
  }

  .check-btn {
    border: 1px solid #90a4ae;
    background: #eceff1;
    border-radius: 0.25rem;
    padding: 0.3rem 0.6rem;
  }

  pre {
    overflow: auto;
    background: #111827;
    color: #f9fafb;
    padding: 0.75rem;
    border-radius: 0.5rem;
  }
</style>
