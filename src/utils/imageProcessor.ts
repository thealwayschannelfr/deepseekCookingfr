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
        // Draw the images exactly as they appear in the large preview
        const halfWidth = canvas.width / 2;
        
        // Draw left image
        ctx.save();
        ctx.translate(halfWidth / 2, canvas.height / 2);
        if (leftFile.transform) {
          ctx.rotate((leftFile.transform.rotation * Math.PI) / 180);
          ctx.scale(leftFile.transform.scale, leftFile.transform.scale);
          ctx.translate(leftFile.transform.position.x, leftFile.transform.position.y);
        }
        ctx.translate(-halfWidth / 2, -canvas.height / 2);
        
        const leftRatio = leftImg.width / leftImg.height;
        let leftDrawWidth = halfWidth;
        let leftDrawHeight = canvas.height;
        
        if (leftRatio > halfWidth / canvas.height) {
          leftDrawWidth = leftDrawHeight * leftRatio;
        } else {
          leftDrawHeight = leftDrawWidth / leftRatio;
        }
        
        const leftDrawX = (halfWidth - leftDrawWidth) / 2;
        const leftDrawY = (canvas.height - leftDrawHeight) / 2;
        
        ctx.drawImage(leftImg, leftDrawX, leftDrawY, leftDrawWidth, leftDrawHeight);
        ctx.restore();
        
        // Draw right image
        ctx.save();
        ctx.translate(halfWidth * 1.5, canvas.height / 2);
        if (rightFile.transform) {
          ctx.rotate((rightFile.transform.rotation * Math.PI) / 180);
          ctx.scale(rightFile.transform.scale, rightFile.transform.scale);
          ctx.translate(rightFile.transform.position.x, rightFile.transform.position.y);
        }
        ctx.translate(-halfWidth / 2, -canvas.height / 2);
        
        const rightRatio = rightImg.width / rightImg.height;
        let rightDrawWidth = halfWidth;
        let rightDrawHeight = canvas.height;
        
        if (rightRatio > halfWidth / canvas.height) {
          rightDrawWidth = rightDrawHeight * rightRatio;
        } else {
          rightDrawHeight = rightDrawWidth / rightRatio;
        }
        
        const rightDrawX = halfWidth + (halfWidth - rightDrawWidth) / 2;
        const rightDrawY = (canvas.height - rightDrawHeight) / 2;
        
        ctx.drawImage(rightImg, rightDrawX, rightDrawY, rightDrawWidth, rightDrawHeight);
        ctx.restore();

        // Add text if enabled
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