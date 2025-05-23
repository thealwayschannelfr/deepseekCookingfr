import React from 'react';
import { TextOptions as TextOptionsType } from '../types';
import { Type, Bold, Italic, Circle } from 'lucide-react';

interface TextOptionsProps {
  options: TextOptionsType;
  onChange: (options: TextOptionsType) => void;
  compact?: boolean;
}

const TextOptions: React.FC<TextOptionsProps> = ({ options, onChange, compact = false }) => {
  const handleChange = (updates: Partial<TextOptionsType>) => {
    onChange({ ...options, ...updates });
  };

  const fonts = [
    { label: 'Arial Bold', value: 'Arial-Bold' },
    { label: 'Helvetica Bold', value: 'Helvetica-Bold' },
    { label: 'Times Bold', value: 'Times-Bold' },
    { label: 'Georgia Bold', value: 'Georgia-Bold' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Georgia', value: 'Georgia' },
  ];

  return (
    <div className={`space-y-4 ${compact ? 'p-2' : 'p-4'} bg-gray-50 rounded-lg`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Type className="h-4 w-4 mr-2" />
          Display Name
        </label>
        <input
          type="checkbox"
          checked={options.enabled}
          onChange={(e) => handleChange({ enabled: e.target.checked })}
          className="rounded text-indigo-600 focus:ring-indigo-500"
        />
      </div>

      {options.enabled && (
        <div className="space-y-3">
          <input
            type="text"
            value={options.text}
            onChange={(e) => handleChange({ text: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            placeholder="Enter name"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={options.font}
              onChange={(e) => handleChange({ font: e.target.value })}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              {fonts.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>

            <input
              type="color"
              value={options.color}
              onChange={(e) => handleChange({ color: e.target.value })}
              className="h-9 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleChange({ bold: !options.bold })}
              className={`p-2 rounded ${options.bold ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleChange({ italic: !options.italic })}
              className={`p-2 rounded ${options.italic ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleChange({ stroke: !options.stroke })}
              className={`p-2 rounded ${options.stroke ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`}
            >
              <Circle className="h-4 w-4" />
            </button>
          </div>

          {options.stroke && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="color"
                value={options.strokeColor}
                onChange={(e) => handleChange({ strokeColor: e.target.value })}
                className="h-9 w-full rounded-md border-gray-300 shadow-sm"
              />
              <input
                type="number"
                value={options.strokeWidth}
                onChange={(e) => handleChange({ strokeWidth: Number(e.target.value) })}
                min={1}
                max={10}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Font Size ({options.size}px)
            </label>
            <input
              type="range"
              min={12}
              max={120}
              value={options.size}
              onChange={(e) => handleChange({ size: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
              <button
                key={pos}
                onClick={() => handleChange({ position: pos as TextOptionsType['position'] })}
                className={`p-2 text-sm rounded-md border ${
                  options.position === pos
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pos.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextOptions;
