import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Share2 } from 'lucide-react';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExport: () => void;
  onShare: () => void;
}

export function Toolbar({ onZoomIn, onZoomOut, onReset, onExport, onShare }: ToolbarProps) {
  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-md p-2">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-2" />
      <button
        onClick={onReset}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="Reset View"
      >
        <RotateCcw size={20} />
      </button>
      <button
        onClick={onExport}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="Export"
      >
        <Download size={20} />
      </button>
      <button
        onClick={onShare}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="Share"
      >
        <Share2 size={20} />
      </button>
    </div>
  );
}