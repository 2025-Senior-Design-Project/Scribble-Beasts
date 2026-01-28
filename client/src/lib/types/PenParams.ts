export type PenParams = {
  strokeStyle?: string;
  lineWidth?: number;
  lineJoin?: CanvasLineJoin;
  lineCap?: CanvasLineCap;

  // scribble-specific
  scribble?: boolean;

  // name/text-specific
  font?: {
    name: string;
    size: number;
  };
};
