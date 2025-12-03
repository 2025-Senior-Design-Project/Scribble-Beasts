/**
 * Defines how the background image and drawing canvas are layered
 * 
 * SameLayer: Previous image is loaded as base, drawing happens on same layer
 * BehindLayer: Previous image shows beneath the drawing layer as reference (with overlay canvas)
 * FrontLayer: Previous image shows on top after drawing is complete, useful for text over image
 */
export enum LayerMode {
  SameLayer = 'SameLayer',
  BehindLayer = 'BehindLayer',
  FrontLayer = 'FrontLayer',
}
