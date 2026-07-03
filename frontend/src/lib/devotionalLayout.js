import { joinIndicFragments, teluguRatio, isHeadingLine } from './textLayout';

const INDIC_RE = /[\u0C00-\u0C7F\u0900-\u097F]/;
const ALLOWED_LATIN = /^(OM|Om|Sri|Shri|Gayatri|Agni|Surya|Narayana|Vishnu)$/i;

/** Vaikhanasa / Vedic mantra metadata labels */
const META_LABEL_RE = /మంత్రస్య|ఋషిః|ఋషి|ఛందః|ఛంద|దేవతా|దేవత|బీజం|శక్తిః|కీలకం|న్యాస|ద్యానం|ఫలశ్రుతి|కరన్యాస|అంగన్యాస|హృదయాదిన్యాస/i;
const MANTRA_SECTION_START = /(?:^|[\s|])(మంత్రస్య|ఋషిః|ఋషి\s)/;
const VERSE_SPLIT_RE = /(\u0964\u0964|\u0964\s*\u0964|॥\s*\d*\s*॥?|॥)/g;

function isIndicChar(ch) {
  return INDIC_RE.test(ch);
}

/** Remove page numbers, OCR junk symbols, stray Latin from inline text */
export function stripDevotionalJunk(text) {
  let t = (text || '')
    .replace(/[◌◦•·_]+/g, ' ')
    .replace(/\|\|/g, '॥')
    .replace(/\|{2,}/g, '॥')
    // orphan pipes / equals / parens
    .replace(/(?:^|[\s,])[=+$]+\s*/g, ' ')
    .replace(/\s*[=+$]+(?=[\s,]|$)/g, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    // OCR misreads at line start: "8 ", "0౨౮ 159"
    .replace(/^\d{1,2}\s+/gm, '')
    .replace(/^[0-9౦-౯OolI|=\s]{3,20}(?=[\u0C00-\u0C7F])/gm, '')
    // embedded footer/page numbers (2-6 digits) not attached to Indic
    .replace(/(?<![\u0C00-\u0C7F\u0900-\u097F\d])(\d{2,6})(?![\u0C00-\u0C7F\u0900-\u097F])/g, (m, num, offset, full) => {
      const before = full[offset - 1] || '';
      const after = full[offset + m.length] || '';
      if (isIndicChar(before) || isIndicChar(after)) return m;
      if (Number(num) > 999) return ' ';
      if (Number(num) >= 10 && Number(num) <= 999) return ' ';
      return m;
    })
    // stray Latin words (Seeman, BIS, etc.)
    .replace(/\b[A-Za-z]{2,}\b/g, (m) => (ALLOWED_LATIN.test(m) ? m : ''))
    // digit confusions inside Telugu
    .replace(/(?<=[\u0C00-\u0C7F])0(?=[\u0C00-\u0C7F])/g, 'ో')
    .replace(/(?<=[\u0C00-\u0C7F])1(?=[\u0C00-\u0C7F])/g, 'ి')
    // collapse symbol noise
    .replace(/[|]{1}(?=\s*[|)=])/g, '')
    .replace(/\s*[|)\s]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // clean leading/trailing junk on each pseudo-line
  t = t
    .split(/\n/)
    .map((line) => line.replace(/^[\s|,=+$()\-–]+/, '').replace(/[\s|,=+$()\-–]+$/, '').trim())
    .filter((l) => l.length > 1)
    .filter((l) => !/^[\d\s|=\-–.,]+$/.test(l))
    .join('\n');

  return t;
}

function hasMetaLabels(text) {
  return META_LABEL_RE.test(text);
}

function isMantraHeader(text) {
  const t = (text || '').trim();
  if (!t || t.length > 280) return false;
  const labels = (t.match(new RegExp(META_LABEL_RE.source, 'gi')) || []).length;
  return labels >= 2 || (labels >= 1 && t.includes('మంత్రస్య'));
}

function isMantraVerse(text) {
  const t = (text || '').trim();
  if (!t) return false;
  if (/॥|।{2}/.test(t)) return true;
  if (t.length < 120 && teluguRatio(t) > 0.55 && !hasMetaLabels(t)) return true;
  return false;
}

function classifyBlock(text) {
  const t = (text || '').trim();
  if (!t) return null;
  if (isHeadingLine(t)) return { type: 'heading', text: t };
  if (isMantraHeader(t)) return { type: 'mantra-header', text: t };
  if (isMantraVerse(t)) return { type: 'mantra', text: t };
  if (hasMetaLabels(t) && t.length < 200) return { type: 'mantra-header', text: t };
  return { type: 'paragraph', text: t };
}

