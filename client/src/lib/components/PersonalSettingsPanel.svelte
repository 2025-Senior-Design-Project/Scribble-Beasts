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

  function setSoundVolume(value: number) {
    personalSettings.update((s) => ({ ...s, soundVolume: value }));
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
    <p class="section-note">Controls sound volume on your device only.</p>

    <div class="field">
      <label class="field-label" for="sound-volume">Volume: {Math.round($personalSettings.soundVolume * 100)}%</label>
      <input
        id="sound-volume"
        class="volume-slider"
        style={`--volume-percent: ${Math.round($personalSettings.soundVolume * 100)}%;`}
        type="range"
        min="0"
        max="100"
        step="1"
        value={Math.round($personalSettings.soundVolume * 100)}
        oninput={(e) => setSoundVolume(Number((e.target as HTMLInputElement).value) / 100)}
      />
    </div>
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

  .volume-slider {
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 0;
  }

  .volume-slider::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(
      to right,
      var(--pen-red) 0%,
      var(--pen-red) var(--volume-percent, 100%),
      #cfd8dc var(--volume-percent, 100%),
      #cfd8dc 100%
    );
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--pen-red);
    background: #fff;
    margin-top: -5px;
    cursor: pointer;
  }

  .volume-slider::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: #cfd8dc;
  }

  .volume-slider::-moz-range-progress {
    height: 6px;
    border-radius: 999px;
    background: var(--pen-red);
  }

  .volume-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--pen-red);
    background: #fff;
    cursor: pointer;
  }
</style>
