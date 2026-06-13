import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trash2, Pencil, Upload, Image, Tag, Save,
  Filter, ZoomIn, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  getPhotos, savePhotos, updatePhoto, deletePhoto,
  getEvents, saveEvent, deleteEvent
} from '../store/galleryStore';

const GOLD = 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)';
const GOLD_DARK = '#8B6200';
const GOLD_SOLID = '#C88F2D';

/* ── Lightbox ── */
function Lightbox({ photos, index, onClose }) {
  const [cur, setCur] = useState(index);
  const photo = photos[cur];
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
        <X size={24} />
      </button>
      {cur > 0 && (
        <button onClick={e => { e.stopPropagation(); setCur(c => c - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/40 rounded-full">
          <ChevronLeft size={24} />
        </button>
      )}
      {cur < photos.length - 1 && (
        <button onClick={e => { e.stopPropagation(); setCur(c => c + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/40 rounded-full">
          <ChevronRight size={24} />
        </button>
      )}
      <div onClick={e => e.stopPropagation()} className="max-w-3xl w-full">
        <img src={photo.url} alt={photo.caption}
          className="w-full max-h-[75vh] object-contain rounded-2xl" />
        {photo.caption && (
          <p className="text-white/80 text-center mt-3 text-sm">{photo.caption}</p>
        )}
        <p className="text-white/40 text-center text-xs mt-1">
          {cur + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
}

/* ── Upload Modal ── */
function UploadModal({ events, onSave, onClose }) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || '');
  const [previews, setPreviews] = useState([]); // [{file, url, caption}]
  const [newEventName, setNewEventName] = useState('');
  const [showNewEvent, setShowNewEvent] = useState(false);
  const fileRef = useRef();

  function handleFiles(files) {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        setPreviews(prev => [...prev, { id: Date.now() + Math.random(), file, url: e.target.result, caption: '' }]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function setCaption(id, val) {
    setPreviews(p => p.map(x => x.id === id ? { ...x, caption: val } : x));
  }

  function removePreview(id) {
    setPreviews(p => p.filter(x => x.id !== id));
  }

  function handleAddEvent(e) {
    e.preventDefault();
    if (!newEventName.trim()) return;
    const ev = { id: newEventName.toLowerCase().replace(/\s+/g, '_'), label: newEventName, label_en: newEventName };
    saveEvent(ev);
    setSelectedEvent(ev.id);
    setNewEventName('');
    setShowNewEvent(false);
  }

  function handleSave() {
    if (!previews.length || !selectedEvent) return;
    const photos = previews.map(p => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      eventId: selectedEvent,
      url: p.url,
      caption: p.caption,
      uploadedAt: Date.now(),
    }));
    onSave(photos);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">

        <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl" style={{ background: GOLD }}>
          <div className="flex items-center gap-2">
            <Upload size={17} color={GOLD_DARK} />
            <h2 className="font-bold text-base" style={{ color: GOLD_DARK }}>Upload Event Photos</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg" style={{ color: GOLD_DARK }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Event selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Select Event *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {events.map(ev => (
                <button key={ev.id} type="button"
                  onClick={() => setSelectedEvent(ev.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: selectedEvent === ev.id ? GOLD : 'hsl(40 43% 95%)',
                    color: selectedEvent === ev.id ? GOLD_DARK : '#6b7280',
                    border: selectedEvent === ev.id ? 'none' : '1px solid #e5e7eb',
                  }}>
                  {ev.label_en} <span className="opacity-60 ml-0.5"
                    style={{ fontFamily: 'Tiro Telugu, serif' }}>({ev.label})</span>
                </button>
              ))}
              <button type="button" onClick={() => setShowNewEvent(v => !v)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200">
                <Plus size={11} className="inline mr-0.5" /> New Event
              </button>
            </div>
            {showNewEvent && (
              <form onSubmit={handleAddEvent} className="flex gap-2 mt-2">
                <input value={newEventName} onChange={e => setNewEventName(e.target.value)}
                  placeholder="Event name (e.g. Ugadi 2025)"
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none border border-gray-200 focus:border-amber-400" />
                <button type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: GOLD, color: GOLD_DARK }}>Add</button>
              </form>
            )}
          </div>

          {/* Drop zone */}
          <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-amber-400 hover:bg-amber-50/20 transition-all"
            style={{ borderColor: '#E4B24B88' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F6D67A33' }}>
              <Image size={22} color={GOLD_DARK} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm" style={{ color: GOLD_DARK }}>Drop photos here or click to browse</p>
              <p className="text-xs text-gray-400 mt-0.5">Multiple photos supported · JPG, PNG, WebP</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleFiles(e.target.files)} />
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600">{previews.length} photo{previews.length > 1 ? 's' : ''} selected</p>
                <button type="button" onClick={() => setPreviews([])}
                  className="text-xs text-red-400 hover:text-red-600">Clear all</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {previews.map(p => (
                  <div key={p.id} className="rounded-xl overflow-hidden relative group"
                    style={{ border: '1px solid #E4B24B33' }}>
                    <img src={p.url} alt="" className="w-full h-28 object-cover" />
                    <button onClick={() => removePreview(p.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                    <div className="p-2">
                      <input value={p.caption} onChange={e => setCaption(p.id, e.target.value)}
                        placeholder="Caption (optional)"
                        className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border border-gray-200 focus:border-amber-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200">
              Cancel
            </button>
            <button type="button" onClick={handleSave}
              disabled={!previews.length || !selectedEvent}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
              style={{ background: GOLD, color: GOLD_DARK }}>
              <Save size={15} /> Upload {previews.length > 0 ? `(${previews.length})` : ''}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Edit Caption Modal ── */
function EditModal({ photo, events, onSave, onClose }) {
  const [caption, setCaption] = useState(photo.caption || '');
  const [eventId, setEventId] = useState(photo.eventId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 rounded-t-2xl" style={{ background: GOLD }}>
          <h2 className="font-bold text-sm" style={{ color: GOLD_DARK }}>Edit Photo</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg" style={{ color: GOLD_DARK }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <img src={photo.url} alt="" className="w-full h-40 object-cover rounded-xl" />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Event</label>
            <select value={eventId} onChange={e => setEventId(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400 bg-white">
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.label_en} ({ev.label})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Caption</label>
            <input value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Photo caption..."
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-200 focus:border-amber-400" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200">
              Cancel
            </button>
            <button onClick={() => onSave({ ...photo, caption, eventId })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: GOLD, color: GOLD_DARK }}>
              <Save size={14} /> Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Images Admin Tab ── */
export default function ImagesTab() {
  const [photos, setPhotos] = useState(getPhotos);
  const [events, setEvents] = useState(getEvents);
  const [filterEvent, setFilterEvent] = useState('all');
  const [uploadModal, setUploadModal] = useState(false);
  const [editPhoto, setEditPhoto] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { photos, index }
  const [confirmDelete, setConfirmDelete] = useState(null);

  function refresh() {
    setPhotos(getPhotos());
    setEvents(getEvents());
  }

  function handleUpload(newPhotos) {
    savePhotos(newPhotos);
    refresh();
    setUploadModal(false);
  }

  function handleEdit(photo) {
    updatePhoto(photo);
    refresh();
    setEditPhoto(null);
  }

  function handleDelete(id) {
    deletePhoto(id);
    refresh();
    setConfirmDelete(null);
  }

  const filtered = filterEvent === 'all'
    ? photos
    : photos.filter(p => p.eventId === filterEvent);

  // Group by event for display
  const grouped = events
    .map(ev => ({ ...ev, photos: filtered.filter(p => p.eventId === ev.id) }))
    .filter(ev => (filterEvent === 'all' ? ev.photos.length > 0 : ev.id === filterEvent));

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2 flex-wrap">
          {/* Filter chips */}
          <button onClick={() => setFilterEvent('all')}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: filterEvent === 'all' ? GOLD : 'white',
              color: filterEvent === 'all' ? GOLD_DARK : '#6b7280',
              border: filterEvent === 'all' ? 'none' : '1px solid #e5e7eb',
            }}>
            All ({photos.length})
          </button>
          {events.filter(ev => photos.some(p => p.eventId === ev.id)).map(ev => {
            const count = photos.filter(p => p.eventId === ev.id).length;
            const active = filterEvent === ev.id;
            return (
              <button key={ev.id} onClick={() => setFilterEvent(ev.id)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: active ? GOLD : 'white',
                  color: active ? GOLD_DARK : '#6b7280',
                  border: active ? 'none' : '1px solid #e5e7eb',
                }}>
                {ev.label_en} ({count})
              </button>
            );
          })}
        </div>
        <button onClick={() => setUploadModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
          style={{ background: GOLD, color: GOLD_DARK }}>
          <Upload size={15} /> Upload Photos
        </button>
      </div>

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="bg-white rounded-2xl py-16 text-center shadow-sm" style={{ border: '1px solid #E4B24B22' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#F6D67A33' }}>
            <Image size={28} color={GOLD_SOLID} strokeWidth={1.5} />
          </div>
          <p className="font-bold text-base" style={{ color: GOLD_DARK }}>No photos yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload event photos to get started</p>
          <button onClick={() => setUploadModal(true)}
            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: GOLD, color: GOLD_DARK }}>
            <Upload size={14} /> Upload Photos
          </button>
        </div>
      )}

      {/* Grouped gallery */}
      {grouped.map(ev => (
        <div key={ev.id}>
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} color={GOLD_SOLID} />
            <h3 className="font-bold text-sm" style={{ color: GOLD_DARK }}>
              {ev.label_en}
              <span className="ml-1.5 font-normal text-gray-400"
                style={{ fontFamily: 'Tiro Telugu, serif' }}>({ev.label})</span>
            </h3>
            <span className="text-xs text-gray-400 tabular-nums ml-auto">{ev.photos.length} photo{ev.photos.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ev.photos.map((photo, idx) => (
              <motion.div key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="relative group rounded-2xl overflow-hidden shadow-sm bg-white"
                style={{ border: '1px solid #E4B24B22' }}>
                <div className="relative cursor-pointer" onClick={() => setLightbox({ photos: ev.photos, index: idx })}>
                  <img src={photo.url} alt={photo.caption}
                    className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn size={24} color="white" />
                  </div>
                </div>
                {photo.caption && (
                  <p className="px-2.5 py-2 text-xs text-gray-600 truncate">{photo.caption}</p>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditPhoto(photo)}
                    className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow text-amber-600 hover:bg-white">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirmDelete(photo.id)}
                    className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow text-red-400 hover:bg-white">
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Modals */}
      {uploadModal && (
        <UploadModal events={events} onSave={handleUpload} onClose={() => setUploadModal(false)} />
      )}
      {editPhoto && (
        <EditModal photo={editPhoto} events={events} onSave={handleEdit} onClose={() => setEditPhoto(null)} />
      )}
      {lightbox && (
        <Lightbox photos={lightbox.photos} index={lightbox.index} onClose={() => setLightbox(null)} />
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl text-center">
            <p className="text-sm font-semibold text-gray-700 mb-5">Delete this photo?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