/** Split merged OCR blob into logical devotional sections */
export function splitDevotionalSections(rawText) {
  const cleaned = stripDevotionalJunk(rawText);
  if (!cleaned) return [];

  // Split on verse markers, keeping content
  let withMarkers = cleaned.replace(VERSE_SPLIT_RE, (m) => `${m}\n\n`);

  // Split inline metadata labels in long OCR lines
  withMarkers = withMarkers.replace(
    /(మంత్రస్య|ఋషిః|ఛందః|దేవతా|బీజం|శక్తిః|కీలకం)/g,
    (m, _p1, offset, full) => (offset > 0 ? `\n\n${m}` : m),
  );

  const rough = withMarkers
    .split(/\n{2,}|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && teluguRatio(s) > 0.06);

  const sections = [];
  let metaBuf = '';

  for (const part of rough) {
    if (isMantraHeader(part) || (hasMetaLabels(part) && part.length < 220)) {
      if (metaBuf) {
        sections.push(metaBuf.trim());
        metaBuf = '';
      }
      if (isMantraVerse(part) && !isMantraHeader(part)) {
        sections.push(part);
      } else {
        metaBuf = metaBuf ? joinIndicFragments([metaBuf, part]) : part;
        if (metaBuf.length > 40) {
          sections.push(metaBuf.trim());
          metaBuf = '';
        }
      }
      continue;
    }

    if (metaBuf) {
      sections.push(metaBuf.trim());
      metaBuf = '';
    }
    sections.push(part);
  }
  if (metaBuf.trim()) sections.push(metaBuf.trim());

  return sections.filter((s) => s.length > 2);
}

/** Parse mantra header into label chips: మంత్రస్య అగ్ని ఋషిః → pairs */
export function parseMantraHeader(text) {
  const t = stripDevotionalJunk(text);
  const labelPattern = /(మంత్రస్య|ఋషిః|ఋషి|ఛందః|ఛంద|దేవతా|దేవత|బీజం|శక్తిః|కీలకం|న్యాస|ద్యానం|ఫలశ్రుతి)/gi;
  const parts = t.split(labelPattern).map((p) => p.trim()).filter(Boolean);
  const pairs = [];
  const labelSet = new Set([
    'మంత్రస్య', 'ఋషిః', 'ఋషి', 'ఛందః', 'ఛంద', 'దేవతా', 'దేవత',
    'బీజం', 'శక్తిః', 'కీలకం', 'న్యాస', 'ద్యానం', 'ఫలశ్రుతి',
  ]);

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    const normalized = part.replace(/:$/, '');
    if (labelSet.has(normalized) || labelSet.has(part)) {
      const label = normalized;
      let value = (parts[i + 1] || '').replace(/^[\s\-–:|]+/, '').trim();
      // value may contain next label inline — cut at next label
      const nextLabel = value.search(/(?:మంత్రస్య|ఋషిః|ఛందః|దేవతా|బీజం|శక్తిః|కీలకం)/);
      if (nextLabel > 0) value = value.slice(0, nextLabel).trim();
      if (value) {
        pairs.push({ label, value: value.replace(/\s*-\s*$/, '') });
        i += 1;
      }
    }
  }
  if (!pairs.length) return [{ label: '', value: t }];
  return pairs;
}

/** Full devotional page formatter — used at import and display */
export function formatDevotionalPage(teluguText, englishText = '') {
  const teluguSections = splitDevotionalSections(teluguText);
  const englishSections = englishText?.trim() ? splitDevotionalSections(englishText) : [];

  const blocks = teluguSections
    .map(classifyBlock)
    .filter(Boolean);

  if (!blocks.length && teluguText?.trim()) {
    blocks.push({ type: 'paragraph', text: stripDevotionalJunk(teluguText) });
  }

  return {
    telugu: teluguSections.join('\n\n'),
    meaning: englishSections.join('\n\n'),
    blocks,
    englishBlocks: englishSections.map(classifyBlock).filter(Boolean),
  };
}

export function parseDevotionalBlocks(teluguText) {
  if (!teluguText?.trim()) return [];
  // Already has paragraph breaks from import
  if (teluguText.includes('\n\n')) {
    const sections = teluguText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    if (sections.length > 1) {
      return sections.map(classifyBlock).filter(Boolean);
    }
  }
  return splitDevotionalSections(teluguText).map(classifyBlock).filter(Boolean);
}
