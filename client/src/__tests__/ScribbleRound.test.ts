import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ScribbleRound from '../lib/components/rounds/ScribbleRound.svelte';
import { drawingImage } from '../lib/GameState';
import { roundStore } from '../lib/stores/roundStore';

// Mock ClientWebsocket
vi.mock('../lib/ClientWebsocket', () => ({
  default: {
    sendAction: vi.fn(),
    addActionListener: vi.fn(() => vi.fn()),
    removeActionListener: vi.fn(),
  },
}));

// Mock Round Store
vi.mock('../lib/stores/roundStore', async () => {
  const actual = await vi.importActual('../lib/stores/roundStore');
  return {
    ...actual,
    endCurrentRound: vi.fn(),
  };
});

describe('TC-06: Scribble Round Input', () => {
  let moveTo: ReturnType<typeof vi.fn>;
  let lineTo: ReturnType<typeof vi.fn>;
  let stroke: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset stores
    drawingImage.set('');
    roundStore.update((s) => ({ ...s, timeLeft: 100 }));

    moveTo = vi.fn();
    lineTo = vi.fn();
    stroke = vi.fn();

    // Mock Canvas getContext
    HTMLCanvasElement.prototype.getContext = vi.fn((contextId) => {
      if (contextId === '2d') {
        return {
          beginPath: vi.fn(),
          moveTo,
          lineTo,
          stroke,
          clearRect: vi.fn(),
          drawImage: vi.fn(),
          getImageData: vi.fn(),
          putImageData: vi.fn(),
          set strokeStyle(val: any) {},
          set lineWidth(val: any) {},
          set lineJoin(val: any) {},
          set lineCap(val: any) {},
          set font(val: any) {},
          set fillStyle(val: any) {},
          set textAlign(val: any) {},
          set textBaseline(val: any) {},
          canvas: {
            getBoundingClientRect: () => ({
              left: 0,
              top: 0,
              width: 520,
              height: 520,
            }),
          },
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any;

    // Mock toDataURL
    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => 'data:image/png;base64,fakeimage',
    );
  });

  it('captures drawing input during Scribble round', async () => {
    const { container } = render(ScribbleRound);

    const canvas = container.querySelector(
      '.drawing-canvas',
    ) as HTMLCanvasElement;
    expect(canvas).toBeTruthy();

    // Simulate drawing: Mouse Down -> Move -> Up
    await fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10, button: 0 });
    await fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    await fireEvent.mouseUp(canvas, { button: 0 });

    // Verify that canvas context methods were called, indicating drawing occurred
    expect(moveTo).toHaveBeenCalled();
    expect(lineTo).toHaveBeenCalled();
    expect(stroke).toHaveBeenCalled();
  });
});
