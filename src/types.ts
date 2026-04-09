export interface MermaidError {
  message: string;
  hash: {
    text: string;
    loc: {
      first_line: number;
      last_line: number;
      first_col: number;
      last_col: number;
    };
    id?: string;
  };
  str?: string;
  type?: string;
}

export interface RenderResult {
  svg: string;
  bindFunctions?: (element: Element) => void;
}

export interface PreviewState {
  height: number;
  isResizing: boolean;
  startY: number;
  startHeight: number;
}

export interface ExportOptions {
  scale: number;
  backgroundColor: string;
  format: 'png' | 'svg';
}

export const EXPORT_DPI = 300;
export const DEFAULT_PREVIEW_HEIGHT = 200;
export const MIN_PREVIEW_HEIGHT = 100;
export const MAX_PREVIEW_HEIGHT = 800;

// Zoom constants
export const DEFAULT_ZOOM = 100;
export const MIN_ZOOM = 25;
export const MAX_ZOOM = 400;
export const ZOOM_STEP = 25;
