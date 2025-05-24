import React, { useEffect, useRef } from 'react';
import { renderCombinedImage } from '../utils/renderUtils';

interface ThumbnailCanvasProps {
  leftPhoto: string;
  rightPhoto: string;
  transform: {
    left: any;
    right: any;
  };
  textOptions?: TextOptions;
}

export const ThumbnailCanvas = ({
  leftPhoto,
  rightPhoto,
  transform,
  textOptions
}: ThumbnailCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = 300 / 1920; // 300x168 maintains 16:9 aspect ratio

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 168;

    const leftImg = new Image();
    const rightImg = new Image();

    const onLoad = () => {
      if (leftImg.complete && rightImg.complete) {
        renderCombinedImage(
          ctx,
          leftImg,
          rightImg,
          transform.left,
          transform.right,
          textOptions,
          scale
        );
      }
    };

    leftImg.onload = rightImg.onload = onLoad;
    leftImg.src = leftPhoto;
    rightImg.src = rightPhoto;
  }, [leftPhoto, rightPhoto, transform, textOptions]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
};
