import React, { useState, useRef, useEffect } from 'react';
import { Transform } from '../types';

interface TransformableImageProps {
  src: string;
  isSelected: boolean;
  transform?: Transform;
  onTransformChange: (transform: Transform) => void;
}

const TransformableImage: React.FC<TransformableImageProps> = ({
  src,
  isSelected,
  transform: initialTransform,
  onTransformChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>(initialTransform || {
    scale: 1,
    rotation: 0,
    position: { x: 0, y: 0 }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (initialTransform) {
      setTransform(initialTransform);
    }
  }, [initialTransform]);

  useEffect(() => {
    if (!isSelected) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        const newTransform = {
          ...transform,
          position: {
            x: transform.position.x + dx,
            y: transform.position.y + dy
          }
        };
        
        setTransform(newTransform);
        onTransformChange(newTransform);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
      
      if (isResizing && containerRef.current) {
        e.preventDefault();
        const container = containerRef.current.getBoundingClientRect();
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        let newScale = transform.scale;
        
        if (resizeHandle?.includes('right')) {
          newScale = Math.max(0.5, Math.min(3, transform.scale + dx / container.width));
        }
        if (resizeHandle?.includes('bottom')) {
          newScale = Math.max(0.5, Math.min(3, transform.scale + dy / container.height));
        }
        
        const newTransform = {
          ...transform,
          scale: newScale
        };
        
        setTransform(newTransform);
        onTransformChange(newTransform);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, transform, isSelected, onTransformChange, resizeHandle]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelected) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    if (!isSelected) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setInitialSize({ width: rect.width, height: rect.height });
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <img
        src={src}
        alt="Transformable"
        className="w-full h-full object-cover"
        style={{
          transform: `translate(${transform.position.x}px, ${transform.position.y}px) 
                     scale(${transform.scale}) 
                     rotate(${transform.rotation}deg)`,
          transition: isDragging || isResizing ? 'none' : 'transform 0.1s ease-out'
        }}
        onMouseDown={handleMouseDown}
        draggable={false}
      />
      
      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-indigo-500 pointer-events-none" />
          
          {/* Resize handles */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-nw-resize -right-2 -top-2"
            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
          />
          <div
            className="absolute w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-ne-resize -right-2 -bottom-2"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
          />
          <div
            className="absolute w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-sw-resize -left-2 -top-2"
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
          />
          <div
            className="absolute w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize -left-2 -bottom-2"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
          />
        </>
      )}
    </div>
  );
};

export default TransformableImage;
