import React, { useState } from 'react';
import { Film, Download, Copy, RefreshCw, Clock, Video, Mic, Check, Sparkles } from 'lucide-react';
import { ScriptResponse, Scene } from '../types';

interface ScriptViewProps {
  script: ScriptResponse;
  onReset: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const ScriptView: React.FC<ScriptViewProps> = ({ 
  script, 
  onReset, 
  onRegenerate,
  isRegenerating 
}) => {
  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    let md = `# ${script.title}\n\n`;
    md += `| Shot | Time | Visual | Voiceover | Mood |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    script.scenes.forEach(scene => {
      // Escape pipe characters in content to prevent breaking the table
      const safeVisual = scene.visual.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const safeVoiceover = scene.voiceover.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
      const safeMood = scene.mood.replace(/\|/g, '\\|');
      
      md += `| ${scene.sceneNumber} | ${scene.duration} | ${safeVisual} | ${safeVoiceover} | ${safeMood} |\n`;
    });
    return md;
  };

  const handleCopy = async () => {
    const text = generateMarkdown();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_')}_Script.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up pb-20">
      {/* Script Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-gold-500/10 rounded-full mb-4 ring-1 ring-gold-500/30">
          <Film className="w-8 h-8 text-gold-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-tight">
          {script.title || "The Memoir"}
        </h1>
        <p className="text-zinc-400 text-lg">Director's Cut • Approx. 3 Minutes</p>
      </div>

      {/* Script Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 items-end md:items-center">
        <div className="flex gap-3 w-full md:w-auto">
             <button 
              onClick={onRegenerate}
              disabled={isRegenerating}
              className={`
                flex items-center gap-2 px-5 py-2.5 
                bg-gold-600 hover:bg-gold-500 text-black 
                rounded-lg text-sm font-bold transition-all shadow-lg shadow-gold-500/20
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isRegenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"/>
                  <span>Reimagining...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Regenerate (New Style)</span>
                </>
              )}
            </button>
             <button 
              onClick={onReset}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw size={16} />
              Start Over
            </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-zinc-700 min-w-[100px] justify-center"
          >
            {copied ? <Check size={16} className="text-green-400"/> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {/* Script Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800">
                <th className="p-4 md:p-6 text-zinc-500 font-serif font-normal w-24">Shot</th>
                <th className="p-4 md:p-6 text-zinc-500 font-serif font-normal w-24">Time</th>
                <th className="p-4 md:p-6 text-zinc-500 font-serif font-normal w-1/3">
                  <div className="flex items-center gap-2">
                    <Video size={16} /> Visual
                  </div>
                </th>
                <th className="p-4 md:p-6 text-zinc-500 font-serif font-normal w-1/3">
                  <div className="flex items-center gap-2">
                    <Mic size={16} /> Voiceover
                  </div>
                </th>
                <th className="p-4 md:p-6 text-zinc-500 font-serif font-normal">Mood/Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {script.scenes.map((scene: Scene, index: number) => (
                <tr 
                  key={index} 
                  className="group hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="p-4 md:p-6 font-mono text-zinc-500 align-top">
                    {String(scene.sceneNumber).padStart(2, '0')}
                  </td>
                  <td className="p-4 md:p-6 text-gold-500/80 font-mono text-sm align-top whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {scene.duration}
                    </div>
                  </td>
                  <td className="p-4 md:p-6 text-zinc-300 leading-relaxed align-top">
                    {scene.visual}
                  </td>
                  <td className="p-4 md:p-6 text-white font-serif text-lg leading-relaxed align-top whitespace-pre-line">
                    "{scene.voiceover}"
                  </td>
                  <td className="p-4 md:p-6 text-zinc-400 text-sm italic align-top">
                    {scene.mood}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 text-center text-zinc-600 font-serif italic text-sm">
        Generated by Memoir AI Director
      </div>
    </div>
  );
};