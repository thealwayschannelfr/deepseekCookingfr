// Replace the createCombinedImage function with:
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
      reject(new Error('Canvas context failed'));
      return;
    }

    canvas.width = 1920;
    canvas.height = 1080;

    const leftImg = new Image();
    const rightImg = new Image();

    leftImg.onload = rightImg.onload = () => {
      renderUniversalPreview(
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
    };

    leftImg.onerror = () => reject(new Error('Left image load failed'));
    rightImg.onerror = () => reject(new Error('Right image load failed'));
    
    leftImg.src = leftFile.preview;
    rightImg.src = rightFile.preview;
  });
};
