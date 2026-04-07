<script lang="ts">
  import { Actions } from '@shared/actions';
  import { RoundEnum } from '@shared/rounds';
  import type { RoomSettings, SoundMode } from '@shared/settings';
  import ClientWebsocket from '../ClientWebsocket';
  import { isHost } from '../GameState';
  import { roomSettings } from '../stores/roomSettingsStore';

  // Local draft — host edits locally, debounced send on each change
  let draft = $state<RoomSettings>({ ...$roomSettings, roundTimers: { ...$roomSettings.roundTimers } });

  // Keep draft in sync if server broadcasts a change (e.g. host reconnect)
  $effect(() => {
    draft = { ...$roomSettings, roundTimers: { ...$roomSettings.roundTimers } };
  });

  let sendTimer: ReturnType<typeof setTimeout> | null = null;
  function send() {
    if (sendTimer) clearTimeout(sendTimer);
    sendTimer = setTimeout(() => {
      ClientWebsocket.sendAction(new Actions.UpdateRoomSettings(draft));
    }, 350);
  }

  function toggleSelfVote() {
    draft.allowSelfVote = !draft.allowSelfVote;
    send();
  }

  function toggleSkipIntro() {
    draft.skipIntro = !draft.skipIntro;
    send();
  }

  function toggleSkipTutorials() {
    draft.skipTutorials = !draft.skipTutorials;
    send();
  }

  function toggleCaptions() {
    draft.captions = !draft.captions;
    send();
  }

  function setSoundMode(mode: SoundMode) {
    draft.soundMode = mode;
    send();
  }

  const STEP = 10;

  function setRoundTimer(roundType: RoundEnum, value: number | null) {
    if (value === null) {
      delete draft.roundTimers[roundType];
    } else {
      draft.roundTimers[roundType] = Math.max(STEP, value);
    }
    // Trigger reactivity
    draft.roundTimers = { ...draft.roundTimers };
    send();
  }

  function stepTimer(roundType: RoundEnum, defaultSec: number, delta: number) {
    const current = draft.roundTimers[roundType] ?? defaultSec;
    // Snap to nearest multiple of STEP, then apply delta
    const snapped = Math.round(current / STEP) * STEP;
    const next = Math.max(STEP, snapped + delta);
    setRoundTimer(roundType, next);
  }

  function handleTimerInput(roundType: RoundEnum, raw: string) {
    const parsed = parseInt(raw, 10);
    if (raw === '' || isNaN(parsed)) {
      setRoundTimer(roundType, null);
    } else {
      setRoundTimer(roundType, parsed);
    }
  }

  const ROUND_LABELS: { type: RoundEnum; label: string; defaultSec: number }[] = [
    { type: RoundEnum.SCRIBBLE, label: 'Scribble', defaultSec: 30 },
    { type: RoundEnum.LINE, label: 'Line', defaultSec: 120 },
    { type: RoundEnum.COLOR, label: 'Color', defaultSec: 120 },
    { type: RoundEnum.DETAIL, label: 'Detail', defaultSec: 60 },
    { type: RoundEnum.NAME, label: 'Name', defaultSec: 60 },
    { type: RoundEnum.END_OF_THE_WORLD, label: "End of the World", defaultSec: 20 },
    { type: RoundEnum.VOTE, label: 'Vote', defaultSec: 60 },
  ];

  const SOUND_MODES: { value: SoundMode; label: string; description: string }[] = [
    {
      value: 'separate',
      label: 'Separate Sound',
      description: "Each player's device plays audio (best for remote play)",
    },
    {
      value: 'shared',
      label: 'Shared Sound',
      description: "Audio plays through the host's speakers only (best for in-person)",
    },
    {
      value: 'none',
      label: 'No Sound',
      description: 'No audio plays',
    },
  ];
</script>

