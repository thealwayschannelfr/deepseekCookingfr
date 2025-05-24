import React, { useEffect, useRef } from 'react';
import { renderUniversalPreview } from '../utils/renderUtils';

export const ThumbnailCanvas = ({
  leftPhoto,
  rightPhoto,
  transform,
  textOptions
}: {
  leftPhoto: string;
  rightPhoto: string;
  transform: { left: any; right: any };
  textOptions: any;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = 0.15625; // 300px / 1920px

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 168;

    const leftImg = new Image();
    const rightImg = new Image();

    leftImg.onload = rightImg.onload = () => {
      renderUniversalPreview(
        ctx,
        leftImg,
        rightImg,
        transform.left,
        transform.right,
        textOptions,
        scale
      );
    };

    leftImg.src = leftPhoto;
    rightImg.src = rightPhoto;
  }, [leftPhoto, rightPhoto, transform, textOptions]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
