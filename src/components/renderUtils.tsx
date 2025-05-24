// src/utils/renderUtils.ts

export const drawImageWithTransform = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  width: number,
  height: number,
  transform?: { scale: number; rotation: number; position: { x: number; y: number } }
) => {
  ctx.save();
  
  // Center point for transformations
  const centerX = x + width / 2;
  const centerY = height / 2;
  
  // Apply transformations
  ctx.translate(centerX, centerY);
  if (transform) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(transform.position.x, transform.position.y);
  }
  ctx.translate(-width / 2, -height / 2);

  // Calculate scaling to match large preview logic
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

  // Center the image
  const drawX = x + (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
};

export const renderTextOnCanvas = (
  ctx: CanvasRenderingContext2D,
  textOptions: TextOptions,
  canvas: HTMLCanvasElement
) => {
  if (textOptions?.enabled && textOptions?.text) {
    const fontStyle = [];
    if (textOptions.bold) fontStyle.push('bold');
    if (textOptions.italic) fontStyle.push('italic');
    
    ctx.font = `${fontStyle.join(' ')} ${textOptions.size}px ${textOptions.font}`;
    ctx.fillStyle = textOptions.color || '#000000';
    
    const text = textOptions.text;
    const metrics = ctx.measureText(text);
    const textHeight = textOptions.size;
    
    let textX = 0;
    let textY = 0;
    
    switch (textOptions.position) {
      case 'top-left':
        textX = 20;
        textY = textHeight + 20;
        break;
      case 'top-right':
        textX = canvas.width - metrics.width - 20;
        textY = textHeight + 20;
        break;
      case 'bottom-left':
        textX = 20;
        textY = canvas.height - 20;
        break;
      case 'bottom-right':
        textX = canvas.width - metrics.width - 20;
        textY = canvas.height - 20;
        break;
    }
    
    if (textOptions.stroke) {
      ctx.strokeStyle = textOptions.strokeColor || '#FFFFFF';
      ctx.lineWidth = textOptions.strokeWidth || 2;
      ctx.strokeText(text, textX, textY);
    }
    
    ctx.fillText(text, textX, textY);
  }
};
