<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Actions } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { hostName, isHost, players, roomName } from '../GameState';
  import RoomSettingsPanel from './RoomSettingsPanel.svelte';
  import { DEFAULT_ROOM_SETTINGS } from '@shared/settings';
  import { roomSettings } from '../stores/roomSettingsStore';
  import { personalSettings } from '../stores/personalSettingsStore';

  let showSettings = $state(false);
  let lobbyMusicEl: HTMLAudioElement | undefined = $state();
  let resumeOnInteractionAttached = false;
  type Direction = -1 | 1;
  type BeastActor = {
    id: number;
    src: string;
    xPercent: number;
    bottomPx: number;
    direction: Direction;
    walking: boolean;
    flipping: boolean;
    floatingDurationMs: number;
    floatingDelayMs: number;
    moveDurationMs: number;
    exiting: boolean;
    opacity: number;
    sizePx: number;
  };

  // Beast assets and tunable timing constants
  const BEAST_IMAGE_COUNT = 11;
  const BEAST_IMAGE_PATHS = Array.from(
    { length: BEAST_IMAGE_COUNT },
    (_, i) => `/images/beasts/sb${i + 1}.png`,
  );
  const INITIAL_BEAST_COUNT = 3;
  const MIN_ACTIVE_BEASTS = 2;
  const MAX_ACTIVE_BEASTS = Math.min(5, BEAST_IMAGE_COUNT);
  const SPAWN_INTERVAL_MIN_MS = 1200;
  const SPAWN_INTERVAL_MAX_MS = 3200;
  const BEHAVIOR_TICK_MIN_MS = 1800;
  const BEHAVIOR_TICK_MAX_MS = 3400;
  const STOP_DURATION_MIN_MS = 1000;
  const STOP_DURATION_MAX_MS = 3200;
  const MOVE_DURATION_MIN_MS = 1800;
  const MOVE_DURATION_MAX_MS = 4200;
  const FLOAT_DURATION_MIN_MS = 1600;
  const FLOAT_DURATION_MAX_MS = 3000;
  const FLOAT_DELAY_MIN_MS = 0;
  const FLOAT_DELAY_MAX_MS = 700;
  const FLIP_DURATION_MS = 260;
  const ENTRY_DURATION_MIN_MS = 700;
  const ENTRY_DURATION_MAX_MS = 1300;
  const EXIT_DURATION_MIN_MS = 750;
  const EXIT_DURATION_MAX_MS = 1400;
  const FLIP_CHANCE_WHEN_STOPPING = 0.55;
  const STOP_CHANCE_PER_BEHAVIOR_TICK = 0.35;
  const EXIT_CHANCE_PER_BEHAVIOR_TICK = 0.06;
  const TOP_ENTRY_CHANCE = 0.28;
  const MIN_X_PERCENT = 8;
  const MAX_X_PERCENT = 92;
  const WALK_DISTANCE_MIN_PERCENT = 8;
  const WALK_DISTANCE_MAX_PERCENT = 22;
  const BASE_BOTTOM_MIN_PX = 8;
  const BASE_BOTTOM_MAX_PX = 46;
  const BEAST_SIZE_MIN_PX = 80;
  const BEAST_SIZE_MAX_PX = 140;
  const OFFSCREEN_PADDING_PX = 180;

  let beasts = $state<BeastActor[]>([]);
  let nextBeastId = 1;
  const beastTimeouts = new Map<number, number[]>();
  let spawnLoopTimeout: number | null = null;
  let initialSpawnTimeouts: number[] = [];

  const shouldPlayMusic = $derived.by(() => {
    const mode = $roomSettings.soundMode;
    if (mode === 'none') return false;
    if (mode === 'shared') return $isHost;
    return true;
  });

  function tryPlayLobbyMusic() {
    if (!lobbyMusicEl || !shouldPlayMusic) return;
    const playPromise = lobbyMusicEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        if (resumeOnInteractionAttached) return;
        resumeOnInteractionAttached = true;
        const resume = () => {
          if (shouldPlayMusic) {
            void lobbyMusicEl?.play().catch(() => {});
          }
          window.removeEventListener('pointerdown', resume, true);
          window.removeEventListener('keydown', resume, true);
          resumeOnInteractionAttached = false;
        };
        window.addEventListener('pointerdown', resume, true);
        window.addEventListener('keydown', resume, true);
      });
    }
  }

  function pauseLobbyMusic() {
    if (!lobbyMusicEl) return;
    lobbyMusicEl.pause();
    lobbyMusicEl.currentTime = 0;
  }

  function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min: number, max: number) {
    return Math.round(randomBetween(min, max));
  }

  function pickRandom<T>(items: readonly T[]) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function scheduleForBeast(id: number, ms: number, callback: () => void) {
    const timeoutId = window.setTimeout(() => {
      removeBeastTimeout(id, timeoutId);
      callback();
    }, ms);
    const existing = beastTimeouts.get(id) ?? [];
    existing.push(timeoutId);
    beastTimeouts.set(id, existing);
  }

  function removeBeastTimeout(id: number, timeoutId: number) {
    const list = beastTimeouts.get(id);
    if (!list) return;
    const nextList = list.filter((entry) => entry !== timeoutId);
    if (nextList.length === 0) {
      beastTimeouts.delete(id);
      return;
    }
    beastTimeouts.set(id, nextList);
  }

  function clearBeastTimers(id: number) {
    const list = beastTimeouts.get(id);
    if (!list) return;
    for (const timeoutId of list) {
      window.clearTimeout(timeoutId);
    }
    beastTimeouts.delete(id);
  }

  function patchBeast(id: number, patch: Partial<BeastActor>) {
    beasts = beasts.map((beast) =>
      beast.id === id
        ? {
            ...beast,
            ...patch,
          }
        : beast,
    );
  }

  function getBeastById(id: number) {
    return beasts.find((beast) => beast.id === id);
  }

  function getUnusedBeastSrc() {
    const inUse = new Set(beasts.map((beast) => beast.src));
    const available = BEAST_IMAGE_PATHS.filter((src) => !inUse.has(src));
    if (available.length === 0) return null;
    return pickRandom(available);
  }

  function clampXPercent(xPercent: number) {
    return Math.max(MIN_X_PERCENT, Math.min(MAX_X_PERCENT, xPercent));
  }

  function flipBeast(id: number, nextDirection: Direction) {
    patchBeast(id, { direction: nextDirection, flipping: true });
    scheduleForBeast(id, FLIP_DURATION_MS, () => {
      if (!getBeastById(id)) return;
      patchBeast(id, { flipping: false });
    });
  }

  function jumpOutAndRemove(id: number) {
    const beast = getBeastById(id);
    if (!beast || beast.exiting) return;
    const moveMs = randomInt(EXIT_DURATION_MIN_MS, EXIT_DURATION_MAX_MS);
    patchBeast(id, {
      exiting: true,
      walking: false,
      moveDurationMs: moveMs,
      bottomPx: -beast.sizePx - OFFSCREEN_PADDING_PX,
      opacity: 0.8,
    });
    scheduleForBeast(id, moveMs + 40, () => {
      clearBeastTimers(id);
      beasts = beasts.filter((entry) => entry.id !== id);
    });
  }

  function runBehaviorLoop(id: number) {
    const beast = getBeastById(id);
    if (!beast || beast.exiting) return;

    const nextTickMs = randomInt(BEHAVIOR_TICK_MIN_MS, BEHAVIOR_TICK_MAX_MS);

    if (
      beasts.length > MIN_ACTIVE_BEASTS &&
      Math.random() < EXIT_CHANCE_PER_BEHAVIOR_TICK
    ) {
      jumpOutAndRemove(id);
      return;
    }

    if (Math.random() < STOP_CHANCE_PER_BEHAVIOR_TICK) {
      patchBeast(id, { walking: false });
      if (Math.random() < FLIP_CHANCE_WHEN_STOPPING) {
        const nextDirection = beast.direction === 1 ? -1 : 1;
        flipBeast(id, nextDirection);
      }
      const stopForMs = randomInt(STOP_DURATION_MIN_MS, STOP_DURATION_MAX_MS);
      scheduleForBeast(id, stopForMs, () => {
        if (!getBeastById(id)) return;
        patchBeast(id, { walking: true });
        runBehaviorLoop(id);
      });
      return;
    }

    const distance = randomBetween(
      WALK_DISTANCE_MIN_PERCENT,
      WALK_DISTANCE_MAX_PERCENT,
    );
    const walkDirection: Direction = Math.random() < 0.5 ? -1 : 1;
    const nextX = clampXPercent(beast.xPercent + distance * walkDirection);
    const nextFacing: Direction = nextX >= beast.xPercent ? 1 : -1;
    if (nextFacing !== beast.direction) {
      flipBeast(id, nextFacing);
    }
    patchBeast(id, {
      walking: true,
      xPercent: nextX,
      moveDurationMs: randomInt(MOVE_DURATION_MIN_MS, MOVE_DURATION_MAX_MS),
    });
    scheduleForBeast(id, nextTickMs, () => {
      runBehaviorLoop(id);
    });
  }

  function spawnBeast() {
    if (beasts.length >= MAX_ACTIVE_BEASTS) return;
    const src = getUnusedBeastSrc();
    if (!src) return;

    const id = nextBeastId++;
    const sizePx = randomInt(BEAST_SIZE_MIN_PX, BEAST_SIZE_MAX_PX);
    const baseBottomPx = randomInt(BASE_BOTTOM_MIN_PX, BASE_BOTTOM_MAX_PX);
    const startsFromTop = Math.random() < TOP_ENTRY_CHANCE;
    const initialBottomPx = startsFromTop
      ? window.innerHeight + OFFSCREEN_PADDING_PX
      : -sizePx - OFFSCREEN_PADDING_PX;
    const moveDurationMs = randomInt(
      ENTRY_DURATION_MIN_MS,
      ENTRY_DURATION_MAX_MS,
    );

    beasts = [
      ...beasts,
      {
        id,
        src,
        xPercent: randomBetween(MIN_X_PERCENT, MAX_X_PERCENT),
        bottomPx: initialBottomPx,
        direction: Math.random() < 0.5 ? -1 : 1,
        walking: false,
        flipping: false,
        floatingDurationMs: randomInt(
          FLOAT_DURATION_MIN_MS,
          FLOAT_DURATION_MAX_MS,
        ),
        floatingDelayMs: randomInt(FLOAT_DELAY_MIN_MS, FLOAT_DELAY_MAX_MS),
        moveDurationMs,
        exiting: false,
        opacity: 0.9,
        sizePx,
      },
    ];

    scheduleForBeast(id, 40, () => {
      if (!getBeastById(id)) return;
      patchBeast(id, {
        bottomPx: baseBottomPx,
        walking: true,
        opacity: 1,
      });
    });

    scheduleForBeast(id, moveDurationMs + 80, () => {
      runBehaviorLoop(id);
    });
  }

  function runSpawnLoop() {
    if (beasts.length < MAX_ACTIVE_BEASTS && Math.random() < 0.9) {
      spawnBeast();
    }
    const nextMs = randomInt(SPAWN_INTERVAL_MIN_MS, SPAWN_INTERVAL_MAX_MS);
    spawnLoopTimeout = window.setTimeout(runSpawnLoop, nextMs);
  }

  $effect(() => {
    if (shouldPlayMusic) {
      tryPlayLobbyMusic();
      return;
    }
    pauseLobbyMusic();
  });

  $effect(() => {
    if (!lobbyMusicEl) return;
    lobbyMusicEl.volume = $personalSettings.soundVolume;
  });

  onMount(() => {
    for (let i = 0; i < INITIAL_BEAST_COUNT; i += 1) {
      const timeoutId = window.setTimeout(spawnBeast, i * 250);
      initialSpawnTimeouts.push(timeoutId);
    }
    const firstLoopDelay = randomInt(
      SPAWN_INTERVAL_MIN_MS,
      SPAWN_INTERVAL_MAX_MS,
    );
    spawnLoopTimeout = window.setTimeout(runSpawnLoop, firstLoopDelay);
  });

  onDestroy(() => {
    pauseLobbyMusic();
    for (const timeoutId of initialSpawnTimeouts) {
      window.clearTimeout(timeoutId);
    }
    initialSpawnTimeouts = [];
    if (spawnLoopTimeout !== null) {
      window.clearTimeout(spawnLoopTimeout);
      spawnLoopTimeout = null;
    }
    for (const beastId of beastTimeouts.keys()) {
      clearBeastTimers(beastId);
    }
  });

  function startGame() {
    ClientWebsocket.sendAction(new Actions.StartGame());
  }

  function resetRoomSettings() {
    const defaults = {
      ...DEFAULT_ROOM_SETTINGS,
      roundTimers: {},
    };
    // Apply immediately so host UI and debounced sends stay aligned with reset.
    roomSettings.set(defaults);
    ClientWebsocket.sendAction(
      new Actions.UpdateRoomSettings(defaults),
    );
  }
