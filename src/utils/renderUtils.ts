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
  // Set canvas dimensions
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;

  // Clear canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Draw left image
  ctx.save();
  const leftCenterX = (width / 4);
  const leftCenterY = (height / 2);
  ctx.translate(leftCenterX, leftCenterY);
  ctx.rotate((leftTransform.rotation * Math.PI) / 180);
  ctx.scale(leftTransform.scale, leftTransform.scale);
  ctx.translate(leftTransform.position.x, leftTransform.position.y);
  
  const leftImgRatio = leftImg.width / leftImg.height;
  const leftDrawWidth = leftImgRatio > (BASE_WIDTH/2)/BASE_HEIGHT 
    ? height * leftImgRatio / 2 
    : width / 2;
  const leftDrawHeight = leftImgRatio > (BASE_WIDTH/2)/BASE_HEIGHT 
    ? height 
    : width / 2 / leftImgRatio;
  
  ctx.drawImage(
    leftImg,
    -leftDrawWidth / 2,
    -leftDrawHeight / 2,
    leftDrawWidth,
    leftDrawHeight
  );
  ctx.restore();

  // Draw right image
  ctx.save();
  const rightCenterX = (width * 3/4);
  const rightCenterY = (height / 2);
  ctx.translate(rightCenterX, rightCenterY);
  ctx.rotate((rightTransform.rotation * Math.PI) / 180);
  ctx.scale(rightTransform.scale, rightTransform.scale);
  ctx.translate(rightTransform.position.x, rightTransform.position.y);
  
  const rightImgRatio = rightImg.width / rightImg.height;
  const rightDrawWidth = rightImgRatio > (BASE_WIDTH/2)/BASE_HEIGHT 
    ? height * rightImgRatio / 2 
    : width / 2;
  const rightDrawHeight = rightImgRatio > (BASE_WIDTH/2)/BASE_HEIGHT 
    ? height 
    : width / 2 / rightImgRatio;
  
  ctx.drawImage(
    rightImg,
    -rightDrawWidth / 2,
    -rightDrawHeight / 2,
    rightDrawWidth,
    rightDrawHeight
  );
  ctx.restore();

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
