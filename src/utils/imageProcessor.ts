import { FileData, ProcessedImage, TextOptions } from '../types';
import JSZip from 'jszip';

export const processImages = async (
  babyPhotos: FileData[],
  currentPhotos: FileData[],
  onProgress: (progress: number) => void,
  globalTextOptions: TextOptions
): Promise<ProcessedImage[]> => {
  const results: ProcessedImage[] = [];
  const totalImages = Math.min(babyPhotos.length, currentPhotos.length);
  
  const sortedBabyPhotos = [...babyPhotos].sort((a, b) => a.name.localeCompare(b.name));
  const sortedCurrentPhotos = [...currentPhotos].sort((a, b) => a.name.localeCompare(b.name));
  
  for (let i = 0; i < totalImages; i++) {
    const nameParts = sortedBabyPhotos[i].name.split('_01')[0].split('_');
    const lastName = nameParts[0];
    const firstName = nameParts[1];
    const formattedName = `${firstName} ${lastName}`;
    
    const textOpts = {
      ...globalTextOptions,
      text: globalTextOptions.enabled ? (globalTextOptions.text || formattedName) : formattedName,
      color: globalTextOptions.color || '#000000'
    };
    
    const result = await createCombinedImage(
      sortedBabyPhotos[i],
      sortedCurrentPhotos[i],
      formattedName,
      textOpts
    );
    
    results.push(result);
    onProgress((i + 1) / totalImages * 100);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  return results;
};

const createCombinedImage = async (
  leftFile: FileData,
  rightFile: FileData,
  name: string,
  textOptions?: TextOptions
): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    canvas.width = 1920;
    canvas.height = 1080;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const leftImg = new Image();
    const rightImg = new Image();
    
    let leftLoaded = false;
    let rightLoaded = false;
    
    const checkBothLoaded = () => {
      if (leftLoaded && rightLoaded) {
        const drawImage = (img: HTMLImageElement, file: FileData, x: number) => {
          const targetWidth = canvas.width / 2;
          const targetHeight = canvas.height;
          
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          
          if (file.crop) {
            sourceX = file.crop.x;
            sourceY = file.crop.y;
            sourceWidth = file.crop.width;
            sourceHeight = file.crop.height;
          }
          
          const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
          const scaledWidth = sourceWidth * scale * (file.zoom || 1);
          const scaledHeight = sourceHeight * scale * (file.zoom || 1);
          
          const drawX = x + (targetWidth - scaledWidth) / 2;
          const drawY = (targetHeight - scaledHeight) / 2;
          
          ctx.save();
          ctx.translate(x + targetWidth / 2, targetHeight / 2);
          if (file.transform) {
            ctx.rotate((file.transform.rotation * Math.PI) / 180);
            ctx.scale(file.transform.scale, file.transform.scale);
            ctx.translate(file.transform.position.x, file.transform.position.y);
          }
          ctx.translate(-targetWidth / 2, -targetHeight / 2);
          
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            drawX,
            drawY,
            scaledWidth,
            scaledHeight
          );
          
          ctx.restore();
        };

        drawImage(leftImg, leftFile, 0);
        drawImage(rightImg, rightFile, canvas.width / 2);

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
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        resolve({
          dataUrl,
          name,
          leftPhoto: leftFile.preview,
          rightPhoto: rightFile.preview,
          textOptions
        });
      }
    };
    
    leftImg.onload = () => {
      leftLoaded = true;
      checkBothLoaded();
    };
    
    rightImg.onload = () => {
      rightLoaded = true;
      checkBothLoaded();
    };
    
    leftImg.onerror = () => reject(new Error(`Failed to load left image: ${leftFile.name}`));
    rightImg.onerror = () => reject(new Error(`Failed to load right image: ${rightFile.name}`));
    
    leftImg.src = leftFile.preview;
    rightImg.src = rightFile.preview;
  });
};

export const downloadAsZip = async (images: ProcessedImage[]) => {
  const zip = new JSZip();

  images.forEach((image) => {
    const fileName = `${image.name}_combined.jpg`;
    const data = image.dataUrl.split(',')[1];
    zip.file(fileName, data, { base64: true });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'processed_images.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
