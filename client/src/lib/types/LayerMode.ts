/**
 * Defines how the background image and drawing canvas are layered
 *
 * BehindLayer: Previous image shows on top of the drawing layer (overlay). Drawing happens behind the previous image.
 * FrontLayer: Previous image shows beneath the drawing layer (background). Drawing happens on top of the previous image.
 */
export enum LayerMode {
  BehindLayer = 'BehindLayer',
  FrontLayer = 'FrontLayer',
}
