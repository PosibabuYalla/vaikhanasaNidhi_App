import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { GOLD_TEXT, COLOR_OPTIONS } from '../../constants/adminConstants';

export default function AdminCategoryForm({
  category,
  defaultParentKey,
  mainCategories = [],
  onSave,
  onClose,
  isSaving = false,
}) {
  const isEdit = !!category?.id;
  const initialParent = category?.parent_key || defaultParentKey || mainCategories[0]?.key || mainCategories[0]?.id || 'stotra';

  const [form, setForm] = useState(
    category || {
      parent_key: initialParent,
      filter_cat: initialParent,
      label: '',
      label_te: '',
      label_en: '',
      color: COLOR_OPTIONS[0].value,
      bg: 'bg-rose-700',
      text: 'text-rose-700',
    }
  );

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleParentChange(parentKey) {
    setForm((f) => ({
      ...f,
      parent_key: parentKey,
      filter_cat: parentKey,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.label.trim() || !form.label_en.trim()) return;

    const payload = {
      isEdit,
      parent_key: form.parent_key,
      filter_cat: form.filter_cat || form.parent_key,
      label: form.label.trim(),
      label_te: (form.label_te || form.label).trim(),
      label_en: form.label_en.trim(),
      search_terms: [],
      color: form.color,
      bg: form.bg,
      text: form.text,
    };
    if (isEdit) payload.id = form.id;
    onSave(payload);
  }

  const busy = isSaving;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto scrollbar-hide p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ scale: 1, opacity: 1 }}
        className="corner-card rounded-2xl w-full max-w-md shadow-2xl my-4 bg-card">

        <div className="flex items-center justify-between px-6 py-4 panel-header-bar">
          <h2 className="font-bold text-base gold-glow">
            {isEdit ? 'Edit Subcategory' : 'Add New Subcategory'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg" style={{ color: GOLD_TEXT }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="form-label">Category *</label>
            <select
              value={form.parent_key}
              onChange={(e) => handleParentChange(e.target.value)}
              className="form-select"
            >
              {mainCategories.map((item) => (
                <option key={item.key || item.id} value={item.key || item.id}>
                  {item.label_en} — {item.label_te || item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Subcategory Name (Telugu) *</label>
            <input value={form.label} onChange={(e) => set('label', e.target.value)}
              placeholder="సుప్రభాతాలు" required className="form-input"
              style={{ fontFamily: 'Tiro Telugu, serif' }} />
          </div>

          <div>
            <label className="form-label">Subcategory Name (English) *</label>
            <input value={form.label_en} onChange={(e) => set('label_en', e.target.value)}
              placeholder="Suprabhatams" required className="form-input" />
          </div>

          <div>
            <label className="form-label mb-2">Color Theme</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => set('color', opt.value)}
                  className={`h-9 rounded-xl bg-gradient-to-r ${opt.value} transition-all ${form.color === opt.value ? 'ring-2 ring-offset-2 ring-amber-400 scale-105' : 'opacity-70'}`}
                  title={opt.label} />
              ))}
            </div>
          </div>

          <div className="modal-actions modal-actions--inline">
            <button type="button" onClick={onClose} disabled={busy}
              className="modal-btn btn-ghost disabled:opacity-50">
              <span className="modal-btn-label">Cancel</span>
            </button>
            <button type="submit" disabled={busy}
              className="modal-btn modal-btn-primary btn-gold disabled:opacity-50">
              {busy ? <Loader2 size={14} className="modal-btn-icon animate-spin" /> : <Save size={14} className="modal-btn-icon" />}
              <span className="modal-btn-label">{isEdit ? 'Save Changes' : 'Add Subcategory'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