<div class="settings-panel">
  {#if $isHost}
    <!-- ── Voting ─────────────────────────────────────────── -->
    <section>
      <h3 class="section-title">Voting</h3>
      <label class="toggle-row">
        <span class="toggle-label">
          Players can vote for themselves
          <span class="note">(always on for 2-player games)</span>
        </span>
        <button
          class="toggle"
          class:active={draft.allowSelfVote}
          onclick={toggleSelfVote}
          aria-checked={draft.allowSelfVote}
          role="switch"
        >
          {draft.allowSelfVote ? 'On' : 'Off'}
        </button>
      </label>
    </section>

    <!-- ── Interludes ─────────────────────────────────────── -->
    <section>
      <h3 class="section-title">Interludes</h3>
      <p class="section-note">
        Video segments shown between rounds.
        <!-- TODO: implement interlude playback -->
      </p>
      <label class="toggle-row">
        <span class="toggle-label">Skip Intro</span>
        <!-- TODO: implement intro skip logic -->
        <button
          class="toggle"
          class:active={draft.skipIntro}
          onclick={toggleSkipIntro}
          aria-pressed={draft.skipIntro}
          role="switch"
        >
          {draft.skipIntro ? 'On' : 'Off'}
        </button>
      </label>
      <label class="toggle-row">
        <span class="toggle-label">Skip Tutorials</span>
        <!-- TODO: implement tutorial skip logic in drawing rounds -->
        <button
          class="toggle"
          class:active={draft.skipTutorials}
          onclick={toggleSkipTutorials}
          aria-pressed={draft.skipTutorials}
          role="switch"
        >
          {draft.skipTutorials ? 'On' : 'Off'}
        </button>
      </label>

      <label class="toggle-row">
        <span class="toggle-label">Captions</span>
        <button
          class="toggle"
          class:active={draft.captions}
          onclick={toggleCaptions}
          aria-checked={draft.captions}
          role="switch"
        >
          {draft.captions ? 'On' : 'Off'}
        </button>
      </label>

      <fieldset class="sound-fieldset">
        <legend class="sound-legend">Sound</legend>
        <!-- TODO: implement sound playback logic -->
        {#each SOUND_MODES as mode}
          <label class="radio-row">
            <input
              type="radio"
              name="soundMode"
              value={mode.value}
              checked={draft.soundMode === mode.value}
              onchange={() => setSoundMode(mode.value)}
            />
            <span>
              <strong>{mode.label}</strong>
              <span class="radio-desc">{mode.description}</span>
            </span>
          </label>
        {/each}
      </fieldset>
    </section>

    <!-- ── Round Timers ───────────────────────────────────── -->
    <section>
      <h3 class="section-title">Round Timers</h3>
      <p class="section-note">
        Override each round's duration.
      </p>
      <div class="timer-grid">
        {#each ROUND_LABELS as round}
          <div class="timer-row">
            <span class="timer-label">{round.label}</span>
            <div class="stepper">
              <button
                class="step-btn"
                onclick={() => stepTimer(round.type, round.defaultSec, -STEP)}
                aria-label="Decrease {round.label} timer by {STEP} seconds"
              >▼</button>
              <input
                class="timer-input"
                type="number"
                min={STEP}
                max="3600"
                step={STEP}
                placeholder={String(round.defaultSec)}
                value={draft.roundTimers[round.type] ?? ''}
                oninput={(e) => handleTimerInput(round.type, (e.target as HTMLInputElement).value)}
              />
              <button
                class="step-btn"
                onclick={() => stepTimer(round.type, round.defaultSec, STEP)}
                aria-label="Increase {round.label} timer by {STEP} seconds"
              >▲</button>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {:else}
    <!-- Non-host read-only view -->
    <section>
      <h3 class="section-title">Room Settings</h3>
      <p class="readonly-note">Only the host can change these settings.</p>
      <ul class="readonly-list">
        <li>Self-voting: <strong>{$roomSettings.allowSelfVote ? 'On' : 'Off'}</strong></li>
        <li>Skip Intro: <strong>{$roomSettings.skipIntro ? 'On' : 'Off'}</strong></li>
        <li>Skip Tutorials: <strong>{$roomSettings.skipTutorials ? 'On' : 'Off'}</strong></li>
        <li>Captions: <strong>{$roomSettings.captions ? 'On' : 'Off'}</strong></li>
        <li>
          Sound: <strong>
            {$roomSettings.soundMode === 'separate' ? 'Separate' :
             $roomSettings.soundMode === 'shared' ? 'Shared' : 'None'}
          </strong>
        </li>
      </ul>
    </section>
  {/if}
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
    color: var(--pen-blue);
    border-bottom: 2px solid var(--grid-blue);
    padding-bottom: 0.2rem;
  }

  .section-note {
    margin: 0;
    font-size: var(--text-sm);
    opacity: 0.7;
  }

  /* Toggle row */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.3rem 0;
  }

  .toggle-label {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .note {
    font-size: var(--text-sm);
    opacity: 0.6;
  }

  .toggle {
    min-width: 3.5rem;
    padding: 0.3rem 0.75rem;
    font-size: var(--text-sm);
    background-color: #95a5a6;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s;
    color: white;
    font-family: inherit;
  }

  .toggle.active {
    background-color: var(--pen-blue);
  }

  .toggle.active:hover {
    background-color: #2980b9;
  }

  .toggle:not(.active):hover {
    background-color: #7f8c8d;
  }

  /* Sound radio group */
  .sound-fieldset {
    border: 1px solid var(--grid-blue);
    border-radius: 0.25rem;
    padding: 0.5rem 0.75rem;
    margin: 0;
  }

  .sound-legend {
    font-size: var(--text-sm);
    padding: 0 0.25rem;
    opacity: 0.8;
  }

  .radio-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.3rem 0;
  }

  .radio-row input[type='radio'] {
    margin-top: 0.2rem;
    background-image: none;
    background-color: transparent;
    border: none;
    padding: 0;
    font-size: inherit;
    line-height: inherit;
    width: auto;
    flex-shrink: 0;
  }

  .radio-desc {
    display: block;
    font-size: var(--text-sm);
    opacity: 0.65;
  }

  /* Timer grid — 2 columns, label + stepper inline per cell */
  .timer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem 1rem;
  }

  .timer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .timer-label {
    font-size: var(--text-sm);
    white-space: nowrap;
  }

  /* Custom stepper */
  .stepper {
    display: flex;
    align-items: stretch;
    width: fit-content;
    flex-shrink: 0;
    border: 1.5px solid var(--grid-blue);
    border-radius: 0.3rem;
    overflow: hidden;
    background: white;
  }

  .timer-input {
    width: 2.8rem;
    font-size: var(--text-sm);
    padding: 0.25rem 0.3rem;
    border: none;
    border-left: 1.5px solid var(--grid-blue);
    border-right: 1.5px solid var(--grid-blue);
    background-image: none;
    background-color: white;
    line-height: 1.4;
    text-align: center;
    /* Hide native spinner arrows */
    appearance: textfield;
    -moz-appearance: textfield;
  }

  .timer-input::-webkit-inner-spin-button,
  .timer-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .step-btn {
    width: 2rem;
    padding: 0;
    background: #f0f4f8;
    color: var(--pen-black);
    border: none;
    border-radius: 0;
    font-size: 0.65rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.1s;
    font-family: inherit;
  }

  .step-btn:hover {
    background-color: var(--grid-blue);
  }

  .step-btn:active {
    background-color: var(--pen-blue);
    color: white;
  }

  /* Read-only */
  .readonly-note {
    margin: 0;
    font-size: var(--text-sm);
    opacity: 0.65;
  }

  .readonly-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: var(--text-sm);
  }
</style>
