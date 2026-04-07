<script lang="ts">
  import { onMount } from 'svelte';
  import {
    endCurrentRound,
    roundStore,
    startNextRound,
  } from '../stores/roundStore';
  import { ActionEnum } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { ROUND_TYPE_COMPONENT_DICT } from '../constants/RoundTypeComponentDict';
  import Intro from './Intro.svelte';
  import { introPlaying } from '../stores/introStore';
  import { isHost } from '../GameState';
  import { roomSettings } from '../stores/roomSettingsStore';
  import { personalSettings } from '../stores/personalSettingsStore';

  import type { StartRoundAction } from '@shared/actions';

  let roundMusicEl: HTMLAudioElement | undefined = $state();
  let resumeOnInteractionAttached = false;
  let playbackOffsetSeconds = 0;
  let playbackStartedAtMs: number | undefined = undefined;
  let trackDurationSeconds = 0;
  let needsSeekOnCanPlay = false;
  let lastAppliedMusicSrc: string | undefined = undefined;

  const shouldPlayMusic = $derived.by(() => {
    if ($introPlaying) return false;
    const mode = $roomSettings.soundMode;
    if (mode === 'none') return false;
    if (mode === 'shared') return $isHost;
    return true;
  });

  const currentRoundMusicSrc = $derived.by(() => {
    const currentRoundNumber = $roundStore.number ?? -1;
    const musicLevel = Math.min(4, Math.max(1, currentRoundNumber + 1));
    return `/files/Scribble%20Beasts%20Bossa%20Nova%20Level%20${musicLevel}.wav`;
  });

  function mod(n: number, m: number) {
    return ((n % m) + m) % m;
  }

  function getCurrentGlobalOffsetSeconds() {
    if (playbackStartedAtMs === undefined) {
      return playbackOffsetSeconds;
    }
    return playbackOffsetSeconds + (performance.now() - playbackStartedAtMs) / 1000;
  }

  function freezeGlobalOffset() {
    playbackOffsetSeconds = getCurrentGlobalOffsetSeconds();
    playbackStartedAtMs = undefined;
  }

  function applyOffsetToCurrentTrack() {
    if (!roundMusicEl) return;
    const duration = Number.isFinite(roundMusicEl.duration) && roundMusicEl.duration > 0
      ? roundMusicEl.duration
      : trackDurationSeconds;
    if (!Number.isFinite(duration) || duration <= 0) return;
    trackDurationSeconds = duration;
    roundMusicEl.currentTime = mod(playbackOffsetSeconds, duration);
  }

  function tryPlayRoundMusic() {
    if (!roundMusicEl || !shouldPlayMusic || needsSeekOnCanPlay) return;

    const playPromise = roundMusicEl.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        if (playbackStartedAtMs === undefined) {
          playbackStartedAtMs = performance.now();
        }
      }).catch(() => {
        playbackStartedAtMs = undefined;
        if (resumeOnInteractionAttached) return;
        resumeOnInteractionAttached = true;
        const resume = () => {
          if (shouldPlayMusic) {
            if (!roundMusicEl) return;
            const p = roundMusicEl.play();
            if (p && typeof p.then === 'function') {
              p.then(() => {
                if (playbackStartedAtMs === undefined) {
                  playbackStartedAtMs = performance.now();
                }
              }).catch(() => {
                playbackStartedAtMs = undefined;
              });
            }
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

  function pauseRoundMusic(reset = false) {
    if (!roundMusicEl) return;
    if (!reset) freezeGlobalOffset();
    roundMusicEl.pause();
    if (reset) {
      roundMusicEl.currentTime = 0;
      playbackOffsetSeconds = 0;
      playbackStartedAtMs = undefined;
      trackDurationSeconds = 0;
      needsSeekOnCanPlay = false;
    }
  }

  function handleRoundMusicLoadedMetadata() {
    if (!roundMusicEl) return;
    const duration = roundMusicEl.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    trackDurationSeconds = duration;
    if (needsSeekOnCanPlay) {
      applyOffsetToCurrentTrack();
      needsSeekOnCanPlay = false;
    }

    if (shouldPlayMusic) {
      tryPlayRoundMusic();
    }
  }

  $effect(() => {
    if (shouldPlayMusic) {
      tryPlayRoundMusic();
      return;
    }
    pauseRoundMusic();
  });

  $effect(() => {
    if (!roundMusicEl) return;
    roundMusicEl.volume = $personalSettings.soundVolume;
  });

  $effect(() => {
    const src = currentRoundMusicSrc;
    if (!roundMusicEl) return;
    if (lastAppliedMusicSrc === src) return;

    freezeGlobalOffset();
    needsSeekOnCanPlay = true;
    lastAppliedMusicSrc = src;
    roundMusicEl.src = src;
    roundMusicEl.load();
  });

  onMount(() => {
    console.log('[Game.svelte] mounted, adding END_ROUND + START_ROUND listeners');

    const handleServerEndRound = () => {
      console.log('[Game.svelte] END_ROUND received, calling endCurrentRound');
      endCurrentRound();
    };

    const handleServerStartRound = (action: StartRoundAction) => {
      console.log('[Game.svelte] START_ROUND received, timeout:', action.payload.timeout);
      // First START_ROUND implicitly ends any intro that was still on screen.
      introPlaying.set(false);
      startNextRound(action.payload.timeout);
    };

    const handleIntroStart = () => {
      console.log('[Game.svelte] INTRO_START received');
      introPlaying.set(true);
    };

    const handleIntroEnd = () => {
      console.log('[Game.svelte] INTRO_END received');
      introPlaying.set(false);
    };

    const removeEndRoundListener = ClientWebsocket.addActionListener(
      ActionEnum.END_ROUND,
      handleServerEndRound,
    );

    const removeStartRoundListener = ClientWebsocket.addActionListener(
      ActionEnum.START_ROUND,
      handleServerStartRound,
    );

    const removeIntroStartListener = ClientWebsocket.addActionListener(
      ActionEnum.INTRO_START,
      handleIntroStart,
    );

    const removeIntroEndListener = ClientWebsocket.addActionListener(
      ActionEnum.INTRO_END,
      handleIntroEnd,
    );

    return () => {
      console.log('[Game.svelte] unmounting, removing END_ROUND + START_ROUND listeners');
      removeEndRoundListener();
      removeStartRoundListener();
      removeIntroStartListener();
      removeIntroEndListener();
      pauseRoundMusic(true);
      introPlaying.set(false);
    };
  });
</script>

<div class="game-viewport overflow-hidden relative">
  <audio
    bind:this={roundMusicEl}
    loop
    preload="auto"
    aria-hidden="true"
    onloadedmetadata={handleRoundMusicLoadedMetadata}
  ></audio>
  {#if $introPlaying}
    <Intro />
  {/if}
  {#if $roundStore}
    <div class="paper-card game-card">
      <h1 class="text-pen-red">{$roundStore.current.roundName}</h1>

      {#if $roundStore.ongoing}
        <h3 class="text-pen-blue">{$roundStore.current.description}</h3>

        <div class="round-content">
          <svelte:component
            this={ROUND_TYPE_COMPONENT_DICT[$roundStore.current.roundType]}
            on:end={() => endCurrentRound()}
          />
        </div>
      {:else}
        <p>Great job! Wait for everyone else to finish :D</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .game-viewport {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
  }
  .game-card {
    pointer-events: auto;
    width: 100%;
    max-width: 35rem;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: rotate(-1deg);
  }

  h1,
  h3 {
    margin: 0.15rem;
  }
  .round-content {
    margin-top: 0.15rem;
    width: 100%;
  }
</style>
