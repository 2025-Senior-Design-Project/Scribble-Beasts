<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Actions } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { isHost } from '../GameState';
  import { roomSettings } from '../stores/roomSettingsStore';
  import { introPlaying } from '../stores/introStore';
  import { personalSettings } from '../stores/personalSettingsStore';

  let videoEl: HTMLVideoElement | undefined = $state();
  let trackEl: HTMLTrackElement | undefined = $state();
  let captionsUrl: string | undefined = $state(undefined);

  // Browsers don't parse SRT natively — convert to WebVTT on the fly and
  // attach as a Blob URL. Keeping one source file (.srt) on disk.
  function srtToVtt(srt: string): string {
    const body = srt
      .replace(/\r+/g, '')
      // timestamps: 00:00:01,520 --> 00:00:02,960
      .replace(/(\d\d:\d\d:\d\d),(\d{3})/g, '$1.$2');
    return 'WEBVTT\n\n' + body.trim() + '\n';
  }

  onMount(async () => {
    try {
      const res = await fetch('/files/sb-intro.mp4.srt');
      if (!res.ok) return;
      const srt = await res.text();
      const vtt = srtToVtt(srt);
      const blob = new Blob([vtt], { type: 'text/vtt' });
      captionsUrl = URL.createObjectURL(blob);
    } catch (e) {
      console.warn('[Intro] failed to load captions', e);
    }
  });

  onDestroy(() => {
    if (captionsUrl) URL.revokeObjectURL(captionsUrl);
  });

  // Dynamically added <track> elements often default to mode="disabled" — force
  // them on. Also retry on the track's `load` event since the textTrack object
  // may not exist yet at the moment captionsUrl flips.
  $effect(() => {
    if (!videoEl || !trackEl || !captionsUrl) return;
    if (!$roomSettings.captions) return;

    const showAll = () => {
      for (const tt of Array.from(videoEl!.textTracks)) {
        tt.mode = 'showing';
      }
    };
    showAll();
    trackEl.addEventListener('load', showAll);
    return () => trackEl?.removeEventListener('load', showAll);
  });

  // Sound rules:
  //  - 'separate': every client plays audio
  //  - 'shared':   only the host plays audio (in-person play, host's speakers)
  //  - 'none':     no audio
  let muted = $derived.by(() => {
    const mode = $roomSettings.soundMode;
    if (mode === 'none') return true;
    if (mode === 'shared') return !$isHost;
    return false;
  });

  $effect(() => {
    if (!videoEl) return;
    videoEl.volume = $personalSettings.soundVolume;
  });

  let endSent = false;
  function sendEnd() {
    if (endSent) return;
    endSent = true;
    // Only the host informs the server — the server will broadcast IntroEnd
    // back to everyone, which closes the overlay on all clients.
    if ($isHost) {
      ClientWebsocket.sendAction(new Actions.IntroEnd());
    }
  }

  function completeIntro() {
    sendEnd();
    introPlaying.set(false);
  }

  function handleSkip() {
    try {
      videoEl?.pause();
    } catch {}
    // Hide our own overlay immediately for snappy host UX. Other players
    // will hide when the server broadcasts IntroEnd.
    completeIntro();
  }

  function handleEnded() {
    completeIntro();
  }

  function handleTimeUpdate() {
    if (!videoEl) return;
    const { currentTime, duration } = videoEl;
    if (!Number.isFinite(duration) || duration <= 0) return;
    // Some browsers occasionally skip `ended` on streamed/seeked media.
    // Treat the final 100ms as completion to avoid stalling round start.
    if (currentTime >= duration - 0.1) {
      completeIntro();
    }
  }
</script>

<div class="intro-overlay">
  <video
    bind:this={videoEl}
    class="intro-video"
    src="/files/sb-intro.mp4"
    autoplay
    playsinline
    {muted}
    ontimeupdate={handleTimeUpdate}
    onended={handleEnded}
  >
    {#if $roomSettings.captions && captionsUrl}
      <track
        bind:this={trackEl}
        kind="subtitles"
        label="English"
        srclang="en"
        src={captionsUrl}
        default
      />
    {:else}
      <track kind="captions" />
    {/if}
  </video>

  {#if $isHost}
    <button class="skip-btn" type="button" onclick={handleSkip}>
      Skip Intro ▶▶
    </button>
  {/if}
</div>

<style>
  .intro-overlay {
    position: fixed;
    inset: 0;
    background: black;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .intro-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: black;
  }

  .skip-btn {
    position: absolute;
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 0.6rem 1.1rem;
    font-size: var(--text-md, 1rem);
    font-family: inherit;
    color: white;
    background: rgba(0, 0, 0, 0.55);
    border: 2px solid white;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    z-index: 1;
  }

  .skip-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .skip-btn:active {
    transform: scale(0.97);
  }
</style>
