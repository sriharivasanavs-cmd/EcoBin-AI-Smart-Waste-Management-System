import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FolderArchive,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { PYTHON_PROJECT_FILES, VIVA_QUESTIONS } from '../data/pythonProjectFiles';

interface PythonProjectHubProps {
  onDownloadZip: () => void;
}

export const PythonProjectHub: React.FC<PythonProjectHubProps> = ({ onDownloadZip }) => {
  const [selectedFileName, setSelectedFileName] = useState<string>('app.py');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'CODE' | 'VIVA' | 'PRESENTATION' | 'DEMO_GUIDE'>('CODE');
  
  // Interactive Viva Practice with Gemini
  const [vivaQuery, setVivaQuery] = useState('');
  const [vivaResponse, setVivaResponse] = useState<string | null>(null);
  const [isAskingMentor, setIsAskingMentor] = useState(false);

  const currentFile =
    PYTHON_PROJECT_FILES.find((f) => f.name === selectedFileName) || PYTHON_PROJECT_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code || currentFile.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAskMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vivaQuery.trim()) return;

    setIsAskingMentor(true);
    try {
      const res = await fetch('/api/gemini/viva-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: vivaQuery,
          studentContext: 'Final year undergraduate engineering student presenting to external examiners',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVivaResponse(data.guidance || 'Great question! Focus on explaining trade-offs and edge IoT constraints.');
      } else {
        setVivaResponse(
          'Examiners love to test Depthwise Separable Convolutions vs Standard Convolutions, and why OR-Tools Guided Local Search scales better than brute-force O(n!) factorial search. Emphasize computational complexity!'
        );
      }
    } catch {
      setVivaResponse(
        'For high marks, structure your answer into 3 parts: 1) Problem statement & constraints, 2) Technical solution & algorithm chosen, 3) Real-world evaluation metric (e.g. 38% fuel saved, 42ms edge latency).'
      );
    } finally {
      setIsAskingMentor(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Python Source Code & Academic Defense Hub</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Complete Final-Year Deliverable
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Clean, modular, PEP-8 compliant Python codebase with Streamlit dashboard, IoT simulator, MQTT broker, and viva voce preparation.
          </p>
        </div>

        {/* Global Action: Download Entire ZIP */}
        <button
          onClick={onDownloadZip}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 transition"
        >
          <FolderArchive className="w-4 h-4" />
          <span>Download Entire Project ZIP</span>
        </button>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('CODE')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === 'CODE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Source Code Browser ({PYTHON_PROJECT_FILES.length} Files)</span>
        </button>
        <button
          onClick={() => setActiveTab('VIVA')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === 'VIVA' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Viva Questions & Defense Guide (Full Marks)</span>
        </button>
        <button
          onClick={() => setActiveTab('PRESENTATION')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === 'PRESENTATION' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>12-Slide PPT Deck</span>
        </button>
        <button
          onClick={() => setActiveTab('DEMO_GUIDE')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === 'DEMO_GUIDE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>5-Minute Live Demo Script</span>
        </button>
      </div>

      {/* Tab 1: Source Code Browser */}
      {activeTab === 'CODE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree Explorer (3 cols) */}
          <div className="lg:col-span-3 space-y-2 bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Project Directory
            </span>

            <div className="space-y-1">
              {PYTHON_PROJECT_FILES.map((file) => {
                const isSelected = file.name === selectedFileName;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFileName(file.name)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{file.language}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer (9 cols) */}
          <div className="lg:col-span-9 space-y-3 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-bold text-sm text-white">{currentFile.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                    {currentFile.language}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentFile.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => handleDownloadSingleFile(currentFile.name, currentFile.code || currentFile.content || '')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Code Display Area with Syntax Highlighting */}
            <div className="relative">
              <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto border border-slate-800 max-h-[600px] scrollbar-thin">
                <code>{currentFile.code || currentFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Viva Voce Defense Prep */}
      {activeTab === 'VIVA' && (
        <div className="space-y-6">
          {/* AI Viva Mentor Practice Assistant */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-5 rounded-2xl border border-purple-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Gemini Academic Viva Mentor</h3>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">External Examiner Simulator</span>
            </div>
            <p className="text-xs text-slate-300">
              Ask any question about your project architecture, algorithms, or ask the AI to grill you on trade-offs.
            </p>

            <form onSubmit={handleAskMentor} className="flex gap-2">
              <input
                type="text"
                value={vivaQuery}
                onChange={(e) => setVivaQuery(e.target.value)}
                placeholder="e.g., Why did you use OR-Tools instead of Genetic Algorithms or Dijkstra?"
                className="flex-1 bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isAskingMentor}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shrink-0"
              >
                {isAskingMentor ? 'Analyzing...' : 'Ask Examiner'}
              </button>
            </form>

            {vivaResponse && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <span className="font-bold text-purple-400 block">Viva Mentor Guidance:</span>
                <p className="whitespace-pre-line">{vivaResponse}</p>
              </div>
            )}
          </div>

          {/* Curated Top Viva Questions with Model Answers */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Top 10 Frequently Asked Examiner Questions & Ideal Answers
            </h3>

            <div className="space-y-3">
              {VIVA_QUESTIONS.map((qa, idx) => (
                <details
                  key={idx}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl p-4 transition open:border-emerald-500/50 open:bg-slate-850"
                >
                  <summary className="cursor-pointer font-semibold text-xs text-slate-200 flex items-center justify-between select-none">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{qa.q}</span>
                    </span>
                    <span className="text-slate-500 group-open:rotate-90 transition-transform">▸</span>
                  </summary>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
                    <p className="whitespace-pre-line">{qa.a}</p>
                    {qa.proTip && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                        💡 Examiner Pro Tip: {qa.proTip}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Presentation Slides */}
      {activeTab === 'PRESENTATION' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">12-Slide Final Presentation Outline</h3>
              <p className="text-xs text-slate-400">
                Ready to copy into PowerPoint / Google Slides for your 15-minute final defense.
              </p>
            </div>
            <button
              onClick={() => {
                const slidesFile = PYTHON_PROJECT_FILES.find((f) => f.name === 'presentation_slides.md');
                const slides = slidesFile?.code || slidesFile?.content || '';
                navigator.clipboard.writeText(slides);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              {copied ? 'Copied Slides Markdown!' : 'Copy Slides Text'}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto border border-slate-800 max-h-[600px] scrollbar-thin whitespace-pre-wrap">
            {(() => {
              const file = PYTHON_PROJECT_FILES.find((f) => f.name === 'presentation_slides.md');
              return file?.code || file?.content || '';
            })()}
          </pre>
        </div>
      )}

      {/* Tab 4: Live Demo Script */}
      {activeTab === 'DEMO_GUIDE' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">5-Minute Flawless Live Demo Script</h3>
              <p className="text-xs text-slate-400">
                Word-for-word spoken talking points and click-by-click instructions during your committee evaluation.
              </p>
            </div>
            <button
              onClick={() => {
                const demoFile = PYTHON_PROJECT_FILES.find((f) => f.name === 'demo_script.md');
                const demo = demoFile?.code || demoFile?.content || '';
                navigator.clipboard.writeText(demo);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              {copied ? 'Copied Demo Script!' : 'Copy Script Text'}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto border border-slate-800 max-h-[600px] scrollbar-thin whitespace-pre-wrap">
            {(() => {
              const file = PYTHON_PROJECT_FILES.find((f) => f.name === 'demo_script.md');
              return file?.code || file?.content || '';
            })()}
          </pre>
        </div>
      )}
    </div>
  );
};
