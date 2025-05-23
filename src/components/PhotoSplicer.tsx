import React, { useState, useRef } from 'react';
import Header from './Header';
import UploadSection from './UploadSection';
import ResultsSection from './ResultsSection';
import { processImages } from '../utils/imageProcessor';
import { FileData, ProcessedImage, TextOptions } from '../types';

const PhotoSplicer: React.FC = () => {
  const [babyPhotos, setBabyPhotos] = useState<FileData[]>([]);
  const [currentPhotos, setCurrentPhotos] = useState<FileData[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [globalTextOptions, setGlobalTextOptions] = useState<TextOptions>({
    enabled: false,
    text: '',
    font: 'Arial',
    size: 36,
    position: 'top-left'
  });
  
  const processRef = useRef<HTMLDivElement>(null);

  const handleBabyPhotosUpload = (files: FileData[]) => {
    setBabyPhotos(files);
    setError(null);
  };

  const handleCurrentPhotosUpload = (files: FileData[]) => {
    setCurrentPhotos(files);
    setError(null);
  };

  const handleProcess = async () => {
    if (babyPhotos.length === 0 || currentPhotos.length === 0) {
      setError('Please upload both baby photos and current photos');
      return;
    }

    if (babyPhotos.length !== currentPhotos.length) {
      setError('Both folders should contain the same number of photos');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessedImages([]);

    try {
      const results = await processImages(
        babyPhotos, 
        currentPhotos, 
        (progress) => setProgress(progress),
        globalTextOptions
      );
      
      setProcessedImages(results);
      
      if (processRef.current) {
        processRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setError('Error processing images. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = () => {
    setBabyPhotos([]);
    setCurrentPhotos([]);
    setProcessedImages([]);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Header />
      
      <UploadSection 
        babyPhotos={babyPhotos}
        currentPhotos={currentPhotos}
        onBabyPhotosUpload={handleBabyPhotosUpload}
        onCurrentPhotosUpload={handleCurrentPhotosUpload}
        onProcess={handleProcess}
        onClearAll={handleClearAll}
        isProcessing={isProcessing}
        error={error}
        progress={progress}
        textOptions={globalTextOptions}
        onTextOptionsChange={setGlobalTextOptions}
      />
      
      <div ref={processRef}>
        {processedImages.length > 0 && (
          <ResultsSection 
            processedImages={processedImages}
            onImageUpdate={(index, updatedImage) => {
              const newImages = [...processedImages];
              newImages[index] = updatedImage;
              setProcessedImages(newImages);
            }}
            textOptions={globalTextOptions}
          />
        )}
      </div>
    </div>
  );
};

export default PhotoSplicer;
