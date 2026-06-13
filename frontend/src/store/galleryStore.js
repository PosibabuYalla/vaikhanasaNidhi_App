const PHOTOS_KEY = 'vaikhanasa-gallery-photos';
const EVENTS_KEY = 'vaikhanasa-gallery-events';

const DEFAULT_EVENTS = [
  { id: 'brahmotsavam', label: 'బ్రహ్మోత్సవం', label_en: 'Brahmotsavam' },
  { id: 'vaikunta_ekadasi', label: 'వైకుంఠ ఏకాదశి', label_en: 'Vaikunta Ekadasi' },
  { id: 'kalyanam', label: 'కళ్యాణం', label_en: 'Kalyanam' },
  { id: 'rathasapthami', label: 'రథసప్తమి', label_en: 'Ratha Sapthami' },
  { id: 'janmashtami', label: 'జన్మాష్టమి', label_en: 'Janmashtami' },
  { id: 'navaratri', label: 'నవరాత్రి', label_en: 'Navaratri' },
  { id: 'deepotsavam', label: 'దీపోత్సవం', label_en: 'Deepotsavam' },
  { id: 'other', label: 'ఇతరమైనవి', label_en: 'Other' },
];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Events ──
export function getEvents() { return load(EVENTS_KEY, DEFAULT_EVENTS); }

export function saveEvent(ev) {
  const all = getEvents();
  const idx = all.findIndex(e => e.id === ev.id);
  if (idx >= 0) all[idx] = ev;
  else all.push({ ...ev, id: ev.label_en.toLowerCase().replace(/\s+/g, '_') });
  save(EVENTS_KEY, all);
}

export function deleteEvent(id) {
  save(EVENTS_KEY, getEvents().filter(e => e.id !== id));
}

// ── Photos ──
export function getPhotos() { return load(PHOTOS_KEY, []); }

export function savePhotos(newPhotos) {
  // newPhotos: array of { id, eventId, url, caption, uploadedAt }
  const all = getPhotos();
  save(PHOTOS_KEY, [...all, ...newPhotos]);
}

export function updatePhoto(photo) {
  const all = getPhotos().map(p => p.id === photo.id ? photo : p);
  save(PHOTOS_KEY, all);
}

export function deletePhoto(id) {
  save(PHOTOS_KEY, getPhotos().filter(p => p.id !== id));
}
