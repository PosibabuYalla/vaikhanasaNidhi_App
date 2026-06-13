import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, Upload, Loader2, CheckCircle, AlertCircle,
  Save, Plus, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { extractTextFromPDF, parsePDFText } from '../lib/pdfParser';

const GOLD = 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)';
const GOLD_DARK = '#8B6200';

const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400 bg-white';

export default function PDFImportModal({ categories, onSave, onClose }) {
  const [step, setStep] = useState('upload'); // upload | parsing | review
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState(null);
  const [expandedVerses, setExpandedVerses] = useState({});
  const fileRef = useRef();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function setVerse(i, k, v) {
    setForm(f => {
      const verses = [...f.verses];
      verses[i] = { ...verses[i], [k]: v };
      return { ...f, verses };
    });
  }

  function addVerse() {
    setForm(f => ({ ...f, verses: [...f.verses, { telugu: '', meaning: '' }] }));
  }

  function removeVerse(i) {
    setForm(f => ({ ...f, verses: f.verses.filter((_, idx) => idx !== i) }));
  }

  async function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setFileName(file.name);
    setError('');
    setStep('parsing');
    try {
      const pages = await extractTextFromPDF(file);
      const parsed = parsePDFText(pages);
      setForm(parsed);
      setStep('review');
    } catch (e) {
      setError('Failed to read PDF. Make sure it contains selectable text (not scanned image).');
      setStep('upload');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.title_telugu.trim()) return;
    onSave(form);
  }

  function toggleVerse(i) {
    setExpandedVerses(v => ({ ...v, [i]: !v[i] }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
          style={{ background: GOLD }}>
          <div className="flex items-center gap-2">
            <FileText size={18} color={GOLD_DARK} />
            <h2 className="font-bold text-base" style={{ color: GOLD_DARK }}>
              Import from PDF
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20" style={{ color: GOLD_DARK }}>
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 py-3 gap-2 border-b border-gray-100"
          style={{ background: 'hsl(40 43% 97%)' }}>
          {['Upload PDF', 'Extracting', 'Review & Save'].map((s, i) => {
            const stepIds = ['upload', 'parsing', 'review'];
            const current = stepIds.indexOf(step);
            const active = i <= current;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: active ? GOLD : '#e5e7eb',
                      color: active ? GOLD_DARK : '#9ca3af',
                    }}>
                    {i < current ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block"
                    style={{ color: active ? GOLD_DARK : '#9ca3af' }}>{s}</span>
                </div>
                {i < 2 && <div className="flex-1 h-px mx-1" style={{ background: active && i < current ? GOLD_DARK + '44' : '#e5e7eb' }} />}
              </div>
            );
          })}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Upload ── */}
            {step === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all hover:border-amber-400 hover:bg-amber-50/30"
                  style={{ borderColor: '#E4B24B88' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: '#F6D67A33' }}>
                    <Upload size={28} color={GOLD_DARK} strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-base" style={{ color: GOLD_DARK }}>
                      Drop your PDF here
                    </p>
                    <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                    <p className="text-xs text-gray-300 mt-2">
                      Works best with text-based PDFs (not scanned images)
                    </p>
                  </div>
                  <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                    onChange={e => handleFile(e.target.files[0])} />
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 bg-red-50 rounded-xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <div className="mt-5 rounded-xl p-4 space-y-1.5" style={{ background: 'hsl(40 43% 96%)', border: '1px solid #E4B24B22' }}>
                  <p className="text-xs font-semibold" style={{ color: GOLD_DARK }}>Tips for best results:</p>
                  <p className="text-xs text-gray-500">• Use PDFs with copy-able Telugu text, not scanned pages</p>
                  <p className="text-xs text-gray-500">• Mantras/Stotras with verse numbers (॥1॥) parse best</p>
                  <p className="text-xs text-gray-500">• You can edit all extracted fields before saving</p>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Parsing ── */}
            {step === 'parsing' && (
              <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 py-12">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Loader2 size={40} color={GOLD_DARK} />
                </motion.div>
                <div className="text-center">
                  <p className="font-bold text-base" style={{ color: GOLD_DARK }}>Extracting text…</p>
                  <p className="text-sm text-gray-400 mt-1">Reading <span className="font-medium">{fileName}</span></p>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Review ── */}
            {step === 'review' && form && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <p className="text-sm font-semibold text-green-600">
                      Extracted {form.verses.length} verse{form.verses.length !== 1 ? 's' : ''} from <span className="text-gray-500">{fileName}</span>
                    </p>
                  </div>
                  <button onClick={() => { setStep('upload'); setForm(null); setFileName(''); }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                    <RefreshCw size={12} /> Re-upload
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Title (Telugu) *</label>
                      <input value={form.title_telugu} onChange={e => set('title_telugu', e.target.value)}
                        required className={inputCls}
                        style={{ fontFamily: 'Tiro Telugu, serif' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Title (English)</label>
                      <input value={form.title_english} onChange={e => set('title_english', e.target.value)}
                        placeholder="English name" className={inputCls} />
                    </div>
                  </div>

                  {/* Category + Deity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                      <select value={form.category} onChange={e => set('category', e.target.value)}
                        className={inputCls}>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.label_en || c.label} ({c.label})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Deity (Telugu)</label>
                      <input value={form.deity} onChange={e => set('deity', e.target.value)}
                        placeholder="విష్ణువు" className={inputCls}
                        style={{ fontFamily: 'Tiro Telugu, serif' }} />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                      rows={2} className={`${inputCls} resize-none`}
                      style={{ fontFamily: 'Tiro Telugu, serif' }} />
                  </div>

                  {/* Verses */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-600">
                        Verses <span className="text-gray-400 font-normal">({form.verses.length} extracted)</span>
                      </label>
                      <button type="button" onClick={addVerse}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: '#F6D67A55', color: GOLD_DARK }}>
                        <Plus size={12} /> Add
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {form.verses.map((v, i) => (
                        <div key={i} className="rounded-xl overflow-hidden"
                          style={{ border: '1px solid #E4B24B33' }}>
                          {/* Verse header — click to expand */}
                          <button type="button" onClick={() => toggleVerse(i)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-amber-50/40"
                            style={{ background: 'hsl(40 43% 97%)' }}>
                            <span className="text-xs font-semibold text-gray-500">
                              Verse {i + 1}
                              {v.telugu && (
                                <span className="ml-2 font-normal text-gray-400 truncate max-w-[180px] inline-block align-bottom">
                                  — {v.telugu.slice(0, 40)}{v.telugu.length > 40 ? '…' : ''}
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              {form.verses.length > 1 && (
                                <span onClick={e => { e.stopPropagation(); removeVerse(i); }}
                                  className="text-red-400 hover:text-red-600 p-0.5">
                                  <X size={13} />
                                </span>
                              )}
                              {expandedVerses[i] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </div>
                          </button>

                          {/* Expanded editor */}
                          {expandedVerses[i] && (
                            <div className="p-3 space-y-2 bg-white">
                              <textarea value={v.telugu} onChange={e => setVerse(i, 'telugu', e.target.value)}
                                rows={3} placeholder="తెలుగు పద్యం..."
                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-200 focus:border-amber-400 resize-none"
                                style={{ fontFamily: 'Tiro Telugu, serif' }} />
                              <textarea value={v.meaning} onChange={e => setVerse(i, 'meaning', e.target.value)}
                                rows={2} placeholder="Meaning / అర్థం..."
                                className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-200 focus:border-amber-400 resize-none"
                                style={{ fontFamily: 'Tiro Telugu, serif' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      Click any verse to expand and edit the extracted text.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200">
                      Cancel
                    </button>
                    <button type="submit"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                      style={{ background: GOLD, color: GOLD_DARK }}>
                      <Save size={15} /> Save Scripture
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
