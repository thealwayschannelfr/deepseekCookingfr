import React from 'react';
import { Upload, Image, AlertCircle, Loader2, Type } from 'lucide-react';
import FileUploader from './FileUploader';
import TextOptionsPanel from './TextOptions';
import { FileData, TextOptions } from '../types';

interface UploadSectionProps {
  babyPhotos: FileData[];
  currentPhotos: FileData[];
  onBabyPhotosUpload: (files: FileData[]) => void;
  onCurrentPhotosUpload: (files: FileData[]) => void;
  onProcess: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
  error: string | null;
  progress: number;
  textOptions: TextOptions;
  onTextOptionsChange: (options: TextOptions) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  babyPhotos,
  currentPhotos,
  onBabyPhotosUpload,
  onCurrentPhotosUpload,
  onProcess,
  onClearAll,
  isProcessing,
  error,
  progress,
  textOptions,
  onTextOptionsChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FileUploader 
          title="Baby Photos"
          subtitle="Upload LASTNAME_FIRSTNAME_01 format"
          files={babyPhotos}
          onUpload={onBabyPhotosUpload}
          icon={<Image className="h-8 w-8 text-indigo-500" />}
          accept="image/*"
          multiple
          disabled={isProcessing}
        />
        
        <FileUploader 
          title="Current Photos"
          subtitle="Upload LASTNAME_FIRSTNAME_02 format"
          files={currentPhotos}
          onUpload={onCurrentPhotosUpload}
          icon={<Image className="h-8 w-8 text-indigo-500" />}
          accept="image/*"
          multiple
          disabled={isProcessing}
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-4">
          <Type className="h-5 w-5 text-indigo-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Global Text Settings</h3>
        </div>
        <TextOptionsPanel
          options={textOptions}
          onChange={onTextOptionsChange}
        />
      </div>
      
      {error && (
        <div className="flex items-center mt-6 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {isProcessing && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Processing images...</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={onClearAll}
          disabled={isProcessing || (babyPhotos.length === 0 && currentPhotos.length === 0)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
        
        <button
          onClick={onProcess}
          disabled={isProcessing || babyPhotos.length === 0 || currentPhotos.length === 0}
          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Process Images
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadSection;
