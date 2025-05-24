import React, { useEffect, useRef } from 'react';
import { renderCombinedImage } from '../utils/renderUtils';

interface ThumbnailCanvasProps {
  leftPhoto: string;
  rightPhoto: string;
  transform?: {
    left?: any;
    right?: any;
  };
  textOptions?: any;
}

const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({
  leftPhoto,
  rightPhoto,
  transform,
  textOptions
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = 300 / 1920; // Thumbnail width / Base width

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 168; // 16:9 aspect ratio

    const leftImg = new Image();
    const rightImg = new Image();

    leftImg.onload = () => {
      rightImg.onload = () => {
        renderCombinedImage(
          ctx,
          leftImg,
          rightImg,
          transform?.left,
          transform?.right,
          textOptions,
          scale
        );
      };
      rightImg.src = rightPhoto;
    };
    leftImg.src = leftPhoto;
  }, [leftPhoto, rightPhoto, transform, textOptions, scale]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
};

export default ThumbnailCanvas;
