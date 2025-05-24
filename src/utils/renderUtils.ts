import { TextOptions } from './types';

const BASE_SIZE = { width: 1920, height: 1080 };

export const renderUniversalPreview = (
  ctx: CanvasRenderingContext2D,
  leftImg: HTMLImageElement,
  rightImg: HTMLImageElement,
  leftTransform: any,
  rightTransform: any,
  textOptions?: TextOptions,
  scale: number = 1
) => {
  // Clear canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, BASE_SIZE.width * scale, BASE_SIZE.height * scale);

  // Universal image drawing function
  const drawImage = (img: HTMLImageElement, xOffset: number, transform: any) => {
    ctx.save();
    
    // Base positions
    const centerX = (BASE_SIZE.width * (xOffset + 0.25)) * scale;
    const centerY = (BASE_SIZE.height / 2) * scale;
    
    // Apply transforms
    ctx.translate(centerX, centerY);
    ctx.rotate((transform?.rotation || 0) * Math.PI / 180);
    ctx.scale(transform?.scale || 1, transform?.scale || 1);
    ctx.translate(transform?.position?.x || 0, transform?.position?.y || 0);
    
    // Calculate dimensions
    const imgRatio = img.width / img.height;
    const targetRatio = 0.5 * BASE_SIZE.width / BASE_SIZE.height; // Half-width ratio
    
    let drawWidth, drawHeight;
    if (imgRatio > targetRatio) {
      drawHeight = BASE_SIZE.height * scale;
      drawWidth = drawHeight * imgRatio;
    } else {
      drawWidth = BASE_SIZE.width * 0.5 * scale;
      drawHeight = drawWidth / imgRatio;
    }

    // Draw image
    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    
    ctx.restore();
  };

  // Draw both images
  drawImage(leftImg, 0, leftTransform);
  drawImage(rightImg, 0.5, rightTransform);

  // Draw text
  if (textOptions?.enabled && textOptions?.text) {
    const effectiveScale = scale;
    ctx.font = `${textOptions.bold ? 'bold ' : ''}${textOptions.italic ? 'italic ' : ''}${(textOptions.size || 36) * effectiveScale}px ${textOptions.font}`;
    ctx.fillStyle = textOptions.color || '#000000';
    
    const text = textOptions.text;
    const metrics = ctx.measureText(text);
    
    let x = 20 * effectiveScale;
    let y = (textOptions.size || 36 + 20) * effectiveScale;
    
    switch(textOptions.position) {
      case 'top-right':
        x = BASE_SIZE.width * effectiveScale - metrics.width - 20 * effectiveScale;
        break;
      case 'bottom-left':
        y = BASE_SIZE.height * effectiveScale - 20 * effectiveScale;
        break;
      case 'bottom-right':
        x = BASE_SIZE.width * effectiveScale - metrics.width - 20 * effectiveScale;
        y = BASE_SIZE.height * effectiveScale - 20 * effectiveScale;
        break;
    }
    
    if (textOptions.stroke) {
      ctx.strokeStyle = textOptions.strokeColor || '#FFFFFF';
      ctx.lineWidth = (textOptions.strokeWidth || 2) * effectiveScale;
      ctx.strokeText(text, x, y);
    }
    
    ctx.fillText(text, x, y);
  }
};
