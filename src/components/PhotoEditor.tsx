import React, { useState, useRef, useEffect } from 'react';
import { FileData } from '../types';
import { ZoomIn, RotateCw, Move } from 'lucide-react';

interface PhotoEditorProps {
  photo: FileData;
  side: 'left' | 'right';
  onUpdate: (updatedPhoto: FileData) => void;
  onClose: () => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ photo, side, onUpdate, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    scale: photo.transform?.scale || 1,
    rotation: photo.transform?.rotation || 0,
    position: photo.transform?.position || { x: 0, y: 0 }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setTransform(prev => ({
          ...prev,
          position: {
            x: prev.position.x + dx,
            y: prev.position.y + dy
          }
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsResizing(true);
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialDistance(distance);
      setInitialScale(transform.scale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isResizing && e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = (distance / initialDistance) * initialScale;
      setTransform(prev => ({
        ...prev,
        scale: Math.max(0.5, Math.min(3, scale))
      }));
    }
  };

  const handleRotate = (direction: 1 | -1) => {
    setTransform(prev => ({
      ...prev,
      rotation: prev.rotation + (90 * direction)
    }));
  };

  const handleSave = () => {
    onUpdate({
      ...photo,
      transform: {
        scale: transform.scale,
        rotation: transform.rotation,
        position: transform.position
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90vw] max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit {side === 'left' ? 'Left' : 'Right'} Photo</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div 
          ref={containerRef}
          className="relative h-[60vh] bg-gray-100 rounded-lg overflow-hidden"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <img
            src={photo.preview}
            alt="Editing"
            className="w-full h-full object-contain"
            style={{
              transform: `translate(${transform.position.x}px, ${transform.position.y}px) 
                         scale(${transform.scale}) 
                         rotate(${transform.rotation}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <ZoomIn className="h-4 w-4 mr-2" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={transform.scale}
                  onChange={(e) => setTransform(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                  className="w-32"
                />
              </div>
              
              <button
                onClick={() => handleRotate(1)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleRotate(-1)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <RotateCw className="h-4 w-4 transform scale-x-[-1]" />
              </button>
            </div>
            
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;
