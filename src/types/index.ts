export interface FileData {
  file: File;
  name: string;
  preview: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zoom?: number;
  transform?: {
    scale: number;
    rotation: number;
    position: { x: number; y: number };
  };
}

export interface ProcessedImage {
  dataUrl: string;
  name: string;
  leftPhoto: string;
  rightPhoto: string;
  displayName?: string;
  textOptions?: TextOptions;
  transform?: {
    left?: Transform;
    right?: Transform;
  };
}

export interface Transform {
  scale: number;
  rotation: number;
  position: { x: number; y: number };
}

export interface TextOptions {
  enabled: boolean;
  text: string;
  font: string;
  size: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
  bold: boolean;
  italic: boolean;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
}
