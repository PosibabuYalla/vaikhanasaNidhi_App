import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Tag, Plus, Pencil, Trash2, X,
  Save, ChevronRight, LogOut, Search, BookMarked, Layers, ImagePlus, Image, FileUp, GalleryHorizontal
} from 'lucide-react';
import { getScriptures, saveScripture, deleteScripture, getCategories, saveCategory, deleteCategory } from '../store/scriptureStore';
import { logout } from '../store/authStore';
import logo from '../assets/images/logo.png';
import PDFImportModal from '../components/PDFImportModal';
import ImagesTab from './ImagesTab';

const GOLD = 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)';
const GOLD_DARK = '#8B6200';
const GOLD_SOLID = '#C88F2D';

const COLOR_OPTIONS = [
  { value: 'from-rose-700 to-red-900', label: 'Rose' },
  { value: 'from-orange-600 to-amber-800', label: 'Orange' },
  { value: 'from-purple-700 to-violet-900', label: 'Purple' },
  { value: 'from-blue-700 to-indigo-900', label: 'Blue' },
  { value: 'from-teal-700 to-emerald-900', label: 'Teal' },
  { value: 'from-yellow-600 to-amber-700', label: 'Yellow' },
  { value: 'from-sky-600 to-blue-800', label: 'Sky' },
  { value: 'from-stone-600 to-stone-800', label: 'Stone' },
  { value: 'from-green-700 to-lime-800', label: 'Green' },
  { value: 'from-pink-600 to-fuchsia-800', label: 'Pink' },
];

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'scriptures', label: 'Scriptures',  icon: BookOpen },
  { id: 'categories', label: 'Categories',  icon: Tag },
  { id: 'images',     label: 'Images',      icon: GalleryHorizontal },
];

