export interface PenParams extends Partial<CanvasRenderingContext2D> {
  // scribble-specific
  scribble?: boolean;

  // name/text-specific
  textFont?: {
    name: string;
    size: number;
  };
}
