/**
 * Defines how the background image and drawing canvas are layered
 *
 * BehindLayer: Previous image shows beneath the drawing layer as reference (with overlay canvas)
 * FrontLayer: Previous image shows on top after drawing is complete, useful for text over image
 */
export enum LayerMode {
  BehindLayer = 'BehindLayer',
  FrontLayer = 'FrontLayer',
}