</script>

<div class="flex-center-page">
  <audio
    bind:this={lobbyMusicEl}
    src="/files/Scribble%20Beasts%20Bossa%20Nova%20Level%204.wav"
    loop
    preload="auto"
    aria-hidden="true"
  />
  <div class="beast-layer" aria-hidden="true">
    {#each beasts as beast (beast.id)}
      <div
        class="beast-slot"
        style={`left:${beast.xPercent}%;bottom:${beast.bottomPx}px;opacity:${
          beast.opacity
        };transition-duration:${beast.moveDurationMs}ms;z-index:${
          100 + beast.id
        };`}
      >
        <div
          class={`beast-facing ${beast.flipping ? 'is-flipping' : ''}`}
          style={`--facing:${beast.direction};--flip-duration-ms:${FLIP_DURATION_MS}ms;`}
        >
          <div
            class="beast-float"
            style={`animation-duration:${beast.floatingDurationMs}ms;animation-delay:${beast.floatingDelayMs}ms;`}
          >
            <img
              class={`beast-image ${beast.walking ? 'is-walking' : ''}`}
              src={beast.src}
              alt=""
              draggable="false"
              style={`width:${beast.sizePx}px;`}
            />
          </div>
        </div>
      </div>
    {/each}
  </div>
  <div class="paper-card lobby-card">
    <div class="room-header">
      <h3>Room: {$roomName}</h3>
      <button class="settings-btn" onclick={() => (showSettings = true)}
        >⚙ Settings</button
      >
    </div>
    <h1 class="text-pen-red">Lobby</h1>
    {#if $isHost}
      <p>You are the host!</p>
      {#if $players.length <= 1}
        <p>You need one more player to start.</p>
      {:else}
        <p>Start the game whenever you are ready</p>
        <button onclick={startGame}> Start Game </button>
      {/if}
    {:else}
      <p>Waiting on {$hostName} to start the game</p>
    {/if}
    <h2 class="text-pen-blue">Players:</h2>
    <ul class="player-list">
      {#each $players as player}
        <li>{player}</li>
      {/each}
    </ul>
  </div>
</div>

<!-- Settings modal -->
{#if showSettings}
  <div
    class="modal-backdrop"
    onclick={(e) => e.target === e.currentTarget && (showSettings = false)}
    onkeydown={(e) => e.key === 'Escape' && (showSettings = false)}
    role="dialog"
    aria-modal="true"
    aria-label="Room Settings"
    tabindex="-1"
  >
    <div class="modal-card paper-card" role="document">
      <div class="modal-header">
        <h2>Room Settings</h2>
        <div class="header-actions">
          {#if $isHost}
            <button class="reset-btn" onclick={resetRoomSettings}
              >Reset to defaults</button
            >
          {/if}
          <button class="close-btn" onclick={() => (showSettings = false)}
            >✕</button
          >
        </div>
      </div>
      <div class="modal-body">
        <RoomSettingsPanel />
      </div>
    </div>
  </div>
{/if}

<style>
  .beast-layer {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 900;
  }

  .beast-slot {
    position: fixed;
    transform: translateX(-50%);
    transition-property: left, bottom, opacity;
    transition-timing-function: linear;
    will-change: left, bottom, opacity;
  }

  .beast-facing {
    transform: scaleX(var(--facing, 1));
  }

  .beast-facing.is-flipping {
    animation: paper-mario-flip var(--flip-duration-ms, 260ms) ease-in-out;
  }

  .beast-float {
    animation-name: beast-float;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
  }

  .beast-image {
    user-select: none;
    display: block;
    object-fit: contain;
    image-rendering: auto;
    transform-origin: 50% 88%;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }

  .beast-image.is-walking {
    animation: beast-walk-teeter 460ms ease-in-out infinite;
  }

  .lobby-card {
    transform: rotate(1deg);
    max-width: 30rem;
    position: relative;
    z-index: 20;
  }

  .room-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    /* Push content clear of the paper-card dog-ear (50px corner) */
    padding-left: 2rem;
  }

  /* Override the global h3 margin since room-header handles spacing */
  .room-header h3 {
    margin: 0;
  }

  h1 {
    margin-bottom: 0.5rem;
  }
  h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  .player-list {
    list-style-type: '✏️';
    padding-left: 2rem;
    margin-bottom: 2rem;
    text-align: left;
  }
  li {
    padding: 0.8rem;
    margin-bottom: 0.8rem;
  }

  .settings-btn {
    background-color: transparent;
    color: var(--pen-black);
    border: 2px solid var(--grid-blue);
    padding: 0.3rem 0.7rem;
    font-size: var(--text-sm);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .settings-btn:hover {
    background-color: var(--grid-blue);
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
    padding: 1rem;
  }

  .modal-card {
    width: min(36rem, 100%);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    transform: rotate(-0.5deg);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* Indent to clear the paper-card dog-ear (50px corner + card padding) */
    padding-left: 1.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--grid-blue);
    margin-bottom: 0.5rem;
    flex-shrink: 0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: var(--text-xl);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .reset-btn {
    background: none;
    border: 1.5px solid var(--grid-blue);
    color: var(--pen-black);
    font-size: var(--text-sm);
    padding: 0.2rem 0.6rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-family: inherit;
    opacity: 0.75;
  }

  .reset-btn:hover {
    background-color: var(--grid-blue);
    opacity: 1;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: var(--text-xl);
    cursor: pointer;
    color: var(--pen-black);
    padding: 0.2rem 0.4rem;
    line-height: 1;
  }

  .close-btn:hover {
    background: none;
    color: var(--pen-red);
  }

  .modal-body {
    overflow-y: auto;
    padding-right: 0.25rem;
  }

  @keyframes beast-float {
    from {
      transform: translateY(-7px);
    }
    to {
      transform: translateY(5px);
    }
  }

  @keyframes beast-walk-teeter {
    0% {
      transform: rotate(-2.5deg) translateY(0);
    }
    50% {
      transform: rotate(2.5deg) translateY(-2px);
    }
    100% {
      transform: rotate(-2.5deg) translateY(0);
    }
  }

  @keyframes paper-mario-flip {
    0% {
      transform: scaleX(var(--facing, 1));
    }
    45% {
      transform: scaleX(0.05);
    }
    100% {
      transform: scaleX(var(--facing, 1));
    }
  }
</style>
