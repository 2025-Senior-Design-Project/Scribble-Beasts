<script lang="ts">
  import { onMount } from 'svelte';
  import { currentDrawingImage } from '../../GameState';
  import { SendDrawingAction, ActionEnum } from '@shared/actions';
  import ClientWebsocket from '../../ClientWebsocket';
  import { roundStore, endCurrentRound } from '../../stores/roundStore';
  import { LayerMode } from '../../types/LayerMode';
  import Round from '../Round.svelte';

  let {
    lineType = 'line',
    showWidget = false,
    layerMode = LayerMode.SameLayer,
  }: {
    lineType?: 'scribble' | 'line' | 'color' | 'detail' | 'name';
    showWidget?: boolean;
    layerMode?: LayerMode;
  } = $props();

  let canvas = $state<HTMLCanvasElement>();
  let overlayCanvas = $state<HTMLCanvasElement>();
  let backgroundCanvas = $state<HTMLCanvasElement>();
  let context = $state<CanvasRenderingContext2D | null>(null);
  let shouldDraw = $state(false);
  let timer = $state(0);
  let randTimerMod = $state(5);
  let selectedColor = $state('#db2828');
  let randomFont = $state<{ name: string; size: number } | null>(null);

  const COLORS = [
    { color: 'red', value: '#db2828' },
    { color: 'orange', value: '#f2711c' },
    { color: 'yellow', value: '#fbbd08' },
    { color: 'olive', value: '#b5cc18' },
    { color: 'green', value: '#21ba45' },
    { color: 'teal', value: '#00b5ad' },
    { color: 'blue', value: '#2185d0' },
    { color: 'violet', value: '#6435c9' },
    { color: 'purple', value: '#a333c8' },
    { color: 'pink', value: '#e03997' },
  ];

  const FONTS = [
    { name: 'AckiPreschool', size: 30 },
    { name: 'BrownBagLunch', size: 30 },
    { name: 'Children', size: 30 },
    { name: 'DadHand', size: 30 },
    { name: 'Daniel', size: 30 },
    { name: 'OhMaria', size: 30 },
    { name: 'PopcornMountain', size: 30 },
    { name: 'SchoolTeacher', size: 30 },
    { name: 'SierraNevadaRoad', size: 30 },
    { name: 'TheDogAteMyHomework', size: 30 },
    { name: 'ThinPencilHandwriting', size: 30 },
    { name: 'WCManoNegraBta', size: 30 },
    { name: 'Yahfie', size: 30 },
  ];

  function prepareContext() {
    if (!canvas) return;
    
    // Set canvas to fixed 520x520 for consistent sizing across devices
    canvas.width = 520;
    canvas.height = 520;

    context = canvas.getContext('2d');

    // Set up overlay canvas based on layer mode
    if (layerMode === LayerMode.BehindLayer && overlayCanvas) {
      overlayCanvas.width = 520;
      overlayCanvas.height = 520;
      
      // Load and draw the overlay image immediately
      if ($currentDrawingImage) {
        const overlayCtx = overlayCanvas.getContext('2d');
        const overlayImage = new Image();
        overlayImage.onload = () => {
          overlayCtx?.drawImage(overlayImage, 0, 0, 520, 520);
        };
        overlayImage.src = $currentDrawingImage;
      }
    } else if (layerMode === LayerMode.FrontLayer && backgroundCanvas) {
      // In FrontLayer mode, store the background image separately
      backgroundCanvas.width = 520;
      backgroundCanvas.height = 520;
      
      if ($currentDrawingImage) {
        const bgCtx = backgroundCanvas.getContext('2d');
        const bgImage = new Image();
        bgImage.onload = () => {
          bgCtx?.drawImage(bgImage, 0, 0, 520, 520);
        };
        bgImage.src = $currentDrawingImage;
      }
    } else if (layerMode === LayerMode.SameLayer) {
      // For SameLayer, draw the previous image as the base
      if ($currentDrawingImage) {
        const image = new Image();
        image.onload = () => {
          context?.drawImage(image, 0, 0, 520, 520);
        };
        image.src = $currentDrawingImage;
      }
    }

    setLineProperties();
  }

  function setLineProperties() {
    if (!context) return;

    switch (lineType) {
      case 'name':
        randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];
        context.font = `${randomFont.size}px ${randomFont.name}`;
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        break;
      case 'color':
        context.strokeStyle = selectedColor;
        context.lineWidth = 15;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        break;
      case 'scribble':
        context.strokeStyle = 'rgb(0 0 0 / .02)';
        context.lineWidth = 3;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        break;
      case 'detail':
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        break;
      case 'line':
      default:
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        break;
    }
  }

  function getScaleFactor(): number {
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return 520 / rect.width;
  }

  function handleMouseDown(event: MouseEvent) {
    if (lineType === 'name' || event.button !== 0) return;
    if (!context || !canvas) return;

    shouldDraw = true;
    setLineProperties();

    context.beginPath();
    const rect = canvas.getBoundingClientRect();
    const scale = getScaleFactor();
    context.moveTo(
      (event.clientX - rect.left) * scale,
      (event.clientY - rect.top) * scale
    );
  }

  function handleMouseUp(event: MouseEvent) {
    if (event.button === 0) {
      shouldDraw = false;
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (!shouldDraw || !context || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = getScaleFactor();
    const x = (event.clientX - rect.left) * scale;
    const y = (event.clientY - rect.top) * scale;

    context.lineTo(x, y);
    context.stroke();

    if (lineType === 'scribble') {
      scribbleStutter(x, y);
    }
  }

  function handleTouchStart(event: TouchEvent) {
    if (lineType === 'name') return;
    if (!context || !canvas) return;

    event.preventDefault();
    shouldDraw = true;
    setLineProperties();

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scale = getScaleFactor();
    context.beginPath();
    context.moveTo(
      (touch.clientX - rect.left) * scale,
      (touch.clientY - rect.top) * scale
    );
  }

  function handleTouchMove(event: TouchEvent) {
    if (!shouldDraw || !context || !canvas) return;

    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scale = getScaleFactor();
    const x = (touch.clientX - rect.left) * scale;
    const y = (touch.clientY - rect.top) * scale;

    context.lineTo(x, y);
    context.stroke();

    if (lineType === 'scribble') {
      scribbleStutter(x, y);
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    event.preventDefault();
    shouldDraw = false;
  }

  function scribbleStutter(x: number, y: number) {
    if (!context) return;

    timer++;

    if (timer % randTimerMod === 0) {
      randTimerMod = Math.floor(Math.random() * 4) + 1;
      context.strokeStyle = `rgb(0 0 0 / ${Math.random() * 0.04 + 0.01})`;
      context.beginPath();
      context.moveTo(x, y);
      setTimeout(() => (shouldDraw = true), 0);
    }
  }

  function handleTextInput(event: Event) {
    if (!context || !canvas || !randomFont) return;

    const input = event.target as HTMLInputElement;
    const text = input.value;

    // For FrontLayer mode, restore the background before writing new text
    if (layerMode === LayerMode.FrontLayer && backgroundCanvas) {
      const bgCtx = backgroundCanvas.getContext('2d');
      if (bgCtx) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw background onto the main canvas before text
        const imageData = bgCtx.getImageData(0, 0, 520, 520);
        context.putImageData(imageData, 0, 0);
      }
    } else {
      // For other modes, just clear normally
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    const xPosition = canvas.width / 2;
    const yPosition = canvas.height - randomFont.size;
    context.fillText(text, xPosition, yPosition);
  }

  function handleColorChange(color: string) {
    selectedColor = color;
    setLineProperties();
  }

  async function handleRoundEnd() {
    if (!canvas || !context) return;
    
    const canvasRef = canvas; // Capture canvas reference
    
    // If FrontLayer mode, draw the background image on top before sending
    if (layerMode === LayerMode.FrontLayer && backgroundCanvas && $currentDrawingImage) {
      // Return a promise that resolves when the background is composited
      return new Promise<void>((resolve) => {
        const bgImage = new Image();
        bgImage.onload = () => {
          if (!context) {
            resolve();
            return;
          }
          // Draw the background image on top of the text/drawing
          context.drawImage(bgImage, 0, 0, 520, 520);
          const imageData = canvasRef.toDataURL();
          currentDrawingImage.set(imageData);
          ClientWebsocket.sendAction(new SendDrawingAction(imageData));
          resolve();
        };
        bgImage.onerror = () => {
          // If image fails to load, send what we have
          const imageData = canvasRef.toDataURL();
          currentDrawingImage.set(imageData);
          ClientWebsocket.sendAction(new SendDrawingAction(imageData));
          resolve();
        };
        bgImage.src = $currentDrawingImage;
      });
    } else if (layerMode === LayerMode.BehindLayer && $currentDrawingImage) {
      // For BehindLayer, draw the stored image on top before sending
      return new Promise<void>((resolve) => {
        const overlayImage = new Image();
        overlayImage.onload = () => {
          if (!context) {
            resolve();
            return;
          }
          context.drawImage(overlayImage, 0, 0, 520, 520);
          const imageData = canvasRef.toDataURL();
          currentDrawingImage.set(imageData);
          ClientWebsocket.sendAction(new SendDrawingAction(imageData));
          resolve();
        };
        overlayImage.onerror = () => {
          // If image fails to load, send what we have
          const imageData = canvasRef.toDataURL();
          currentDrawingImage.set(imageData);
          ClientWebsocket.sendAction(new SendDrawingAction(imageData));
          resolve();
        };
        overlayImage.src = $currentDrawingImage;
      });
    } else {
      // For SameLayer mode, just send the canvas as-is
      const imageData = canvasRef.toDataURL();
      currentDrawingImage.set(imageData);
      ClientWebsocket.sendAction(new SendDrawingAction(imageData));
    }
  }

  onMount(() => {
    prepareContext();

    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (!canvas) return;
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  });
</script>

<Round onRoundEnd={handleRoundEnd}>
  <div class="drawing-container">
    <div class="canvas-wrapper">
      <canvas bind:this={canvas} class="drawing-canvas"></canvas>
      {#if layerMode === LayerMode.BehindLayer}
        <canvas bind:this={overlayCanvas} class="overlay-canvas"></canvas>
      {/if}
      {#if layerMode === LayerMode.FrontLayer}
        <canvas bind:this={backgroundCanvas} class="hidden-canvas"></canvas>
      {/if}
    </div>

    {#if showWidget}
      <div class="widget-container">
        {#if lineType === 'color'}
          <div class="color-picker">
            {#each COLORS as colorOption}
              <input
                type="radio"
                id={colorOption.color}
                name="color"
                value={colorOption.value}
                checked={selectedColor === colorOption.value}
                onchange={() => handleColorChange(colorOption.value)}
              />
              <label for={colorOption.color} style="background-color: {colorOption.value}"></label>
            {/each}
          </div>
        {:else if lineType === 'name'}
          <input
            type="text"
            id="scribble-beast-name"
            placeholder="Enter beast name..."
            oninput={handleTextInput}
            class="name-input"
          />
        {/if}
      </div>
    {/if}
  </div>
</Round>

<style>
  .drawing-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  .canvas-wrapper {
    position: relative;
    width: min(520px, 90vw);
    height: min(520px, 90vw);
  }

  .drawing-canvas {
    position: absolute;
    top: 0;
    left: 0;
    border: 2px solid #333;
    border-radius: 8px;
    cursor: crosshair;
    background-color: white;
    touch-action: none;
    /* Fixed internal size of 520x520, but scale visually to fit screen */
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
  }

  .overlay-canvas {
    position: absolute;
    top: 0;
    left: 0;
    border: 2px solid #333;
    border-radius: 8px;
    pointer-events: none;
    /* Fixed internal size of 520x520, but scale visually to fit screen */
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
  }

  .hidden-canvas {
    display: none;
  }

  .widget-container {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .color-picker {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .color-picker input[type='radio'] {
    display: none;
  }

  .color-picker label {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid transparent;
    transition: border-color 0.2s;
  }

  .color-picker input[type='radio']:checked + label {
    border-color: #000;
  }

  .name-input {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 2px solid #333;
    border-radius: 4px;
    width: 200px;
  }
</style>
