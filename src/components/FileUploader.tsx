import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileData } from '../types';
import { X, FileIcon } from 'lucide-react';

interface FileUploaderProps {
  title: string;
  subtitle: string;
  files: FileData[];
  onUpload: (files: FileData[]) => void;
  icon: React.ReactNode;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  title,
  subtitle,
  files,
  onUpload,
  icon,
  accept,
  multiple = false,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file)
    }));
    
    onUpload(newFiles);
  }, [onUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept.split('/')[0]]: [accept] } : undefined,
    multiple,
    disabled,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false)
  });

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onDrop(files);
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    onUpload(newFiles);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
          ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 
            isDragging || isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {isDragging ? "Drop files here" : "Drag and drop or click to select files"}
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (folderInputRef.current) folderInputRef.current.click();
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Select Folder
            </button>
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={handleFolderUpload}
            />
          </div>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {files.length} {files.length === 1 ? 'file' : 'files'} selected
          </p>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon className="w-full h-full p-2 text-gray-500" />
                    )}
                  </div>
                  <span className="ml-2 text-sm text-gray-700 truncate max-w-[180px]">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-gray-400 hover:text-gray-500 p-1"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
