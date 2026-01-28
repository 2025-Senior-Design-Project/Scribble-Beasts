import { get } from 'svelte/store';
import { isSpeaker } from './GameState';

export class AudioManager {
  private static music: HTMLAudioElement | null = null;

  static playMusic(url: string, loop = true) {
    if (this.music) {
      this.music.pause();
    }

    this.music = new Audio(url);
    this.music.loop = loop;
    this.updateMuteState();

    // Auto-play policy might block this if not triggered by user interaction.
    // Usually games start with a button press which allows audio.
    this.music
      .play()
      .catch((e) => console.warn('Audio play failed (autoplay policy?):', e));
  }

  static stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
  }

  static playSFX(url: string) {
    // SFX plays on everyone's device regardless of speaker role
    const audio = new Audio(url);
    audio.play().catch((e) => console.warn('SFX play failed:', e));
  }

  static updateMuteState() {
    if (!this.music) return;
    const amISpeaker = get(isSpeaker);
    // If I am the speaker, I am NOT muted.
    this.music.muted = !amISpeaker;
    console.log(
      `Audio update: Am I speaker? ${amISpeaker}. Music muted? ${this.music.muted}`,
    );
  }
}

// Reactive update when role changes
isSpeaker.subscribe(() => {
  AudioManager.updateMuteState();
});
