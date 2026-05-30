import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Paperclip, X, Sparkles, Copy, Download,
  FileText, Layers, BookOpen, Mic, Target, Brain, RotateCcw,
} from 'lucide-react';
import { aiAPI } from '../api/client';
import { Spinner, ProgressBar, CopyButton, Tabs, EmptyState } from '../components/ui/index.jsx';
import FileUpload from '../components/ui/FileUpload.jsx';
import toast from 'react-hot-toast';

const GEN_TYPES = [
  { id: 'summary', label: 'Summary',     icon: Layers },
  { id: 'mcq',     label: 'MCQs',        icon: BookOpen },
  { id: 'shortq',  label: 'Short Q&A',   icon: FileText },
  { id: 'broadq',  label: 'Essay Qs',    icon: Brain },
  { id: 'viva',    label: 'Viva Prep',   icon: Mic },
  { id: 'topics',  label: 'Key Topics',  icon: Target },
  { id: 'explain', label: 'Simplify',    icon: Sparkles },
];

function ResultCard({ type, content, label }) {
  const renderContent = () => {
    if (!content) return <p className="text-white/30 text-sm">No content generated</p>;

    if (type === 'mcq' && Array.isArray(content)) {
      return (
        <div className="space-y-4">
          {content.map((q, i) => (
            <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/6">
              <p className="font-medium text-white/90 mb-3 text-sm">Q{i + 1}: {q.question}</p>
              <div className="space-y-1.5">
                {q.options?.map((opt, j) => (
                  <div key={j} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${j === q.correctIndex ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'text-white/50'}`}>
                    <span className="font-mono text-xs">{String.fromCharCode(65 + j)}</span>
                    <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                    {j === q.correctIndex && <span className="ml-auto text-xs">✓</span>}
                  </div>
                ))}
              </div>
              {q.explanation && <p className="text-xs text-white/30 mt-2 italic">{q.explanation}</p>}
            </div>
          ))}
        </div>
      );
    }

    if (type === 'topics' && Array.isArray(content)) {
      return (
        <div className="flex flex-wrap gap-2">
          {content.map((t, i) => (
            <span key={i} className="badge badge-brand">{t}</span>
          ))}
        </div>
      );
    }

    if (type === 'viva' && Array.isArray(content)) {
      return (
        <div className="space-y-3">
          {content.map((v, i) => (
            <div key={i} className="p-3 bg-white/3 rounded-xl border border-white/6">
              <p className="font-medium text-white/80 text-sm">Q: {v.question}</p>
              {v.hint && <p className="text-xs text-white/40 mt-1 italic">Hint: {v.hint}</p>}
            </div>
          ))}
        </div>
      );
    }

    // Default: render string as markdown-ish text
    return (
      <div className="ai-prose whitespace-pre-wrap text-sm leading-relaxed">
        {String(content)}
      </div>
    );
  };

  const textContent = Array.isArray(content) ? JSON.stringify(content, null, 2) : String(content || '');

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/8">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 bg-white/3">
        <span className="font-display font-semibold text-sm text-white/80">{label}</span>
        <div className="flex items-center gap-2">
          <CopyButton text={textContent} />
        </div>
      </div>
      <div className="p-5 max-h-96 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default function AIChatPage() {
  const [inputText, setInputText]       = useState('');
  const [files, setFiles]               = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(new Set(['summary', 'mcq', 'topics']));
  const [loading, setLoading]           = useState(false);
  const [progress, setProgress]         = useState(0);
  const [results, setResults]           = useState(null);
  const [sessions, setSessions]         = useState([]);
  const [activeTab, setActiveTab]       = useState('generate');
  const textRef = useRef(null);

  useEffect(() => {
    aiAPI.getHistory({ limit: 5 }).then((r) => setSessions(r.data || [])).catch(() => {});
  }, []);

  function toggleType(id) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  }

  async function handleGenerate() {
    if (!inputText.trim() && files.length === 0) {
      toast.error('Add text or upload a file first');
      return;
    }
    setLoading(true);
    setProgress(0);
    setResults(null);

    try {
      const res = await aiAPI.generate({
        inputText: inputText || undefined,
        file: files[0] || undefined,
        requestedTypes: [...selectedTypes],
        onProgress: setProgress,
      });
      setResults(res.results);
      setSessions((prev) => [{ _id: res.sessionId, title: `Session ${prev.length + 1}`, requestedTypes: [...selectedTypes], createdAt: new Date() }, ...prev.slice(0, 4)]);
      toast.success('Study materials generated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() { setResults(null); setInputText(''); setFiles([]); setProgress(0); }

  const resultEntries = results
    ? GEN_TYPES.filter((g) => selectedTypes.has(g.id) && results[g.id] !== undefined)
    : [];

  return (
    <div className="flex h-[calc(100vh-128px)] gap-5">
      {/* Sidebar - history */}
      <aside className="hidden xl:flex flex-col w-56 shrink-0">
        <div className="glass rounded-2xl p-4 flex-1 overflow-hidden flex flex-col">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Recent Sessions</p>
          {sessions.length === 0 ? (
            <p className="text-xs text-white/20 text-center mt-4">No sessions yet</p>
          ) : (
            <div className="space-y-1 overflow-y-auto flex-1">
              {sessions.map((s) => (
                <div key={s._id} className="p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                  <p className="text-xs font-medium text-white/70 truncate">{s.title}</p>
                  <p className="text-xs text-white/30">{s.requestedTypes?.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 gap-4">
        {/* Top tabs */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/6">
            {['generate', 'history'].map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                  ${activeTab === t ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
          {results && (
            <button onClick={reset} className="btn-ghost ml-auto">
              <RotateCcw className="w-4 h-4" /> New session
            </button>
          )}
        </div>

        {activeTab === 'generate' ? (
          <>
            {/* Input area */}
            {!results && (
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-5 h-5 text-brand-400" />
                  <h2 className="font-display font-semibold">AI Study Assistant</h2>
                </div>

                {/* Text input */}
                <textarea
                  ref={textRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your notes, lecture content, or any text you want to study…"
                  className="input min-h-[120px] resize-y text-sm"
                  disabled={loading}
                />

                {/* File upload */}
                <FileUpload
                  files={files}
                  onAdd={(f) => setFiles([f[0]])}
                  onRemove={() => setFiles([])}
                  accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpg','.jpeg','.png','.webp'] }}
                  maxFiles={1}
                  multiple={false}
                  label="Or upload a PDF / image"
                  sublabel="PDF or image file · max 50MB"
                />

                {/* Generation types */}
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Generate</p>
                  <div className="flex flex-wrap gap-2">
                    {GEN_TYPES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => toggleType(id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                          ${selectedTypes.has(id)
                            ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                            : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                          }`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                {loading && <ProgressBar value={progress} label="Analyzing with AI…" />}

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerate}
                    disabled={loading || (!inputText.trim() && files.length === 0)}
                    className="btn-primary"
                  >
                    {loading ? <Spinner size="sm" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? 'Generating…' : 'Generate'}
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {resultEntries.length === 0 ? (
                  <EmptyState icon={Bot} title="No results" description="Try generating again" />
                ) : (
                  resultEntries.map(({ id, label }) => (
                    <ResultCard key={id} type={id} content={results[id]} label={label} />
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          /* History tab */
          <div className="glass rounded-2xl flex-1 overflow-y-auto p-5">
            <h3 className="font-display font-semibold mb-4">Session History</h3>
            {sessions.length === 0 ? (
              <EmptyState icon={Bot} title="No history yet" description="Your AI sessions will appear here" />
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s._id} className="flex items-center gap-4 p-4 glass-sm rounded-xl border border-white/6 hover:border-brand-500/20 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white/80 text-sm truncate">{s.title}</p>
                      <p className="text-xs text-white/30">{s.requestedTypes?.join(' · ')}</p>
                    </div>
                    <span className="text-xs text-white/20">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
