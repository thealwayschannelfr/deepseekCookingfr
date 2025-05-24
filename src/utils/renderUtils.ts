import { TextOptions } from './types';

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

export const renderCombinedImage = (
  ctx: CanvasRenderingContext2D,
  leftImg: HTMLImageElement,
  rightImg: HTMLImageElement,
  leftTransform: any = { scale: 1, rotation: 0, position: { x: 0, y: 0 } },
  rightTransform: any = { scale: 1, rotation: 0, position: { x: 0, y: 0 } },
  textOptions?: TextOptions,
  scale: number = 1
) => {
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;

  // Clear canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Universal image drawing with perfect aspect ratio preservation
  const drawImage = (img: HTMLImageElement, xOffset: number, transform: any) => {
    ctx.save();
    
    const imgRatio = img.width / img.height;
    const containerRatio = (width / 2) / height;
    
    let drawWidth, drawHeight;
    
    if (imgRatio > containerRatio) {
      // Image is wider than container - scale to width
      drawWidth = width / 2;
      drawHeight = drawWidth / imgRatio;
    } else {
      // Image is taller than container - scale to height
      drawHeight = height;
      drawWidth = drawHeight * imgRatio;
    }

    // Center position
    const centerX = (xOffset * width) + (width / 4);
    const centerY = height / 2;
    
    // Apply transforms
    ctx.translate(centerX, centerY);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(transform.position.x, transform.position.y);
    
    // Draw image centered
    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    
    ctx.restore();
  };

  // Draw images
  drawImage(leftImg, 0, leftTransform);
  drawImage(rightImg, 0.5, rightTransform);

  // Draw text
  if (textOptions?.enabled && textOptions?.text) {
    const fontSize = (textOptions.size || 36) * scale;
    ctx.font = `${textOptions.bold ? 'bold ' : ''}${
      textOptions.italic ? 'italic ' : ''
    }${fontSize}px ${textOptions.font}`;
    ctx.fillStyle = textOptions.color || '#000000';
    
    const text = textOptions.text;
    const metrics = ctx.measureText(text);
    
    let x = 20 * scale;
    let y = (fontSize + 20) * scale;
    
    switch(textOptions.position) {
      case 'top-right':
        x = width - metrics.width - 20 * scale;
        break;
      case 'bottom-left':
        y = height - 20 * scale;
        break;
      case 'bottom-right':
        x = width - metrics.width - 20 * scale;
        y = height - 20 * scale;
        break;
    }
    
    if (textOptions.stroke) {
      ctx.strokeStyle = textOptions.strokeColor || '#FFFFFF';
      ctx.lineWidth = (textOptions.strokeWidth || 2) * scale;
      ctx.strokeText(text, x, y);
    }
    
    ctx.fillText(text, x, y);
  }
};
