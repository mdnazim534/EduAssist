import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, FileText } from 'lucide-react';

function fileIcon(mime) {
  if (mime?.startsWith('image/')) return Image;
  if (mime === 'application/pdf') return FileText;
  return File;
}

function formatSize(bytes) {
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return Math.round(bytes / 1024) + ' KB';
}

export default function FileUpload({
  files = [],
  onAdd,
  onRemove,
  accept,
  maxFiles = 20,
  maxSizeMB = 50,
  label = 'Drop files here',
  sublabel,
  multiple = true,
}) {
  const onDrop = useCallback((accepted) => {
    if (onAdd) onAdd(accepted);
  }, [onAdd]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
  });

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-brand-500 bg-brand-500/5' : ''}
          ${isDragReject ? 'border-red-500 bg-red-500/5' : ''}
          ${!isDragActive ? 'border-white/10 hover:border-brand-500/40 hover:bg-white/3' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
            ${isDragActive ? 'bg-brand-500/20' : 'bg-white/5'}`}>
            <Upload className={`w-6 h-6 ${isDragActive ? 'text-brand-400' : 'text-white/30'}`} />
          </div>
          <div>
            <p className="font-medium text-white/70">{isDragActive ? 'Drop to upload' : label}</p>
            <p className="text-sm text-white/30 mt-1">
              {sublabel || `or click to browse · max ${maxSizeMB}MB per file`}
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => {
            const Icon = fileIcon(file.type);
            return (
              <div key={i} className="flex items-center gap-3 p-3 glass-sm rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-white/40">{formatSize(file.size)}</p>
                </div>
                <button
                  onClick={() => onRemove && onRemove(i)}
                  className="text-white/30 hover:text-red-400 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
