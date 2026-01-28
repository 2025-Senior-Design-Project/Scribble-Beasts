import { Live2DModel } from 'pixi-live2d-display';
import * as PIXI from 'pixi.js';
import manifest from './constants/asset-manifest.json';

// Expose PIXI to window for pixi-live2d-display to use
(window as any).PIXI = PIXI;

Live2DModel.registerTicker(PIXI.Ticker);

export class AssetManager {
  private static models: Map<string, Live2DModel> = new Map();
  private static loaded = false;

  static async preload() {
    if (this.loaded) return;

    console.log('Starting asset preload...', manifest.models);

    const promises = manifest.models.map(async (modelPath: string) => {
      try {
        // modelPath is relative to client/public, e.g., "live2d/haru/haru.model3.json"
        // We can load it directly via fetch
        const model = await Live2DModel.from(modelPath);
        this.models.set(modelPath, model);
        console.log(`Loaded model: ${modelPath}`);
      } catch (e) {
        console.error(`Failed to load model: ${modelPath}`, e);
      }
    });

    await Promise.all(promises);
    this.loaded = true;
    console.log('Asset preload complete.');
  }

  static getModel(path: string): Live2DModel | undefined {
    return this.models.get(path);
  }
}
