import { TextOptions } from './types';

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

export const renderCombinedImage = (
  ctx: CanvasRenderingContext2D,
  leftImg: HTMLImageElement,
  rightImg: HTMLImageElement,
  leftTransform?: any,
  rightTransform?: any,
  textOptions?: TextOptions,
  scale: number = 1
) => {
  // Clear canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, BASE_WIDTH * scale, BASE_HEIGHT * scale);

  // Draw left image (exact same logic for both previews)
  ctx.save();
  const leftCenterX = (BASE_WIDTH / 4) * scale;
  const leftCenterY = (BASE_HEIGHT / 2) * scale;
  ctx.translate(leftCenterX, leftCenterY);
  if (leftTransform) {
    ctx.rotate((leftTransform.rotation * Math.PI) / 180);
    ctx.scale(leftTransform.scale, leftTransform.scale);
    ctx.translate(leftTransform.position.x, leftTransform.position.y);
  }
  ctx.translate(-(BASE_WIDTH / 4) * scale, -(BASE_HEIGHT / 2) * scale);
  
  const leftImgRatio = leftImg.width / leftImg.height;
  const leftDrawWidth = leftImgRatio > 16/9 ? BASE_HEIGHT * leftImgRatio / 2 : BASE_WIDTH / 2;
  const leftDrawHeight = leftImgRatio > 16/9 ? BASE_HEIGHT : BASE_WIDTH / 2 / leftImgRatio;
  ctx.drawImage(
    leftImg,
    (BASE_WIDTH / 4 - leftDrawWidth / 2) * scale,
    (BASE_HEIGHT / 2 - leftDrawHeight / 2) * scale,
    leftDrawWidth * scale,
    leftDrawHeight * scale
  );
  ctx.restore();

  // Draw right image (exact same logic)
  ctx.save();
  const rightCenterX = (BASE_WIDTH * 3/4) * scale;
  const rightCenterY = (BASE_HEIGHT / 2) * scale;
  ctx.translate(rightCenterX, rightCenterY);
  if (rightTransform) {
    ctx.rotate((rightTransform.rotation * Math.PI) / 180);
    ctx.scale(rightTransform.scale, rightTransform.scale);
    ctx.translate(rightTransform.position.x, rightTransform.position.y);
  }
  ctx.translate(-(BASE_WIDTH / 4) * scale, -(BASE_HEIGHT / 2) * scale);
  
  const rightImgRatio = rightImg.width / rightImg.height;
  const rightDrawWidth = rightImgRatio > 16/9 ? BASE_HEIGHT * rightImgRatio / 2 : BASE_WIDTH / 2;
  const rightDrawHeight = rightImgRatio > 16/9 ? BASE_HEIGHT : BASE_WIDTH / 2 / rightImgRatio;
  ctx.drawImage(
    rightImg,
    (BASE_WIDTH * 3/4 - rightDrawWidth / 2) * scale,
    (BASE_HEIGHT / 2 - rightDrawHeight / 2) * scale,
    rightDrawWidth * scale,
    rightDrawHeight * scale
  );
  ctx.restore();

  // Render text (scaled proportionally)
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
        x = BASE_WIDTH * scale - metrics.width - 20 * scale;
        break;
      case 'bottom-left':
        y = BASE_HEIGHT * scale - 20 * scale;
        break;
      case 'bottom-right':
        x = BASE_WIDTH * scale - metrics.width - 20 * scale;
        y = BASE_HEIGHT * scale - 20 * scale;
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
