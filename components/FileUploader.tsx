import React, { useCallback } from 'react';
import { Upload, Music, FileAudio, Files } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelect: (files: File[]) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelect, isLoading }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isLoading) return;
      
      // Cast to File[] to prevent 'unknown' type inference on file.type
      const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(file => 
        file.type.startsWith('audio/')
      );
      
      if (droppedFiles.length > 0) {
        onFilesSelect(droppedFiles);
      }
    },
    [onFilesSelect, isLoading]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Cast to File[] to match prop type
      const selectedFiles = Array.from(e.target.files) as File[];
      onFilesSelect(selectedFiles);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-xl p-12
        flex flex-col items-center justify-center text-center
        transition-all duration-300
        ${isLoading 
          ? 'border-zinc-700 bg-zinc-900/50 opacity-50 cursor-not-allowed' 
          : 'border-zinc-700 hover:border-gold-500/50 hover:bg-zinc-900 bg-zinc-900/20'
        }
      `}
    >
      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={handleChange}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-800/80 group-hover:scale-110 transition-transform duration-300">
        {isLoading ? (
           <Upload className="w-8 h-8 text-zinc-500" />
        ) : (
           <Files className="w-8 h-8 text-gold-500" />
        )}
      </div>

      <h3 className="text-xl font-serif text-zinc-100 mb-2">
        Upload Interview Audio(s)
      </h3>
      <p className="text-zinc-400 text-sm max-w-xs mx-auto">
        Drag and drop one or multiple audio files here, or click to browse.
      </p>
      
      <div className="mt-6 flex gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <Music size={14} />
          <span>Multi-file Support</span>
        </div>
        <div className="flex items-center gap-1">
          <FileAudio size={14} />
          <span>Auto-Merge & Transcribe</span>
        </div>
      </div>
    </div>
  );
};