import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, Upload, Loader2, CheckCircle, AlertCircle,
  Save, Plus, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { rebuildVersesFromPages } from '../lib/pdfParser';
import { renderPdfPagesToBlobs, titleFromPdfFilename, getPdfPageCount } from '../lib/pdfToImages';
import { uploadBookPageImages, uploadBookPdf } from '../api/uploadApi';
import { GOLD_TEXT } from '../constants/adminConstants';

export default function PDFImportModal({
  subcategories = [],
  defaultParentCategory = 'book',
  defaultSubcategory = 'scriptures',
  onSave,
  onClose,
  isSaving = false,
}) {
  const [step, setStep] = useState('upload');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState(null);
  const [parseWarning, setParseWarning] = useState('');
  const [parseProgress, setParseProgress] = useState(null);
  const [verseSearch, setVerseSearch] = useState('');
  const [versePage, setVersePage] = useState(0);
  const [expandedVerses, setExpandedVerses] = useState({});
  const [importMode, setImportMode] = useState('pdf');
  const [showImageFallback, setShowImageFallback] = useState(false);
  const fileRef = useRef();
  const pendingFileRef = useRef(null);

  const VERSES_PER_PAGE = 25;

  const bookSubs = subcategories.filter((s) => s.parent_key === defaultParentCategory);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleSubcategoryChange(subKey) {
    const sub = bookSubs.find((s) => s.key === subKey);
    setForm((f) => ({
      ...f,
      subcategory: subKey,
      category: sub?.filter_cat || sub?.parent_key || defaultParentCategory,
    }));
  }

  function setVerse(i, k, v) {
    setForm((f) => {
      const verses = [...f.verses];
      verses[i] = { ...verses[i], [k]: v };
      return { ...f, verses };
    });
  }

  function addVerse() {
    setForm((f) => ({ ...f, verses: [...f.verses, { telugu: '', meaning: '' }] }));
  }

  function removeVerse(i) {
    setForm((f) => ({ ...f, verses: f.verses.filter((_, idx) => idx !== i) }));
  }

  async function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setFileName(file.name);
    setError('');
    setParseWarning('');
    setParseProgress(null);
    setVerseSearch('');
    setVersePage(0);

    if (importMode === 'images') {
      await handleFileImages(file);
    } else {
      await handleFilePdf(file);
    }
  }

  async function retryAsPageImages() {
    const file = pendingFileRef.current;
    if (!file) {
      setImportMode('images');
      setError('Upload the same PDF again to use page images fallback.');
      return;
    }
    setImportMode('images');
    setError('');
    await handleFileImages(file);
  }

  async function handleFilePdf(file) {
    setStep('parsing');
    try {
      const totalPages = await getPdfPageCount(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

      setParseProgress({ phase: 'upload', current: 0, total: file.size });
      const uploaded = await uploadBookPdf(file, setParseProgress);

      const title = titleFromPdfFilename(file.name);
      setForm({
        title_telugu: title,
        title_english: '',
        parent_category: defaultParentCategory,
        subcategory: defaultSubcategory,
        category: defaultParentCategory,
        description: `${totalPages} pages — PDF book (${sizeMb} MB stored, pages shown on read)`,
        deity: '',
        popularity: 80,
        cover_url: null,
        pdf_url: uploaded.url,
        reading_layout: 'pdf_pages',
        page_count: totalPages,
        images: [],
        verses: [],
        importMode: 'pdf',
        fileSizeMb: sizeMb,
      });
      setParseWarning('');
      setParseProgress(null);
      setStep('review');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '';
      pendingFileRef.current = file;
      setShowImageFallback(true);
      setError(
        msg.includes('Cloudinary') || msg.includes('upload') || msg.includes('configured')
          ? 'PDF upload failed. Check Cloudinary is configured on the server.'
          : 'Failed to upload PDF. File may be too large (max 120 MB).'
      );
      setParseProgress(null);
      setStep('upload');
    }
  }

  async function handleFileImages(file) {
    setStep('parsing');
    try {
      let totalPages = 0;
      try {
        totalPages = await getPdfPageCount(file);
      } catch {
        totalPages = 0;
      }

      if (totalPages > 50) {
        const ok = window.confirm(
          `This PDF has ${totalPages} pages.\n\n`
          + 'Each page will be saved as an image (exact book look).\n'
          + 'Rendering and upload may take 10–30 minutes. Continue?'
        );
        if (!ok) {
          setStep('upload');
          return;
        }
      }

      setParseProgress({ phase: 'render', current: 0, total: totalPages || 1 });
      const rendered = await renderPdfPagesToBlobs(file, setParseProgress);

      setParseProgress({ phase: 'upload', current: 0, total: rendered.length });
      const images = await uploadBookPageImages(rendered, setParseProgress);

      const title = titleFromPdfFilename(file.name);
      setForm({
        title_telugu: title,
        title_english: '',
        parent_category: defaultParentCategory,
        subcategory: defaultSubcategory,
        category: defaultParentCategory,
        description: `${images.length} pages — original book images (exact PDF layout)`,
        deity: '',
        popularity: 80,
        cover_url: images[0]?.url || null,
        reading_layout: 'image_pages',
        page_count: images.length,
        images,
        verses: [],
        importMode: 'images',
      });
      setParseWarning('');
      setParseProgress(null);
      setStep('review');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '';
      setError(
        msg.includes('Cloudinary') || msg.includes('upload')
          ? 'Upload failed. Check Cloudinary is configured on the server.'
          : 'Failed to convert PDF to page images. Try a smaller PDF or check your connection.'
      );
      setParseProgress(null);
      setStep('upload');
    }
  }

  function handleClose() {
    onClose();
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.title_telugu.trim() || !form.subcategory) return;

    const isImageBook = form.reading_layout === 'image_pages' || form.importMode === 'images';
    const isPdfBook = form.reading_layout === 'pdf_pages' || form.importMode === 'pdf';

    if (isPdfBook) {
      if (!form.pdf_url?.trim()) return;
      onSave({
        title_telugu: form.title_telugu.trim(),
        title_english: form.title_english?.trim() || '',
        parent_category: form.parent_category || defaultParentCategory,
        subcategory: form.subcategory || defaultSubcategory,
        category: form.category || defaultParentCategory,
        description: form.description || '',
        deity: form.deity || '',
        popularity: form.popularity || 80,
        cover_url: form.cover_url || null,
        pdf_url: form.pdf_url.trim(),
        reading_layout: 'pdf_pages',
        page_count: form.page_count || 0,
        images: [],
        verses: [],
      });
      return;
    }

    if (isImageBook) {
      if (!form.images?.length) return;
      onSave({
        title_telugu: form.title_telugu.trim(),
        title_english: form.title_english?.trim() || '',
        parent_category: form.parent_category || defaultParentCategory,
        subcategory: form.subcategory || defaultSubcategory,
        category: form.category || defaultParentCategory,
        description: form.description || '',
        deity: form.deity || '',
        popularity: form.popularity || 80,
        cover_url: form.cover_url || form.images[0]?.url || null,
        reading_layout: 'image_pages',
        page_count: form.page_count || form.images.length,
        images: form.images,
        verses: [],
      });
      return;
    }

    const verses = form.verses
      .filter((v) => v.telugu?.trim() || v.meaning?.trim())
      .map(({ telugu, meaning, page_number, _page }) => ({
        telugu: telugu?.trim() || '',
        meaning: meaning?.trim() || '',
        page_number: page_number || _page || undefined,
      }));
    if (!verses.length) return;

    onSave({
      title_telugu: form.title_telugu.trim(),
      title_english: form.title_english?.trim() || '',
      parent_category: form.parent_category || defaultParentCategory,
      subcategory: form.subcategory || defaultSubcategory,
      category: form.category || defaultParentCategory,
      description: form.description || '',
      deity: form.deity || '',
      popularity: form.popularity || 80,
      cover_url: form.cover_url || null,
      reading_layout: form.reading_layout || (form.groupMode === 'page' ? 'paginated' : 'verses'),
      page_count: form.page_count || form.pageCount || verses.length,
      verses,
    });
  }

  function toggleVerse(i) {
    setExpandedVerses((v) => ({ ...v, [i]: !v[i] }));
  }

  function handleGroupModeChange(mode) {
    if (!form?.rawPages) return;
    const verses = rebuildVersesFromPages(form.rawPages, mode);
    setForm((f) => ({ ...f, groupMode: mode, verses }));
    setVersePage(0);
    setExpandedVerses({});
  }

  const isPdfBook = form?.reading_layout === 'pdf_pages' || form?.importMode === 'pdf';
  const isImageBook = form?.reading_layout === 'image_pages' || form?.importMode === 'images';
  const isParseBook = form?.importMode === 'parse' || (!isPdfBook && !isImageBook && form?.verses?.length);
  const isPageMode = form?.groupMode === 'page';
  const filteredVerseIndices = useMemo(() => {
    if (!form?.verses) return [];
    const q = verseSearch.trim().toLowerCase();
    return form.verses
      .map((v, i) => ({ v, i }))
      .filter(({ v, i }) => {
        if (!q) return true;
        const label = isPageMode ? `page ${v._page || i + 1}` : `verse ${i + 1}`;
        return label.includes(q)
          || v.telugu?.toLowerCase().includes(q)
          || v.meaning?.toLowerCase().includes(q);
      });
  }, [form?.verses, verseSearch, isPageMode]);

  const totalVersePages = Math.max(1, Math.ceil(filteredVerseIndices.length / VERSES_PER_PAGE));
  const safeVersePage = Math.min(versePage, totalVersePages - 1);
  const visibleVerses = filteredVerseIndices.slice(
    safeVersePage * VERSES_PER_PAGE,
    safeVersePage * VERSES_PER_PAGE + VERSES_PER_PAGE,
  );

  function verseLabel(v, i) {
    if (isPageMode) return `Page ${v._page || i + 1}`;
    return `Section ${i + 1}`;
  }

  const stepIds = ['upload', 'parsing', 'review'];
  const currentStep = stepIds.indexOf(step);

  function progressLabel() {
    if (!parseProgress) return '';
    const cur = Math.max(0, Number(parseProgress.current) || 0);
    const tot = Math.max(1, Number(parseProgress.total) || 1);

    if (parseProgress.phase === 'render') {
      return `Rendering page ${cur} of ${tot}`;
    }
    if (parseProgress.phase === 'parse') {
      return `Parsing page ${cur} of ${tot}`;
    }
    if (parseProgress.phase === 'upload' && parseProgress.total > 500) {
      const pct = Math.round((cur / tot) * 100);
      return `Uploading PDF… ${pct}%`;
    }
    if (parseProgress.phase === 'upload') {
      return `Uploading page ${cur} of ${tot}`;
    }
    return `Page ${cur} of ${tot}`;
  }

  function progressSubtitle() {
    if (parseProgress?.phase === 'render') {
      return `Converting ${fileName} to page images`;
    }
    if (parseProgress?.phase === 'upload') {
      return parseProgress.total > 500 ? `Uploading ${fileName}` : 'Uploading page images to server';
    }
    if (parseProgress?.phase === 'parse') {
      return `Extracting text from ${fileName}`;
    }
    return (
      <>
        Reading <span className="font-medium text-body">{fileName}</span>
      </>
    );
  }

  function progressPercent() {
    if (!parseProgress) return 0;
    const cur = Math.max(0, Number(parseProgress.current) || 0);
    const tot = Math.max(1, Number(parseProgress.total) || 1);
    if (parseProgress.phase === 'upload' && tot > 500) {
      return Math.min(100, (cur / tot) * 100);
    }
    return Math.min(100, (cur / tot) * 100);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto scrollbar-hide p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="corner-card rounded-2xl w-full max-w-3xl shadow-2xl my-4 bg-card flex flex-col max-h-[min(92vh,860px)]"
      >
        <div className="flex items-center justify-between px-6 py-4 panel-header-bar flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: GOLD_TEXT }} />
            <h2 className="font-bold text-base gold-glow">Import Book from PDF</h2>
          </div>
          <button type="button" onClick={handleClose} className="p-1 rounded-lg hover:bg-white/5" style={{ color: GOLD_TEXT }}>
            <X size={18} />
          </button>
        </div>

        <div className="pdf-import-steps flex items-center px-6 py-3 gap-2 flex-shrink-0">
          {['Upload PDF', 'Extracting', 'Review & Save'].map((label, i) => {
            const active = i <= currentStep;
            const done = i < currentStep;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className={`pdf-import-step-dot w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${active ? 'pdf-import-step-dot--active' : ''}`}>
                    {done ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${active ? 'gold-glow' : 'text-muted'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="flex-1 h-px mx-1"
                    style={{ background: done ? 'var(--border-medium)' : 'var(--border-subtle)' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto scrollbar-hide flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {importMode === 'images' && (
                  <div className="mb-4 rounded-xl p-3 flex items-start gap-2"
                    style={{ border: '1px solid #C88F2D44', background: 'var(--bg-elevated)' }}>
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold gold-glow">Fallback: page images</p>
                      <p className="text-xs text-muted mt-1">
                        Each page is stored separately (~100+ MB per book). Use only if PDF book upload failed.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setImportMode('pdf'); setShowImageFallback(false); setError(''); pendingFileRef.current = null; }}
                        className="text-xs text-primary-gold mt-2 hover:underline"
                      >
                        ← Back to PDF book (recommended)
                      </button>
                    </div>
                  </div>
                )}

                <div
                  role="button"
                  tabIndex={0}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); }}
                  className="pdf-import-drop rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
                    <Upload size={28} style={{ color: GOLD_TEXT }} strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-base gold-glow">Drop your PDF here</p>
                    <p className="text-sm text-muted mt-1">or click to browse</p>
                    <p className="text-xs text-muted mt-2 opacity-70">
                      {importMode === 'images'
                        ? 'Each page saved as a separate image (high storage)'
                        : 'One PDF file — stored once, pages shown when reading (low storage)'}
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>

                {error && (
                  <div className="mt-4 form-error flex items-start gap-2">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {showImageFallback && importMode === 'pdf' && (
                  <div className="mt-4 rounded-xl p-4 space-y-3"
                    style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-elevated)' }}>
                    <p className="text-xs font-semibold text-body">PDF book failed — try fallback?</p>
                    <p className="text-xs text-muted">
                      Page images mode saves each page separately. It uses much more Cloudinary storage
                      but works when PDF upload cannot complete.
                    </p>
                    <button
                      type="button"
                      onClick={retryAsPageImages}
                      className="text-xs font-semibold px-4 py-2 rounded-lg btn-ghost"
                      style={{ border: '1px solid var(--border-medium)' }}
                    >
                      Upload as page images (fallback)
                    </button>
                  </div>
                )}

                <div className="pdf-import-tips mt-5 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-semibold gold-glow">Tips:</p>
                  {importMode === 'images' ? (
                    <>
                      <p className="text-xs text-muted">• Fallback only — uses ~100+ MB per book on Cloudinary</p>
                      <p className="text-xs text-muted">• Large books may take 10–30 min to render and upload</p>
                      <p className="text-xs text-muted">• Prefer PDF book mode when possible</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted">• Stores only 1 PDF file (not hundreds of images)</p>
                      <p className="text-xs text-muted">• Readers see exact book pages — rendered on device</p>
                      <p className="text-xs text-muted">• Max PDF size 120 MB · Cloudinary required</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'parsing' && (
              <motion.div
                key="parsing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 py-12"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Loader2 size={40} style={{ color: GOLD_TEXT }} />
                </motion.div>
                <div className="text-center w-full max-w-xs">
                  <p className="font-bold text-base gold-glow">
                    {parseProgress?.phase === 'upload'
                      ? (parseProgress.total > 500 ? 'Uploading PDF…' : 'Uploading page images…')
                      : parseProgress?.phase === 'render'
                        ? 'Rendering PDF pages…'
                        : parseProgress?.phase === 'parse'
                          ? 'Parsing PDF text…'
                          : 'Processing…'}
                  </p>
                  <p className="text-sm text-muted mt-1 truncate">
                    {progressSubtitle()}
                  </p>
                  {parseProgress && (
                    <div className="mt-4">
                      <p className="text-xs text-muted mb-2">
                        {progressLabel()}
                      </p>
                      <div className="h-2 rounded-full bg-elevated overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-200"
                          style={{
                            width: `${progressPercent()}%`,
                            background: 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'review' && form && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-green-500 truncate">
                      {isPdfBook
                        ? `${form.page_count || 0} pages · PDF uploaded (${form.fileSizeMb || '?'} MB)`
                        : isImageBook
                          ? `${form.page_count || form.images?.length || 0} page images ready`
                          : `${form.pageCount ? `${form.pageCount} pages` : ''} → ${form.verses.length} section${form.verses.length !== 1 ? 's' : ''}`}
                      {' '}
                      <span className="text-muted font-normal">({fileName})</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('upload');
                      setForm(null);
                      setFileName('');
                      setParseWarning('');
                      setVerseSearch('');
                      setVersePage(0);
                      setExpandedVerses({});
                      setImportMode('pdf');
                      setShowImageFallback(false);
                      pendingFileRef.current = null;
                    }}
                    className="flex items-center gap-1 text-xs text-muted hover:text-body flex-shrink-0"
                  >
                    <RefreshCw size={12} /> Re-upload
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {parseWarning && (
                    <div className="form-error flex items-start gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <p>{parseWarning}</p>
                    </div>
                  )}

                  {isPdfBook && form.pdf_url && (
                    <div className="rounded-xl p-4" style={{ border: '1px solid #C88F2D33', background: 'var(--bg-elevated)' }}>
                      <p className="text-xs font-semibold gold-glow mb-2">PDF stored on server</p>
                      <p className="text-xs text-muted break-all">{form.pdf_url}</p>
                      <p className="text-xs text-muted mt-3">
                        {form.page_count} pages will render in the app exactly like the printed book.
                        Only one PDF file is stored — not hundreds of images.
                      </p>
                    </div>
                  )}

                  {isImageBook && form.images?.length > 0 && (
                    <div className="rounded-xl p-4" style={{ border: '1px solid #C88F2D33', background: 'var(--bg-elevated)' }}>
                      <p className="text-xs font-semibold gold-glow mb-3">
                        Page preview (first 6 of {form.images.length})
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {form.images.slice(0, 6).map((img) => (
                          <div key={img.url} className="rounded-lg overflow-hidden border border-[var(--border-subtle)]">
                            <img src={img.url} alt={img.caption} className="w-full h-auto bg-white" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted mt-3">
                        Readers will flip through exact PDF pages — same as the printed book.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Title (Telugu) *</label>
                      <input
                        value={form.title_telugu}
                        onChange={(e) => set('title_telugu', e.target.value)}
                        required
                        className="form-input"
                        style={{ fontFamily: 'Tiro Telugu, serif' }}
                      />
                    </div>
                    <div>
                      <label className="form-label">Title (English)</label>
                      <input
                        value={form.title_english}
                        onChange={(e) => set('title_english', e.target.value)}
                        placeholder="English name"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Book Subcategory *</label>
                      <select
                        value={form.subcategory || defaultSubcategory}
                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                        required
                        className="form-select"
                      >
                        {bookSubs.map((sub) => (
                          <option key={sub.key} value={sub.key}>
                            {sub.label_en || sub.label} — {sub.label_te || sub.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Deity (Telugu)</label>
                      <input
                        value={form.deity}
                        onChange={(e) => set('deity', e.target.value)}
                        placeholder="విష్ణువు"
                        className="form-input"
                        style={{ fontFamily: 'Tiro Telugu, serif' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      rows={2}
                      className="form-textarea resize-none"
                      style={{ fontFamily: 'Tiro Telugu, serif' }}
                    />
                  </div>

                  {!isImageBook && !isPdfBook && isParseBook && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <label className="form-label mb-0">
                        Content sections <span className="text-muted font-normal">({form.verses.length} total)</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {form.rawPages?.length >= 15 && (
                          <select
                            value={form.groupMode || 'page'}
                            onChange={(e) => handleGroupModeChange(e.target.value)}
                            className="form-select text-xs py-1.5 px-2 w-auto min-w-[140px]"
                          >
                            <option value="page">One per page</option>
                            <option value="paragraph">Per paragraph</option>
                          </select>
                        )}
                        <button type="button" onClick={addVerse} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg btn-ghost">
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    </div>

                    {form.verses.length > 10 && (
                      <input
                        type="search"
                        value={verseSearch}
                        onChange={(e) => { setVerseSearch(e.target.value); setVersePage(0); }}
                        placeholder="Search sections..."
                        className="form-input text-sm mb-2"
                      />
                    )}

                    <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide pr-1">
                      {visibleVerses.map(({ v, i }) => (
                        <div
                          key={i}
                          className="rounded-xl overflow-hidden bg-elevated"
                          style={{ border: '1px solid var(--border-subtle)' }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleVerse(i)}
                            className="pdf-import-verse-header w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors"
                          >
                            <span className="text-xs font-semibold text-muted min-w-0">
                              {verseLabel(v, i)}
                              {v.telugu && (
                                <span className="ml-2 font-normal text-body truncate max-w-[220px] sm:max-w-[320px] inline-block align-bottom">
                                  — {v.telugu.slice(0, 50)}{v.telugu.length > 50 ? '…' : ''}
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {form.verses.length > 1 && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => { e.stopPropagation(); removeVerse(i); }}
                                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); removeVerse(i); } }}
                                  className="text-red-400 hover:text-red-300 p-0.5"
                                >
                                  <X size={13} />
                                </span>
                              )}
                              {expandedVerses[i]
                                ? <ChevronUp size={14} className="text-muted" />
                                : <ChevronDown size={14} className="text-muted" />}
                            </div>
                          </button>

                          {expandedVerses[i] && (
                            <div className="p-3 space-y-2 bg-card" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                              <textarea
                                value={v.telugu}
                                onChange={(e) => setVerse(i, 'telugu', e.target.value)}
                                rows={isPageMode ? 6 : 3}
                                placeholder="తెలుగు వచనం..."
                                className="form-textarea resize-none"
                                style={{ fontFamily: 'Tiro Telugu, serif' }}
                              />
                              <textarea
                                value={v.meaning}
                                onChange={(e) => setVerse(i, 'meaning', e.target.value)}
                                rows={isPageMode ? 4 : 2}
                                placeholder="Meaning / అర్థం..."
                                className="form-textarea resize-none"
                                style={{ fontFamily: 'Tiro Telugu, serif' }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {filteredVerseIndices.length === 0 && (
                      <p className="text-xs text-muted mt-2">No sections match your search.</p>
                    )}

                    {totalVersePages > 1 && (
                      <div className="flex items-center justify-between mt-3 gap-2">
                        <button
                          type="button"
                          disabled={safeVersePage === 0}
                          onClick={() => setVersePage((p) => Math.max(0, p - 1))}
                          className="text-xs px-3 py-1.5 rounded-lg btn-ghost disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <span className="text-xs text-muted tabular-nums">
                          {safeVersePage + 1} / {totalVersePages}
                          {' · '}
                          showing {visibleVerses.length} of {filteredVerseIndices.length}
                        </span>
                        <button
                          type="button"
                          disabled={safeVersePage >= totalVersePages - 1}
                          onClick={() => setVersePage((p) => Math.min(totalVersePages - 1, p + 1))}
                          className="text-xs px-3 py-1.5 rounded-lg btn-ghost disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-muted mt-2">
                      {isPageMode
                        ? 'Each section is one PDF page. Readers see one page at a time.'
                        : 'Click any section to expand and edit the parsed text.'}
                    </p>
                  </div>
                  )}

                  <div className="modal-actions modal-actions--inline">
                    <button type="button" onClick={handleClose} disabled={isSaving} className="modal-btn btn-ghost disabled:opacity-50">
                      <span className="modal-btn-label">Cancel</span>
                    </button>
                    <button type="submit" disabled={isSaving} className="modal-btn modal-btn-primary btn-gold disabled:opacity-50">
                      {isSaving
                        ? <Loader2 size={14} className="modal-btn-icon animate-spin" />
                        : <Save size={14} className="modal-btn-icon" />}
                      <span className="modal-btn-label">{isSaving ? 'Saving…' : 'Save Book'}</span>
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
