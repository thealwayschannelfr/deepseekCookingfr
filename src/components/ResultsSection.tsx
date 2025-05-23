import React, { useState, useRef, useEffect } from 'react';
import { Download, ArrowDown, Check, Edit2, Type, Move, ZoomIn } from 'lucide-react';
import { ProcessedImage, TextOptions, FileData } from '../types';
import TextOptionsPanel from './TextOptions';
import { downloadAsZip } from '../utils/imageProcessor';
import TransformableImage from './TransformableImage';

interface ResultsSectionProps {
  processedImages: ProcessedImage[];
  onImageUpdate: (index: number, updatedImage: ProcessedImage) => void;
  textOptions: TextOptions;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  processedImages,
  onImageUpdate,
  textOptions
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(
    processedImages.length > 0 ? 0 : null
  );
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadedIndices, setDownloadedIndices] = useState<number[]>([]);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    await downloadAsZip(processedImages);
    setDownloadingAll(false);
    setDownloadedIndices([...Array(processedImages.length).keys()]);
  };

  const downloadImage = (index: number) => {
    const image = processedImages[index];
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `${image.name}_combined.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedIndices(prev => [...prev, index]);
  };

  const handleTransformUpdate = async (side: 'left' | 'right', transform: any) => {
    if (selectedImage === null) return;
  
    const updatedImage = {
      ...processedImages[selectedImage],
      transform: {
        ...processedImages[selectedImage].transform,
        [side]: transform
      }
    };
    
    await updateDataUrl(selectedImage, updatedImage);
  };

  const handleTextOptionsChange = async (newOptions: TextOptions) => {
    if (selectedImage === null) return;
  
    const updatedImage = {
      ...processedImages[selectedImage],
      textOptions: newOptions
    };
    
    await updateDataUrl(selectedImage, updatedImage);
  };

  const renderText = (image: ProcessedImage, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    if (image.textOptions?.enabled && image.textOptions?.text) {
      const textOptions = image.textOptions;
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

  const updateDataUrl = async (index: number, updatedImage: ProcessedImage) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get canvas context');
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
        const drawImage = (img: HTMLImageElement, side: 'left' | 'right') => {
          const targetWidth = canvas.width / 2;
          const targetHeight = canvas.height;
          const x = side === 'left' ? 0 : targetWidth;
          
          const transform = updatedImage.transform?.[side];

          ctx.save();
          ctx.translate(x + targetWidth / 2, targetHeight / 2);

          if (transform) {
            ctx.rotate((transform.rotation * Math.PI) / 180);
            ctx.scale(transform.scale, transform.scale);
            ctx.translate(transform.position.x, transform.position.y);
          }

          ctx.translate(-targetWidth / 2, -targetHeight / 2);

          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const drawX = x + (targetWidth - scaledWidth) / 2;
          const drawY = (targetHeight - scaledHeight) / 2;

          ctx.drawImage(img, 0, 0, img.width, img.height, drawX, drawY, scaledWidth, scaledHeight);
          ctx.restore();
        };

        drawImage(leftImg, 'left');
        drawImage(rightImg, 'right');
        
        renderText(updatedImage, canvas, ctx);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onImageUpdate(index, { ...updatedImage, dataUrl });
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

    leftImg.src = updatedImage.leftPhoto;
    rightImg.src = updatedImage.rightPhoto;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Processed Images</h2>
        <button
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {downloadingAll ? (
            <>
              <ArrowDown className="h-4 w-4 mr-2 animate-bounce" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download All (ZIP)
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {processedImages.map((image, index) => (
          <div
            key={index}
            className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
              selectedImage === index ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image.dataUrl}
              alt={`Combined ${image.name}`}
              className="w-full h-full object-cover"
            />
            {downloadedIndices.includes(index) && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <Check className="h-3 w-3" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {selectedImage !== null && (
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 flex bg-gray-100">
            <div 
              className={`w-1/2 h-full relative ${selectedSide === 'left' ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setSelectedSide(prev => prev === 'left' ? null : 'left')}
            >
              <TransformableImage
                src={processedImages[selectedImage].leftPhoto}
                isSelected={selectedSide === 'left'}
                transform={processedImages[selectedImage].transform?.left}
                onTransformChange={(transform) => handleTransformUpdate('left', transform)}
              />
            </div>
            <div 
              className={`w-1/2 h-full relative ${selectedSide === 'right' ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setSelectedSide(prev => prev === 'right' ? null : 'right')}
            >
              <TransformableImage
                src={processedImages[selectedImage].rightPhoto}
                isSelected={selectedSide === 'right'}
                transform={processedImages[selectedImage].transform?.right}
                onTransformChange={(transform) => handleTransformUpdate('right', transform)}
              />
            </div>
            {processedImages[selectedImage].textOptions?.enabled && processedImages[selectedImage].textOptions?.text && (
              <div
                className="absolute"
                style={{
                  font: `${processedImages[selectedImage].textOptions?.bold ? 'bold' : ''} ${processedImages[selectedImage].textOptions?.italic ? 'italic' : ''} ${processedImages[selectedImage].textOptions?.size}px ${processedImages[selectedImage].textOptions?.font}`,
                  color: processedImages[selectedImage].textOptions?.color || '#000000',
                  textShadow: processedImages[selectedImage].textOptions?.stroke ? `-${processedImages[selectedImage].textOptions?.strokeWidth || 2}px -${processedImages[selectedImage].textOptions?.strokeWidth || 2}px 0 ${processedImages[selectedImage].textOptions?.strokeColor || '#FFFFFF'},
                  ${processedImages[selectedImage].textOptions?.strokeWidth || 2}px -${processedImages[selectedImage].textOptions?.strokeWidth || 2}px 0 ${processedImages[selectedImage].textOptions?.strokeColor || '#FFFFFF'},
                  -${processedImages[selectedImage].textOptions?.strokeWidth || 2}px ${processedImages[selectedImage].textOptions?.strokeWidth || 2}px 0 ${processedImages[selectedImage].textOptions?.strokeColor || '#FFFFFF'},
                  ${processedImages[selectedImage].textOptions?.strokeWidth || 2}px ${processedImages[selectedImage].textOptions?.strokeWidth || 2}px 0 ${processedImages[selectedImage].textOptions?.strokeColor || '#FFFFFF'}` : 'none',
                  top: processedImages[selectedImage].textOptions?.position.includes('top') ? '10px' : 'unset',
                  bottom: processedImages[selectedImage].textOptions?.position.includes('bottom') ? '10px' : 'unset',
                  left: processedImages[selectedImage].textOptions?.position.includes('left') ? '10px' : 'unset',
                  right: processedImages[selectedImage].textOptions?.position.includes('right') ? '10px' : 'unset',
                  textAlign: processedImages[selectedImage].textOptions?.position.includes('right') ? 'right' : 'left',
                  width: '100%',
                  padding: '5px',
                }}
              >
                {processedImages[selectedImage].textOptions?.text}
              </div>
            )}
          </div>
          
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => downloadImage(selectedImage)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Selected
            </button>
          </div>
          
          <div className="w-full max-w-md">
            <TextOptionsPanel
              options={processedImages[selectedImage].textOptions || {
                ...textOptions,
                text: processedImages[selectedImage].name,
                enabled: false,
                color: '#000000'
              }}
              onChange={handleTextOptionsChange}
              compact={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;