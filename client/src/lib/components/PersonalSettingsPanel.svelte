<script lang="ts">
  import { personalSettings, type FontChoice, type FontSize } from '../stores/personalSettingsStore';

  const FONTS: { value: FontChoice; label: string }[] = [
    { value: 'Children', label: 'Children (default)' },
    { value: 'DadHand', label: 'Dad Hand' },
    { value: 'Daniel', label: 'Daniel' },
    { value: 'OhMaria', label: 'Oh Maria' },
    { value: 'OpenDyslexic', label: 'OpenDyslexic (accessibility)' },
  ];

  const SIZES: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'Extra Large' },
  ];

  function setFont(value: FontChoice) {
    personalSettings.update((s) => ({ ...s, font: value }));
  }

  function setFontSize(value: FontSize) {
    personalSettings.update((s) => ({ ...s, fontSize: value }));
  }
</script>

<div class="settings-panel">
  <!-- ── Accessibility ─────────────────────────────────────── -->
  <section>
    <h3 class="section-title">Accessibility</h3>
    <p class="section-note">
      These settings apply only to your device and are saved automatically.
      Font size does not affect the drawing canvas.
    </p>

    <div class="field">
      <label class="field-label" for="font-select">Font</label>
      <select
        id="font-select"
        class="field-select"
        value={$personalSettings.font}
        onchange={(e) => setFont((e.target as HTMLSelectElement).value as FontChoice)}
      >
        {#each FONTS as f}
          <option value={f.value}>{f.label}</option>
        {/each}
      </select>
      <span class="preview" style="font-family: var(--ui-font);">
        The quick brown fox
      </span>
    </div>

    <div class="field">
      <span class="field-label">Text Size</span>
      <div class="size-row">
        {#each SIZES as sz}
          <button
            class="size-btn"
            class:active={$personalSettings.fontSize === sz.value}
            onclick={() => setFontSize(sz.value)}
            aria-pressed={$personalSettings.fontSize === sz.value}
          >
            {sz.label}
          </button>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── Sound ─────────────────────────────────────────────── -->
  <section>
    <h3 class="section-title">Sound</h3>
    <!-- TODO: implement personal sound/volume settings -->
    <p class="section-note todo">Sound controls coming soon.</p>
  </section>
</div>

<style>
  .settings-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: left;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .section-title {
    margin: 0 0 0.25rem;
    padding-left: 1.25rem;
    font-size: var(--text-lg);
    color: var(--pen-red);
    border-bottom: 2px solid var(--grid-blue);
    padding-bottom: 0.2rem;
  }

  .section-note {
    margin: 0;
    font-size: var(--text-sm);
    opacity: 0.7;
  }

  .section-note.todo {
    font-style: italic;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .field-label {
    font-size: var(--text-sm);
    font-weight: bold;
  }

  .field-select {
    font-family: inherit;
    font-size: var(--text-sm);
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--grid-blue);
    border-radius: 0.25rem;
    background: white;
    color: var(--pen-black);
    cursor: pointer;
    background-image: none;
  }

  .preview {
    font-size: var(--text-base);
    opacity: 0.75;
    padding-left: 0.1rem;
  }

  .size-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .size-btn {
    padding: 0.25rem 0.6rem;
    font-size: var(--text-sm);
    background: #ecf0f1;
    color: var(--pen-black);
    border: 2px solid transparent;
    border-radius: 0.25rem;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.1s;
  }

  .size-btn:hover {
    background: #d5dbdb;
  }

  .size-btn.active {
    border-color: var(--pen-red);
    background: white;
  }
</style>
