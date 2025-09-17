'use client';

import { useState } from 'react';
import { X, Upload, File, Image as ImageIcon, Video } from 'lucide-react';

export default function FileUploadDialog({ onClose, onUpload }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Show under development message
    alert('File upload feature is under development!');
  };

  const handleFileSelect = (e) => {
    e.preventDefault();
    // Show under development message
    alert('File upload feature is under development!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload File</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-gray-400" aria-hidden="true" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  File Upload - Under Development
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  This feature is currently being developed and will be available soon.
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats will include: Images (PNG, JPG, GIF), Documents (PDF, DOC), and more.
                </p>
              </div>

              <button
                onClick={handleFileSelect}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Files (Demo)
              </button>
            </div>
          </div>

          {/* File Type Icons */}
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Planned Support For:</p>
            <div className="flex justify-center space-x-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-lg mb-2">
                  <ImageIcon className="h-6 w-6 text-blue-600 mx-auto" aria-hidden="true" />
                </div>
                <p className="text-xs text-gray-600">Images</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-lg mb-2">
                  <File className="h-6 w-6 text-green-600 mx-auto" aria-hidden="true" />
                </div>
                <p className="text-xs text-gray-600">Documents</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-lg mb-2">
                  <Video className="h-6 w-6 text-purple-600 mx-auto" aria-hidden="true" />
                </div>
                <p className="text-xs text-gray-600">Videos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert('File upload feature is under development!');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 opacity-50 cursor-not-allowed"
            disabled
          >
            Upload (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}