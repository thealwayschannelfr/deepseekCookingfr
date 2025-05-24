// src/components/ThumbnailCanvas.tsx

import React, { useEffect, useRef } from 'react';
import { FileData, ProcessedImage, TextOptions } from '../types';
import { drawImageWithTransform, renderTextOnCanvas } from '../utils/renderUtils';

interface ThumbnailCanvasProps {
  leftPhoto: string;
  rightPhoto: string;
  transform?: {
    left?: any;
    right?: any;
  };
  textOptions?: TextOptions;
}

const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({
  leftPhoto,
  rightPhoto,
  transform,
  textOptions
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thumbnailSize = { width: 300, height: 168 }; // 16:9 aspect ratio

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = thumbnailSize.width;
    canvas.height = thumbnailSize.height;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const leftImg = new Image();
    const rightImg = new Image();

    let leftLoaded = false;
    let rightLoaded = false;

    const checkBothLoaded = () => {
      if (leftLoaded && rightLoaded) {
        // Draw left image
        drawImageWithTransform(
          ctx,
          leftImg,
          0,
          canvas.width / 2,
          canvas.height,
          transform?.left
        );

        // Draw right image
        drawImageWithTransform(
          ctx,
          rightImg,
          canvas.width / 2,
          canvas.width / 2,
          canvas.height,
          transform?.right
        );

        // Render text
        if (textOptions) {
          renderTextOnCanvas(ctx, textOptions, canvas);
        }
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

    leftImg.src = leftPhoto;
    rightImg.src = rightPhoto;
  }, [leftPhoto, rightPhoto, transform, textOptions]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        imageRendering: 'crisp-edges',
        aspectRatio: '16/9'
      }}
    />
  );
};

export default ThumbnailCanvas;
