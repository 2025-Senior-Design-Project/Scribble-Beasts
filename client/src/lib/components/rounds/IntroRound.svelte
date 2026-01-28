<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { AssetManager } from '../../AssetManager';
  import { Actions } from '@shared/actions';
  import ClientWebsocket from '../../ClientWebsocket';
  import manifest from '../../constants/asset-manifest.json';
  import { playerName, isHost } from '../../GameState';
  import { get } from 'svelte/store';

  export let onEnd: () => void = () => {};

  let canvasContainer: HTMLDivElement;
  let app: any;
  let model: any;

  onMount(async () => {
    const PIXI = (window as any).PIXI;
    if (!PIXI) {
      console.error('PIXI not found on window');
      return;
    }

    const { Application } = PIXI;
    app = new Application({
      resizeTo: window,
      transparent: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      backgroundAlpha: 1, // White background
      backgroundColor: 0xffffff,
    });

    if (canvasContainer) {
      canvasContainer.appendChild(app.view);
    }

    // Load Model
    const modelPath = manifest.models[0];
    if (modelPath) {
      model = AssetManager.getModel(modelPath);

      if (model) {
        app.stage.addChild(model);
        resizeModel();

        // --- ANIMATION LOGIC ---
        // TODO: Trigger your specific motion here
        // model.motion('Idle');

        // TODO: Listen for completion
        // model.internalModel.motionManager.on('motionFinished', () => {
        //   ClientWebsocket.sendAction(new Actions.PlayerDone(get(playerName)));
        // });
      } else {
        console.warn('Model found in manifest but not loaded in AssetManager');
      }
    } else {
      console.warn('No intro model found in manifest');
      // If no intro, just mark done immediately
      ClientWebsocket.sendAction(new Actions.PlayerDone(get(playerName)));
    }

    window.addEventListener('resize', resizeModel);
  });

  function resizeModel() {
    if (!model || !app) return;
    // Scale to fit nicely with some padding
    const scaleX = app.screen.width / model.width;
    const scaleY = app.screen.height / model.height;
    const scale = Math.min(scaleX, scaleY) * 0.8;

    model.scale.set(scale);
    model.anchor.set(0.5);
    model.x = app.screen.width / 2;
    model.y = app.screen.height / 2;
  }

  function skipIntro() {
    ClientWebsocket.sendAction(new Actions.SkipRound());
  }

  onDestroy(() => {
    window.removeEventListener('resize', resizeModel);
    if (app) {
      app.destroy(true, { children: true });
    }
  });
</script>

<div class="intro-overlay" bind:this={canvasContainer}>
  {#if !manifest.models.length}
    <div class="placeholder-msg">
      <h1>Intro Animation</h1>
      <p>(No Live2D assets found in client/public/live2d)</p>
    </div>
  {/if}

  {#if $isHost}
    <button class="skip-btn" on:click={skipIntro}>Skip Intro</button>
  {/if}
</div>

<style>
  .skip-btn {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    z-index: 10000;
    padding: 0.8rem 1.5rem;
    font-size: 1.2rem;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: 2px solid white;
    border-radius: 8px;
    cursor: pointer;
  }
  .skip-btn:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .intro-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .placeholder-msg {
    text-align: center;
    color: #666;
  }
</style>
