// src/utils/renderUtils.ts
import { TextOptions } from './types';

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

export const drawImageWithTransform = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  width: number,
  height: number,
  transform?: { scale: number; rotation: number; position: { x: number; y: number } }
) => {
  ctx.save();
  const centerX = x + width / 2;
  const centerY = height / 2;
  
  ctx.translate(centerX, centerY);
  if (transform) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(transform.position.x, transform.position.y);
  }
  ctx.translate(-width / 2, -height / 2);

  const imgRatio = img.width / img.height;
  const targetRatio = width / height;
  
  let drawWidth = width;
  let drawHeight = height;
  
  if (imgRatio > targetRatio) {
    drawWidth = height * imgRatio;
    drawHeight = height;
  } else {
    drawWidth = width;
    drawHeight = width / imgRatio;
  }

  const drawX = x + (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
};

export const renderTextOnCanvas = (
  ctx: CanvasRenderingContext2D,
  textOptions: TextOptions,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = 1
) => {
  if (textOptions?.enabled && textOptions?.text) {
    const fontSize = (textOptions.size || 36) * scale;
    ctx.font = `${textOptions.bold ? 'bold ' : ''}${
      textOptions.italic ? 'italic ' : ''
    }${fontSize}px ${textOptions.font}`;
    
    const text = textOptions.text;
    const metrics = ctx.measureText(text);
    
    let x = 20 * scale;
    let y = (fontSize + 20) * scale;
    
    switch (textOptions.position) {
      case 'top-right':
        x = canvasWidth - metrics.width - 20 * scale;
        break;
      case 'bottom-left':
        y = canvasHeight - 20 * scale;
        break;
      case 'bottom-right':
        x = canvasWidth - metrics.width - 20 * scale;
        y = canvasHeight - 20 * scale;
        break;
    }
    
    if (textOptions.stroke) {
      ctx.strokeStyle = textOptions.strokeColor || '#FFFFFF';
      ctx.lineWidth = (textOptions.strokeWidth || 2) * scale;
      ctx.strokeText(text, x, y);
    }
    
    ctx.fillStyle = textOptions.color || '#000000';
    ctx.fillText(text, x, y);
  }
};

// Additional export for the combined renderer
export const renderCombinedPreview = (
  ctx: CanvasRenderingContext2D,
  leftImg: HTMLImageElement,
  rightImg: HTMLImageElement,
  leftTransform?: any,
  rightTransform?: any,
  textOptions?: TextOptions,
  scale: number = 1
) => {
  const canvasWidth = BASE_WIDTH * scale;
  const canvasHeight = BASE_HEIGHT * scale;

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw left image
  drawImageWithTransform(
    ctx,
    leftImg,
    0,
    canvasWidth / 2,
    canvasHeight,
    leftTransform
  );

  // Draw right image
  drawImageWithTransform(
    ctx,
    rightImg,
    canvasWidth / 2,
    canvasWidth / 2,
    canvasHeight,
    rightTransform
  );

  // Draw text
  renderTextOnCanvas(
    ctx,
    textOptions,
    canvasWidth,
    canvasHeight,
    scale
  );
};
