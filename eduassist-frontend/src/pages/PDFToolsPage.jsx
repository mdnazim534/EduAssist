import React, { useState } from 'react';
import { Image, Link2, FileText, Archive, Download, CheckCircle, ArrowRight } from 'lucide-react';
import { pdfAPI } from '../api/client';
import FileUpload from '../components/ui/FileUpload.jsx';
import { ProgressBar, Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

const TOOLS = [
  { id: 'img2pdf',  icon: Image,    label: 'Image → PDF',  color: 'from-brand-500 to-brand-600',   desc: 'Convert JPG, PNG, WebP images to a single PDF.' },
  { id: 'merge',    icon: Link2,    label: 'Merge PDF',     color: 'from-ocean-400 to-ocean-500',   desc: 'Combine multiple PDFs into one document.' },
  { id: 'compress', icon: Archive,  label: 'Compress PDF',  color: 'from-emerald-400 to-emerald-500', desc: 'Reduce file size without losing quality.' },
  { id: 'toword',   icon: FileText, label: 'PDF → Text',    color: 'from-yellow-400 to-orange-400', desc: 'Extract text content from PDF files.' },
];

function ToolPanel({ tool }) {
  const [files, setFiles] = useState([]);
  const [opts, setOpts] = useState({ pageSize: 'A4', orientation: 'portrait', quality: 'balanced', removeMetadata: false });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const isImage = tool.id === 'img2pdf';
  const accept = isImage
    ? { 'image/*': ['.jpg','.jpeg','.png','.webp','.gif','.tiff'] }
    : { 'application/pdf': ['.pdf'] };
  const maxFiles = ['img2pdf','merge'].includes(tool.id) ? 20 : 1;
  const multiple = ['img2pdf','merge'].includes(tool.id);

  async function handle() {
    if (files.length === 0) { toast.error('Please upload files first'); return; }
    setLoading(true); setProgress(0); setResult(null);
    try {
      let res;
      const onP = setProgress;
      if (tool.id === 'img2pdf')  res = await pdfAPI.imageToPdf(files, { pageSize: opts.pageSize, orientation: opts.orientation }, onP);
      if (tool.id === 'merge')    res = await pdfAPI.merge(files, {}, onP);
      if (tool.id === 'compress') res = await pdfAPI.compress(files[0], { quality: opts.quality, removeMetadata: opts.removeMetadata });
      if (tool.id === 'toword')   res = await pdfAPI.toWord(files[0]);
      setResult(res);
      toast.success('Done! Your file is ready.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() { setFiles([]); setResult(null); setProgress(0); }

  return (
    <div className="space-y-5">
      {/* Upload */}
      <FileUpload
        files={files}
        onAdd={(f) => setFiles((prev) => multiple ? [...prev, ...f] : [f[0]])}
        onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
        accept={accept}
        multiple={multiple}
        maxFiles={maxFiles}
        label={isImage ? 'Drop images here' : 'Drop PDF files here'}
        sublabel={isImage ? 'JPG, PNG, WebP supported' : 'PDF files only'}
      />

      {/* Options */}
      {files.length > 0 && !result && (
        <div className="glass-sm rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Options</p>
          {tool.id === 'img2pdf' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Page size</label>
                <select value={opts.pageSize} onChange={(e) => setOpts((o) => ({ ...o, pageSize: e.target.value }))} className="input text-sm">
                  {['A4','Letter','Legal'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Orientation</label>
                <select value={opts.orientation} onChange={(e) => setOpts((o) => ({ ...o, orientation: e.target.value }))} className="input text-sm">
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          )}
          {tool.id === 'compress' && (
            <div>
              <label className="input-label">Compression level</label>
              <select value={opts.quality} onChange={(e) => setOpts((o) => ({ ...o, quality: e.target.value }))} className="input text-sm">
                {['light','balanced','strong'].map((q) => <option key={q}>{q}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {loading && <ProgressBar value={progress} label="Processing…" />}

      {/* Result */}
      {result && (
        <div className="glass-sm rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-400">File ready!</p>
              {result.reductionPercent && (
                <p className="text-xs text-white/40">Reduced by {result.reductionPercent}%</p>
              )}
              {result.mergedCount && (
                <p className="text-xs text-white/40">Merged {result.mergedCount} files</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={result.downloadUrl || pdfAPI.downloadUrl(result.filename)}
              download
              className="btn-primary flex-1 justify-center"
            >
              <Download className="w-4 h-4" /> Download
            </a>
            <button onClick={reset} className="btn-secondary">New File</button>
          </div>
        </div>
      )}

      {!result && !loading && (
        <button onClick={handle} disabled={files.length === 0} className="btn-primary w-full justify-center py-3">
          <ArrowRight className="w-4 h-4" /> Process Files
        </button>
      )}
    </div>
  );
}

export default function PDFToolsPage() {
  const [activeTool, setActiveTool] = useState('img2pdf');
  const tool = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">PDF Tools</h1>
        <p className="text-muted text-sm mt-1">Professional document processing in your browser</p>
      </div>

      {/* Tool tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TOOLS.map(({ id, icon: Icon, label, color }) => (
          <button
            key={id}
            onClick={() => setActiveTool(id)}
            className={`glass rounded-2xl p-4 flex flex-col items-center gap-2 text-sm font-medium transition-all duration-200
              ${activeTool === id ? 'border-brand-500/40 bg-brand-500/5' : 'hover:border-white/15 hover:-translate-y-0.5'}`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {label}
          </button>
        ))}
      </div>

      {/* Active tool panel */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
            <tool.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-semibold">{tool.label}</h2>
            <p className="text-xs text-muted">{tool.desc}</p>
          </div>
        </div>
        <ToolPanel key={activeTool} tool={tool} />
      </div>
    </div>
  );
}
