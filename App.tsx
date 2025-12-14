import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { TranscriptionView } from './components/TranscriptionView';
import { ScriptView } from './components/ScriptView';
import { AppState, TranscriptionResult, ScriptResponse } from './types';
import { transcribeAudio, generateVideoScript } from './services/geminiService';
import { AlertCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [script, setScript] = useState<ScriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Helper to read file as base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove Data URL prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFilesSelect = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setAppState(AppState.TRANSCRIBING);
      setError(null);

      // Process all files concurrently
      const results = await Promise.all(
        files.map(async (file) => {
          const base64Audio = await fileToBase64(file);
          const text = await transcribeAudio(base64Audio, file.type);
          return {
            fileName: file.name,
            text
          };
        })
      );

      // Combine transcripts
      const combinedText = results
        .map((r, index) => `--- SOURCE FILE ${index + 1}: ${r.fileName} ---\n${r.text}`)
        .join('\n\n');
      
      const combinedFileNames = results.map(r => r.fileName).join(', ');
      
      setTranscription({
        text: combinedText,
        fileName: results.length > 1 ? `${results.length} files: ${combinedFileNames}` : combinedFileNames
      });
      setAppState(AppState.REVIEW_TRANSCRIPT);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to transcribe audio.');
      setAppState(AppState.ERROR);
    }
  };

  const handleUpdateTranscript = (newText: string) => {
    setTranscription(prev => prev ? { ...prev, text: newText } : null);
  };

  const handleGenerateScript = async () => {
    if (!transcription) return;

    try {
      setAppState(AppState.GENERATING_SCRIPT);
      const generatedScript = await generateVideoScript(transcription.text, false);
      setScript(generatedScript);
      setAppState(AppState.SCRIPT_READY);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate script. Please try again.');
      setAppState(AppState.REVIEW_TRANSCRIPT); // Allow retry
    }
  };

  const handleRegenerateScript = async () => {
    if (!transcription) return;

    try {
      setIsRegenerating(true);
      const generatedScript = await generateVideoScript(transcription.text, true);
      setScript(generatedScript);
    } catch (err: any) {
      console.error(err);
      setError('Failed to regenerate script. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setTranscription(null);
    setScript(null);
    setError(null);
    setIsRegenerating(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-gold-500/30 font-sans pb-10">
      {/* Navigation / Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={handleReset} role="button">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-lg shadow-gold-500/20">
              <span className="font-serif font-bold text-black text-lg">M</span>
            </div>
            <span className="font-serif text-lg tracking-wide text-zinc-100">Memoir <span className="text-gold-500">AI</span></span>
          </div>
          <div className="text-xs text-zinc-500 font-mono hidden md:block">
            DIRECTOR MODE: {appState}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-xs hover:underline">Dismiss</button>
          </div>
        )}

        {/* State: IDLE or TRANSCRIBING */}
        {(appState === AppState.IDLE || appState === AppState.TRANSCRIBING || appState === AppState.ERROR) && (
          <div className="max-w-2xl mx-auto flex flex-col items-center">
             <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
                  Tell Your Story.
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed max-w-lg mx-auto">
                  Upload your interview recordings. Our AI Director will transcribe them and craft a cinematic 3-minute video memoir script for you.
                </p>
             </div>
             
             <div className="w-full">
               <FileUploader 
                onFilesSelect={handleFilesSelect} 
                isLoading={appState === AppState.TRANSCRIBING}
               />
             </div>

             {appState === AppState.TRANSCRIBING && (
               <div className="mt-8 flex flex-col items-center gap-3 animate-fade-in">
                 <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                 <p className="text-zinc-400 text-sm font-mono">Transcribing audio sources... This may take a moment.</p>
               </div>
             )}
          </div>
        )}

        {/* State: REVIEW TRANSCRIPT or GENERATING SCRIPT */}
        {(appState === AppState.REVIEW_TRANSCRIPT || appState === AppState.GENERATING_SCRIPT) && transcription && (
          <TranscriptionView 
            transcription={transcription}
            onGenerateScript={handleGenerateScript}
            isGenerating={appState === AppState.GENERATING_SCRIPT}
            onUpdateTranscript={handleUpdateTranscript}
          />
        )}

        {/* State: SCRIPT READY */}
        {appState === AppState.SCRIPT_READY && script && (
          <ScriptView 
            script={script} 
            onReset={handleReset} 
            onRegenerate={handleRegenerateScript}
            isRegenerating={isRegenerating}
          />
        )}

      </main>
    </div>
  );
};

export default App;