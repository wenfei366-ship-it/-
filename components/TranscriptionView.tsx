import React from 'react';
import { ScrollText, Clapperboard, Edit3 } from 'lucide-react';
import { TranscriptionResult } from '../types';

interface TranscriptionViewProps {
  transcription: TranscriptionResult;
  onGenerateScript: () => void;
  isGenerating: boolean;
  onUpdateTranscript: (text: string) => void;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  transcription,
  onGenerateScript,
  isGenerating,
  onUpdateTranscript,
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
      <div className="relative group">
        <div className="absolute top-4 right-4 z-10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded backdrop-blur-sm border border-zinc-800">
                <Edit3 className="w-3 h-3" />
                <span>Editable</span>
            </div>
        </div>
        <textarea
            value={transcription.text}
            onChange={(e) => onUpdateTranscript(e.target.value)}
            className="w-full h-[400px] bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 text-zinc-300 leading-relaxed focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all resize-y font-sans custom-scrollbar"
            placeholder="Transcription text..."
            spellCheck={false}
        />
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-zinc-400 text-center max-w-md">
          Review and edit the transcript above if needed, then proceed to generate your script.
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