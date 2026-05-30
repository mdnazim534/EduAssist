import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  User, Briefcase, GraduationCap, Code, FolderOpen, Award,
  Plus, Trash2, Eye, Download, Save, ChevronDown, ChevronUp,
  Link, Share2, Check, Globe
} from 'lucide-react';
import { cvAPI } from '../api/client';
import { Spinner, ProgressBar } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

// ─── Default CV data ──────────────────────────────────────────────────────────
const BLANK_CV = {
  title: 'My CV',
  template: 't1',
  personal: {
    name: 'Alex Johnson', role: 'Full Stack Developer',
    email: 'alex@example.com', phone: '+1 (555) 000-0000',
    location: 'New York, NY', website: '', linkedin: 'linkedin.com/in/alexj',
    github: 'github.com/alexj', summary: 'Results-driven developer with 4+ years building scalable web applications. Passionate about clean code and delivering exceptional user experiences.',
  },
  education: [{ degree: 'BSc Computer Science', institution: 'MIT', startYear: '2020', endYear: '2024', gpa: '3.9/4.0', description: '' }],
  experience: [{ title: 'Senior Frontend Developer', company: 'TechCorp Inc.', location: 'New York', startDate: '2022', endDate: '', current: true, description: 'Led development of React-based dashboard serving 50K+ users. Reduced load time by 40% through code splitting. Mentored 3 junior developers.', achievements: [] }],
  skills: { technical: ['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'AWS', 'Docker'], soft: ['Leadership', 'Problem Solving', 'Agile'], languages: [], tools: [] },
  projects: [{ name: 'EduAssist Platform', description: 'AI-powered student productivity platform built with React, Node.js, MongoDB. 5K+ users.', url: '', github: 'github.com/alexj/eduassist', tech: ['React', 'Node.js', 'MongoDB', 'AI'] }],
  certifications: [],
};

const TEMPLATES = [
  { id: 't1', name: 'Modern Gradient', accent: 'from-purple-600 to-blue-500' },
  { id: 't2', name: 'Dark Pro',        accent: 'from-gray-900 to-gray-700' },
  { id: 't3', name: 'Clean Split',     accent: 'from-white to-purple-50' },
];

// ─── Collapsible section wrapper ─────────────────────────────────────────────
function Section({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-brand-400" />
          </div>
          <span className="font-display font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3 border-t border-white/6">{children}</div>}
    </div>
  );
}

// ─── Small input helpers ──────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder = '', className = '' }) {
  return (
    <div className={className}>
      <label className="input-label">{label}</label>
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input text-sm py-2" />
    </div>
  );
}
function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={rows} className="input text-sm py-2 resize-y" />
    </div>
  );
}
function TagInput({ label, values = [], onChange }) {
  const [draft, setDraft] = useState('');
  function add(e) {
    if ((e.key === 'Enter' || e.key === ',') && draft.trim()) {
      e.preventDefault();
      onChange([...values, draft.trim()]);
      setDraft('');
    }
  }
  function remove(i) { onChange(values.filter((_, idx) => idx !== i)); }
  return (
    <div>
      <label className="input-label">{label} <span className="text-white/20">(press Enter to add)</span></label>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={add} placeholder="Type and press Enter…" className="input text-sm py-2 mb-2" />
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={i} className="badge badge-brand cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20 transition-colors" onClick={() => remove(i)}>
            {v} ×
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── CV Preview ───────────────────────────────────────────────────────────────
function CVPreview({ cv }) {
  const { personal, education = [], experience = [], skills = {}, projects = [], certifications = [], template = 't1' } = cv;

  const headerBg = {
    t1: 'linear-gradient(135deg, #7c5cfc, #5c9cfc)',
    t2: 'linear-gradient(135deg, #111, #222)',
    t3: '#ffffff',
  }[template];
  const headerTextColor = template === 't3' ? '#111' : '#fff';
  const accentColor = template === 't3' ? '#7c5cfc' : (template === 't2' ? '#5c9cfc' : '#fff');
  const tagBg = template === 't3' ? '#f0e8ff' : 'rgba(255,255,255,0.15)';
  const tagColor = template === 't3' ? '#6c3cec' : '#fff';
  const bodyBg = '#fff';

  return (
    <div style={{ background: bodyBg, color: '#111', fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.5, minHeight: 500, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
      {/* Header */}
      <div style={{ background: headerBg, color: headerTextColor, padding: '24px 28px 20px' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{personal.name || 'Your Name'}</div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{personal.role}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10, fontSize: 10, opacity: 0.75 }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 0 }}>
        {/* Left col */}
        <div style={{ padding: '20px 16px 20px 24px', borderRight: '1px solid #eee' }}>
          {/* Skills */}
          {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c5cfc', borderBottom: '1px solid #eee', paddingBottom: 4, marginBottom: 8 }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {[...(skills.technical || []), ...(skills.soft || [])].map((s, i) => (
                  <span key={i} style={{ background: tagBg, color: tagColor, borderRadius: 99, padding: '2px 8px', fontSize: 9, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c5cfc', borderBottom: '1px solid #eee', paddingBottom: 4, marginBottom: 8 }}>Education</div>
              {education.map((e, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{e.degree}</div>
                  <div style={{ color: '#555', fontSize: 10 }}>{e.institution}</div>
                  <div style={{ color: '#888', fontSize: 9 }}>{e.startYear}–{e.endYear || 'Present'}</div>
                  {e.gpa && <div style={{ color: '#7c5cfc', fontSize: 9 }}>GPA: {e.gpa}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c5cfc', borderBottom: '1px solid #eee', paddingBottom: 4, marginBottom: 8 }}>Certifications</div>
              {certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 10 }}>{c.name}</div>
                  <div style={{ color: '#888', fontSize: 9 }}>{c.issuer} · {c.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right col */}
        <div style={{ padding: '20px 24px 20px 16px' }}>
          {/* Summary */}
          {personal.summary && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c5cfc', borderBottom: '1px solid #eee', paddingBottom: 4, marginBottom: 8 }}>Summary</div>
              <div style={{ fontSize: 10, color: '#555', lineHeight: 1.6 }}>{personal.summary}</div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c5cfc', borderBottom: '1px solid #eee', paddingBottom: 4, marginBottom: 8 }}>Experience</div>
              {experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{e.title}</div>
                  <div style={{ color: '#555', fontSize: 10 }}>{e.company}{e.location ? ` · ${e.location}` : ''}</div>
                  <div style={{ color: '#888', fontSize: 9 }}>{e.startDate} – {e.current ? 'Present' : e.endDate}</div>
                  <div style={{ fontSize: 10, color: '#444', marginTop: 4, lineHeight: 1.5 }}>{e.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c5cfc', borderBottom: '1px solid #eee', paddingBottom: 4, marginBottom: 8 }}>Projects</div>
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{p.description}</div>
                  {p.tech?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                      {p.tech.map((t, j) => <span key={j} style={{ background: tagBg, color: tagColor, borderRadius: 99, padding: '1px 6px', fontSize: 9 }}>{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CVBuilderPage() {
  const [cv, setCv] = useState(BLANK_CV);
  const [cvId, setCvId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const autoSaveTimer = useRef(null);

  function update(path, value) {
    setCv((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setSaved(false);
    // debounce auto-save
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => handleSave(false), 3000);
  }

  // list helpers
  function addItem(key, blank) { setCv((p) => ({ ...p, [key]: [...(p[key] || []), blank] })); setSaved(false); }
  function removeItem(key, idx) { setCv((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) })); setSaved(false); }
  function updateItem(key, idx, field, val) {
    setCv((p) => {
      const arr = [...(p[key] || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...p, [key]: arr };
    });
    setSaved(false);
  }

  async function handleSave(showToast = true) {
    setSaving(true);
    try {
      if (cvId) {
        await cvAPI.update(cvId, cv);
      } else {
        const res = await cvAPI.create(cv);
        setCvId(res.cv._id);
      }
      setSaved(true);
      if (showToast) toast.success('CV saved!');
    } catch (e) {
      if (showToast) toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    if (!cvId) {
      await handleSave(false);
    }
    if (!cvId) { toast.error('Save your CV first'); return; }
    setExporting(true);
    try {
      await cvAPI.exportPdf(cvId);
      toast.success('PDF downloaded!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setExporting(false);
    }
  }

  const p = cv.personal;

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">CV Builder</h1>
          <p className="text-muted text-sm mt-1">Live preview updates as you type</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode(!previewMode)} className="btn-ghost lg:hidden">
            <Eye className="w-4 h-4" /> {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-secondary">
            {saving ? <Spinner size="sm" /> : saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={handleExport} disabled={exporting} className="btn-primary">
            {exporting ? <Spinner size="sm" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* ── Editor ────────────────────────────────────────────────────── */}
        <div className={`space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 ${previewMode ? 'hidden lg:block' : ''}`}>
          {/* Template picker */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Template</p>
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => update('template', t.id)}
                  className={`rounded-xl border-2 p-3 text-center transition-all ${cv.template === t.id ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/20'}`}>
                  <div className={`h-10 rounded-lg bg-gradient-to-br ${t.accent} mb-2`} />
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="input-label">CV Title (internal)</label>
              <input value={cv.title} onChange={(e) => update('title', e.target.value)} className="input text-sm py-2" />
            </div>
          </div>

          {/* Personal Info */}
          <Section icon={User} title="Personal Information">
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Field label="Full Name" value={p.name} onChange={(v) => update('personal.name', v)} className="col-span-2" />
              <Field label="Job Title / Role" value={p.role} onChange={(v) => update('personal.role', v)} className="col-span-2" />
              <Field label="Email" value={p.email} onChange={(v) => update('personal.email', v)} type="email" />
              <Field label="Phone" value={p.phone} onChange={(v) => update('personal.phone', v)} />
              <Field label="Location" value={p.location} onChange={(v) => update('personal.location', v)} />
              <Field label="Website" value={p.website} onChange={(v) => update('personal.website', v)} />
              <Field label="LinkedIn" value={p.linkedin} onChange={(v) => update('personal.linkedin', v)} />
              <Field label="GitHub" value={p.github} onChange={(v) => update('personal.github', v)} />
            </div>
            <TextArea label="Professional Summary" value={p.summary} onChange={(v) => update('personal.summary', v)} rows={4} />
          </Section>

          {/* Experience */}
          <Section icon={Briefcase} title="Experience">
            <div className="pt-4 space-y-5">
              {cv.experience.map((exp, i) => (
                <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40">Position {i + 1}</span>
                    <button onClick={() => removeItem('experience', i)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Job Title" value={exp.title} onChange={(v) => updateItem('experience', i, 'title', v)} />
                    <Field label="Company" value={exp.company} onChange={(v) => updateItem('experience', i, 'company', v)} />
                    <Field label="Location" value={exp.location} onChange={(v) => updateItem('experience', i, 'location', v)} />
                    <Field label="Start Date" value={exp.startDate} onChange={(v) => updateItem('experience', i, 'startDate', v)} placeholder="2022" />
                    <Field label="End Date" value={exp.endDate} onChange={(v) => updateItem('experience', i, 'endDate', v)} placeholder="2024 (leave blank if current)" />
                    <div className="flex items-center gap-2 pt-4">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateItem('experience', i, 'current', e.target.checked)} id={`cur-${i}`} className="w-4 h-4 accent-brand-500" />
                      <label htmlFor={`cur-${i}`} className="text-sm text-white/60">Currently working here</label>
                    </div>
                  </div>
                  <TextArea label="Description" value={exp.description} onChange={(v) => updateItem('experience', i, 'description', v)} rows={3} />
                </div>
              ))}
              <button onClick={() => addItem('experience', { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' })} className="btn-ghost w-full justify-center border border-dashed border-white/10 py-2.5">
                <Plus className="w-4 h-4" /> Add Position
              </button>
            </div>
          </Section>

          {/* Education */}
          <Section icon={GraduationCap} title="Education">
            <div className="pt-4 space-y-4">
              {cv.education.map((edu, i) => (
                <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40">Degree {i + 1}</span>
                    <button onClick={() => removeItem('education', i)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Degree" value={edu.degree} onChange={(v) => updateItem('education', i, 'degree', v)} className="col-span-2" />
                    <Field label="Institution" value={edu.institution} onChange={(v) => updateItem('education', i, 'institution', v)} className="col-span-2" />
                    <Field label="Start Year" value={edu.startYear} onChange={(v) => updateItem('education', i, 'startYear', v)} />
                    <Field label="End Year" value={edu.endYear} onChange={(v) => updateItem('education', i, 'endYear', v)} />
                    <Field label="GPA / Grade" value={edu.gpa} onChange={(v) => updateItem('education', i, 'gpa', v)} />
                  </div>
                </div>
              ))}
              <button onClick={() => addItem('education', { degree: '', institution: '', startYear: '', endYear: '', gpa: '' })} className="btn-ghost w-full justify-center border border-dashed border-white/10 py-2.5">
                <Plus className="w-4 h-4" /> Add Degree
              </button>
            </div>
          </Section>

          {/* Skills */}
          <Section icon={Code} title="Skills">
            <div className="pt-4 space-y-4">
              <TagInput label="Technical Skills" values={cv.skills.technical || []} onChange={(v) => update('skills.technical', v)} />
              <TagInput label="Soft Skills" values={cv.skills.soft || []} onChange={(v) => update('skills.soft', v)} />
              <TagInput label="Languages" values={cv.skills.languages || []} onChange={(v) => update('skills.languages', v)} />
              <TagInput label="Tools & Frameworks" values={cv.skills.tools || []} onChange={(v) => update('skills.tools', v)} />
            </div>
          </Section>

          {/* Projects */}
          <Section icon={FolderOpen} title="Projects">
            <div className="pt-4 space-y-4">
              {cv.projects.map((proj, i) => (
                <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40">Project {i + 1}</span>
                    <button onClick={() => removeItem('projects', i)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Project Name" value={proj.name} onChange={(v) => updateItem('projects', i, 'name', v)} className="col-span-2" />
                    <Field label="URL" value={proj.url} onChange={(v) => updateItem('projects', i, 'url', v)} />
                    <Field label="GitHub" value={proj.github} onChange={(v) => updateItem('projects', i, 'github', v)} />
                  </div>
                  <TextArea label="Description" value={proj.description} onChange={(v) => updateItem('projects', i, 'description', v)} rows={2} />
                  <TagInput label="Tech Stack" values={proj.tech || []} onChange={(v) => updateItem('projects', i, 'tech', v)} />
                </div>
              ))}
              <button onClick={() => addItem('projects', { name: '', description: '', url: '', github: '', tech: [] })} className="btn-ghost w-full justify-center border border-dashed border-white/10 py-2.5">
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
          </Section>

          {/* Certifications */}
          <Section icon={Award} title="Certifications" defaultOpen={false}>
            <div className="pt-4 space-y-3">
              {cv.certifications.map((cert, i) => (
                <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40">Cert {i + 1}</span>
                    <button onClick={() => removeItem('certifications', i)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Name" value={cert.name} onChange={(v) => updateItem('certifications', i, 'name', v)} className="col-span-2" />
                    <Field label="Issuer" value={cert.issuer} onChange={(v) => updateItem('certifications', i, 'issuer', v)} />
                    <Field label="Date" value={cert.date} onChange={(v) => updateItem('certifications', i, 'date', v)} />
                    <Field label="URL" value={cert.url} onChange={(v) => updateItem('certifications', i, 'url', v)} className="col-span-2" />
                  </div>
                </div>
              ))}
              <button onClick={() => addItem('certifications', { name: '', issuer: '', date: '', url: '' })} className="btn-ghost w-full justify-center border border-dashed border-white/10 py-2.5">
                <Plus className="w-4 h-4" /> Add Certification
              </button>
            </div>
          </Section>
        </div>

        {/* ── Live Preview ──────────────────────────────────────────────── */}
        <div className={`sticky top-0 h-[calc(100vh-200px)] overflow-y-auto ${!previewMode ? 'hidden lg:block' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-white/40" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Live Preview</span>
            </div>
            <span className="badge badge-green text-xs">● ATS Friendly</span>
          </div>
          <CVPreview cv={cv} />
        </div>
      </div>
    </div>
  );
}
