import React from 'react';
import { ScrollText, Clapperboard, Edit3 } from 'lucide-react';
import { TranscriptionResult } from '../types';

interface TranscriptionViewProps {
  transcription: TranscriptionResult;
  onGenerateScript: () => void;
  isGenerating: boolean;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  transcription,
  onGenerateScript,
  isGenerating,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div className="overflow-hidden">
          <h2 className="text-2xl font-serif text-gold-500 mb-1 flex items-center gap-2">
            <ScrollText className="w-6 h-6 flex-shrink-0" />
            Phase 1: Transcription Complete
          </h2>
          <p className="text-zinc-400 text-sm truncate max-w-xl" title={transcription.fileName}>
            Source: {transcription.fileName}
          </p>
        </div>
        <div className="px-3 py-1 bg-green-900/30 border border-green-800 text-green-400 text-xs rounded-full flex-shrink-0 ml-4">
          Ready for Direction
        </div>
      </div>

      {/* Transcription Content */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit3 className="w-5 h-5 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
        </div>
        <div className="prose prose-invert prose-zinc max-w-none max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <p className="whitespace-pre-wrap leading-relaxed text-zinc-300">
                {transcription.text}
            </p>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-zinc-400 text-center max-w-md">
          The raw material is ready. Shall we proceed to the cutting room to create your video memoir script?
        </p>
        <button
          onClick={onGenerateScript}
          disabled={isGenerating}
          className={`
            group relative px-8 py-4 bg-gold-600 hover:bg-gold-500 
            text-black font-bold text-lg rounded-full 
            transition-all duration-300 hover:scale-105 active:scale-95
            flex items-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.3)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              <span>Directing...</span>
            </>
          ) : (
            <>
              <Clapperboard className="w-6 h-6" />
              <span>Generate Director's Script</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};