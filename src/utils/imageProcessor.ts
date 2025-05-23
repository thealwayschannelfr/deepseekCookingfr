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
        const drawImage = (img: HTMLImageElement, x: number, transform?: Transform) => {
          const halfWidth = canvas.width / 2;
          const centerX = x + halfWidth / 2;
          
          ctx.save();
          
          // Move to center point of the half
          ctx.translate(centerX, canvas.height / 2);
          
          // Apply transformations if they exist
          if (transform) {
            ctx.rotate((transform.rotation * Math.PI) / 180);
            ctx.scale(transform.scale, transform.scale);
            ctx.translate(transform.position.x, transform.position.y);
          }
          
          // Move back
          ctx.translate(-centerX, -canvas.height / 2);
          
          // Calculate dimensions maintaining aspect ratio
          const imgRatio = img.width / img.height;
          let drawWidth = halfWidth;
          let drawHeight = canvas.height;
          
          if (imgRatio > halfWidth / canvas.height) {
            drawWidth = drawHeight * imgRatio;
          } else {
            drawHeight = drawWidth / imgRatio;
          }
          
          // Center the image in its half
          const drawX = x + (halfWidth - drawWidth) / 2;
          const drawY = (canvas.height - drawHeight) / 2;
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();
        };

        // Draw left image
        drawImage(leftImg, 0, leftFile.transform);
        
        // Draw right image
        drawImage(rightImg, canvas.width / 2, rightFile.transform);

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
          textOptions,
          transform: {
            left: leftFile.transform,
            right: rightFile.transform
          }
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