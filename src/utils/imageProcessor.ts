import { FileData, ProcessedImage, TextOptions } from '../types';
import JSZip from 'jszip';
import { renderCombinedImage } from './renderUtils';

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

    const leftImg = new Image();
    const rightImg = new Image();

    const onLoad = () => {
      if (leftImg.complete && rightImg.complete) {
        renderCombinedImage(
          ctx,
          leftImg,
          rightImg,
          leftFile.transform,
          rightFile.transform,
          textOptions,
          1 // Full scale
        );

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

    leftImg.onload = rightImg.onload = onLoad;
    leftImg.onerror = () => reject(new Error('Left image load failed'));
    rightImg.onerror = () => reject(new Error('Right image load failed'));
    
    leftImg.src = leftFile.preview;
    rightImg.src = rightFile.preview;
  });
};

export const downloadAsZip = async (images: ProcessedImage[]) => {
  const zip = new JSZip();

  await Promise.all(images.map(async (image) => {
    const fileName = `${image.name}_combined.jpg`;
    const data = image.dataUrl.split(',')[1];
    zip.file(fileName, data, { base64: true });
  }));

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'processed_images.zip';
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};