/* ─── small reusable ─── */
function Badge({ label, color }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${color}`}>
      {label}
    </span>
  );
}

function Confirm({ message, onYes, onNo }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl text-center">
        <p className="text-sm font-semibold text-gray-700 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onNo} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200">Cancel</button>
          <button onClick={onYes} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Scripture Form Modal ─── */
function ScriptureModal({ scripture, categories, onSave, onClose }) {
  const isEdit = !!scripture?.id;
  const [form, setForm] = useState(
    scripture || { title_telugu: '', title_english: '', category: categories[0]?.id || '', deity: '', description: '', popularity: 80, cover_url: null, verses: [{ telugu: '', meaning: '' }] }
  );

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('cover_url', ev.target.result);
    reader.readAsDataURL(file);
  }

  function setVerse(i, k, v) {
    setForm(f => {
      const verses = [...f.verses];
      verses[i] = { ...verses[i], [k]: v };
      return { ...f, verses };
    });
  }

  function addVerse() { setForm(f => ({ ...f, verses: [...f.verses, { telugu: '', meaning: '' }] })); }
  function removeVerse(i) { setForm(f => ({ ...f, verses: f.verses.filter((_, idx) => idx !== i) })); }

  function handleSave(e) {
    e.preventDefault();
    if (!form.title_telugu.trim()) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background: GOLD }}>
          <h2 className="font-bold text-base" style={{ color: GOLD_DARK }}>
            {isEdit ? 'Edit Scripture' : 'Add New Scripture'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20" style={{ color: GOLD_DARK }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title (Telugu) *</label>
              <input value={form.title_telugu} onChange={e => set('title_telugu', e.target.value)}
                placeholder="స్తోత్రం పేరు" required
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400"
                style={{ fontFamily: 'Tiro Telugu, serif' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title (English)</label>
              <input value={form.title_english} onChange={e => set('title_english', e.target.value)}
                placeholder="Stotra Name"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400 bg-white">
                {categories.map(c => <option key={c.id} value={c.id}>{c.label_en || c.label} ({c.label})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Deity (Telugu)</label>
              <input value={form.deity} onChange={e => set('deity', e.target.value)}
                placeholder="విష్ణువు"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400"
                style={{ fontFamily: 'Tiro Telugu, serif' }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={2} placeholder="వివరణ..."
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400 resize-none"
              style={{ fontFamily: 'Tiro Telugu, serif' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Popularity (0–100)</label>
              <input type="number" min={0} max={100} value={form.popularity} onChange={e => set('popularity', +e.target.value)}
                className="w-32 rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400" />
            </div>

            {/* Deity Photo */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Deity Photo <span className="font-normal text-gray-400">(optional)</span></label>
              <div className="flex items-center gap-3">
                {/* Preview */}
                <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ background: 'hsl(40 43% 94%)', border: '1.5px dashed #E4B24B88' }}>
                  {form.cover_url
                    ? <img src={form.cover_url} alt="deity" className="w-full h-full object-cover" />
                    : <Image size={22} color="#C88F2D" strokeWidth={1.5} />}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-amber-100"
                    style={{ background: '#F6D67A55', color: GOLD_DARK }}>
                    <ImagePlus size={13} />
                    {form.cover_url ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {form.cover_url && (
                    <button type="button" onClick={() => set('cover_url', null)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 px-1">
                      <X size={11} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">Verses</label>
              <button type="button" onClick={addVerse}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: '#F6D67A55', color: GOLD_DARK }}>
                <Plus size={12} /> Add Verse
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {form.verses.map((v, i) => (
                <div key={i} className="rounded-xl p-3 relative" style={{ background: 'hsl(40 43% 97%)', border: '1px solid #E4B24B33' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400">Verse {i + 1}</span>
                    {form.verses.length > 1 && (
                      <button type="button" onClick={() => removeVerse(i)}
                        className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                  <textarea value={v.telugu} onChange={e => setVerse(i, 'telugu', e.target.value)}
                    rows={2} placeholder="తెలుగు పద్యం..."
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-200 focus:border-amber-400 resize-none mb-2"
                    style={{ fontFamily: 'Tiro Telugu, serif' }} />
                  <textarea value={v.meaning} onChange={e => setVerse(i, 'meaning', e.target.value)}
                    rows={2} placeholder="Meaning / అర్థం..."
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-gray-200 focus:border-amber-400 resize-none"
                    style={{ fontFamily: 'Tiro Telugu, serif' }} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              style={{ background: GOLD, color: GOLD_DARK }}>
              <Save size={15} /> {isEdit ? 'Save Changes' : 'Add Scripture'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Category Form Modal ─── */
function CategoryModal({ category, onSave, onClose }) {
  const isEdit = !!category?.id;
  const [form, setForm] = useState(
    category || { id: '', label: '', label_en: '', color: COLOR_OPTIONS[0].value, bg: 'bg-rose-700', text: 'text-rose-700' }
  );

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSave(e) {
    e.preventDefault();
    if (!form.label.trim() || !form.label_en.trim()) return;
    const id = isEdit ? form.id : form.label_en.toLowerCase().replace(/\s+/g, '_');
    onSave({ ...form, id });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background: GOLD }}>
          <h2 className="font-bold text-base" style={{ color: GOLD_DARK }}>
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg" style={{ color: GOLD_DARK }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name (Telugu) *</label>
            <input value={form.label} onChange={e => set('label', e.target.value)}
              placeholder="స్తోత్రం" required
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400"
              style={{ fontFamily: 'Tiro Telugu, serif' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name (English) *</label>
            <input value={form.label_en} onChange={e => set('label_en', e.target.value)}
              placeholder="Stotra" required
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Color Theme</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => set('color', opt.value)}
                  className={`h-9 rounded-xl bg-gradient-to-r ${opt.value} transition-all ${form.color === opt.value ? 'ring-2 ring-offset-2 ring-amber-400 scale-105' : 'opacity-70'}`}
                  title={opt.label} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              style={{ background: GOLD, color: GOLD_DARK }}>
              <Save size={15} /> {isEdit ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Dashboard Tab ─── */
function Dashboard({ scriptures, categories }) {
  const statCards = [
    { icon: BookOpen, label: 'Total Scriptures', value: scriptures.length, bg: '#E4B24B22', color: GOLD_SOLID },
    { icon: Tag, label: 'Categories', value: categories.length, bg: '#a855f722', color: '#9333ea' },
    { icon: BookMarked, label: 'Stotras', value: scriptures.filter(s => s.category === 'stotra').length, bg: '#ef444422', color: '#dc2626' },
    { icon: Layers, label: 'Mantras', value: scriptures.filter(s => s.category === 'mantra').length, bg: '#f9731622', color: '#ea580c' },
  ];

  const byCategory = categories.map(c => ({
    ...c,
    count: scriptures.filter(s => s.category === c.id).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E4B24B22' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: card.bg }}>
                <Icon size={20} color={card.color} />
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E4B24B22' }}>
        <h3 className="font-bold text-sm text-gray-700 mb-4">Scriptures by Category</h3>
        <div className="space-y-3">
          {byCategory.map(c => {
            const pct = Math.round((c.count / scriptures.length) * 100);
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600"
                    style={{ fontFamily: 'Tiro Telugu, serif' }}>
                    {c.label} <span className="text-gray-400 font-normal">({c.label_en})</span>
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums">{c.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full bg-gradient-to-r ${c.color}`}
                    initial={{ width: 0 }} animate={{ width: pct + '%' }}
                    transition={{ duration: 0.5 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Scriptures Tab ─── */
function Scriptures({ scriptures, categories, setScriptures }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [modal, setModal] = useState(null); // null | 'add' | scripture obj
  const [pdfModal, setPdfModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = scriptures.filter(s => {
    const matchCat = filterCat === 'all' || s.category === filterCat;
    const q = search.toLowerCase();
    const matchQ = !q || s.title_telugu.includes(q) || s.title_english?.toLowerCase().includes(q) || s.deity?.includes(q);
    return matchCat && matchQ;
  });

  function handleSave(form) {
    saveScripture(form);
    setScriptures(getScriptures());
    setModal(null);
    setPdfModal(false);
  }

  function handleDelete(id) {
    deleteScripture(id);
    setScriptures(getScriptures());
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search scriptures..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-amber-400 bg-white" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400 bg-white">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.label_en}</option>)}
        </select>
        <button onClick={() => setModal('add')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
          style={{ background: GOLD, color: GOLD_DARK }}>
          <Plus size={15} /> Add Scripture
        </button>
        <button onClick={() => setPdfModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap bg-white hover:bg-amber-50 transition-colors"
          style={{ border: '1.5px solid #E4B24B55', color: GOLD_DARK }}>
          <FileUp size={15} /> Import PDF
        </button>
      </div>

      {/* Table/Cards */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E4B24B22' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No scriptures found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'hsl(40 43% 96%)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10 hidden sm:table-cell">Photo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Deity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Verses</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => {
                  const cat = categories.find(c => c.id === s.category);
                  return (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                          style={{ background: 'hsl(40 43% 93%)', border: '1px solid #E4B24B33' }}>
                          {s.cover_url
                            ? <img src={s.cover_url} alt="deity" className="w-full h-full object-cover" />
                            : <Image size={15} color="#C88F2D88" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                          {s.title_telugu}
                        </div>
                        <div className="text-xs text-gray-400">{s.title_english}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {cat && <Badge label={cat.label} color={cat.color} />}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-600" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                          {s.deity || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs tabular-nums text-gray-400">{s.verses?.length || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setModal(s)}
                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setConfirmDelete(s.id)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">{filtered.length} of {scriptures.length} scriptures</p>

      {pdfModal && (
        <PDFImportModal
          categories={categories}
          onSave={handleSave}
          onClose={() => setPdfModal(false)}
        />
      )}
      {modal && (
        <ScriptureModal
          scripture={modal === 'add' ? null : modal}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {confirmDelete && (
        <Confirm message="Delete this scripture? This cannot be undone."
          onYes={() => handleDelete(confirmDelete)}
          onNo={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}

/* ─── Categories Tab ─── */
function Categories({ categories, setCategories, scriptures }) {
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  function handleSave(form) {
    saveCategory(form);
    setCategories(getCategories());
    setModal(null);
  }

  function handleDelete(id) {
    deleteCategory(id);
    setCategories(getCategories());
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: GOLD, color: GOLD_DARK }}>
          <Plus size={15} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => {
          const count = scriptures.filter(s => s.category === cat.id).length;
          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #E4B24B22' }}>
              <div className={`h-2 bg-gradient-to-r ${cat.color}`} />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                      {cat.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.label_en || cat.id}</p>
                  </div>
                  <span className="ml-2 text-sm font-bold tabular-nums text-gray-500 flex-shrink-0">
                    {count} <span className="text-xs font-normal">items</span>
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setModal(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => setConfirmDelete(cat.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {modal && (
        <CategoryModal
          category={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {confirmDelete && (
        <Confirm message="Delete this category? Scriptures in it won't be deleted."
          onYes={() => handleDelete(confirmDelete)}
          onNo={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}

/* ─── Main Admin Panel ─── */
export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scriptures, setScriptures] = useState(getScriptures);
  const [categories, setCategories] = useState(getCategories);

  function handleLogout() {
    logout();
    onLogout();
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(40 43% 95%)' }}>

      {/* Sidebar overlay on mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <aside className={`
            fixed top-0 left-0 h-full z-50 flex flex-col w-64 shadow-2xl transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:z-30
          `} style={{ background: GOLD }}>

            <div className="flex items-center gap-3 px-5 py-6 border-b border-white/20">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/25 overflow-hidden flex-shrink-0">
                <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate" style={{ color: GOLD_DARK, fontFamily: 'Tiro Telugu, serif' }}>
                  వైఖానస నిధి
                </div>
                <div className="text-xs" style={{ color: GOLD_DARK + '99' }}>Admin Panel</div>
              </div>
              <button className="ml-auto lg:hidden p-1" onClick={() => setSidebarOpen(false)}
                style={{ color: GOLD_DARK }}><X size={18} /></button>
            </div>

            <nav className="flex-1 px-3 py-5 space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left"
                  style={{
                    background: tab === id ? 'rgba(255,255,255,0.35)' : 'transparent',
                    color: tab === id ? GOLD_DARK : GOLD_DARK + 'bb',
                  }}>
                  <Icon size={17} />
                  {label}
                  {tab === id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </nav>

            <div className="px-3 pb-5">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all"
                style={{ color: GOLD_DARK + 'bb' }}>
                <LogOut size={17} /> Logout
              </button>
            </div>
          </aside>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 h-16 bg-white/80 backdrop-blur shadow-sm"
          style={{ borderBottom: '1px solid #E4B24B33' }}>
          <button className="lg:hidden p-2 rounded-xl hover:bg-amber-50" onClick={() => setSidebarOpen(true)}
            style={{ color: GOLD_DARK }}>
            <LayoutDashboard size={20} />
          </button>
          <div>
            <h1 className="font-bold text-base text-gray-800">
              {TABS.find(t => t.id === tab)?.label}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">Manage your sacred content</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: '#F6D67A33', color: GOLD_DARK }}>
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Admin
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {tab === 'dashboard' && (
                <Dashboard scriptures={scriptures} categories={categories} />
              )}
              {tab === 'scriptures' && (
                <Scriptures
                  scriptures={scriptures} categories={categories}
                  setScriptures={setScriptures}
                />
              )}
              {tab === 'categories' && (
                <Categories
                  categories={categories} setCategories={setCategories}
                  scriptures={scriptures}
                />
              )}
              {tab === 'images' && <ImagesTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
