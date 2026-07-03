import * as pdfjsLib from 'pdfjs-dist';
import {
  joinIndicFragments,
  mergeLinesIntoParagraphs,
  formatPageForReading,
  formatOcrPageContent,
} from './textLayout';
import { stripDevotionalJunk } from './devotionalLayout';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const TELUGU_RE = /[\u0C00-\u0C7F]/;
const SANSKRIT_RE = /[\u0900-\u097F]/;
const PAGE_NUM_RE = /^[ivxlcdm]{1,6}\.?$/i;
const MEANING_MARKERS = /అర్థం|తాత్పర్యం|meaning|భావం|వివరణ|explanation/i;
const VERSE_SEP = /\u0964\u0964\s*\d*\s*\u0964\u0964|\|\|\s*\d+\s*\|\||[\u0964]{2}/g;
const BOOK_SECTION_SEP = /(?:^|\n)(?:అధ్యాయం|అధ్యాయ|chapter|ముందు\s*మాట)\s*[-–:]?/gi;

function teluguRatio(text) {
  const chars = [...(text || '').replace(/\s/g, '')];
  if (!chars.length) return 0;
  const indic = chars.filter((c) => TELUGU_RE.test(c) || SANSKRIT_RE.test(c)).length;
  return indic / chars.length;
}

/** Page footers / index lines like "61 59 56 55 ... xlix" */
function isNumericJunkLine(line) {
  const t = (line || '').trim();
  if (!t || t.length < 2) return true;
  if (teluguRatio(t) > 0.12) return false;
  if (/[a-zA-Z]{4,}/.test(t)) return false;

  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length >= 3 && tokens.every((tok) => /^[ivxlcdm\d]+$/i.test(tok))) return true;

  const digits = (t.match(/\d/g) || []).length;
  if (digits >= 4 && digits / t.replace(/\s/g, '').length > 0.45) return true;

  return false;
}

function stripOcrLatinNoise(line) {
  const allowed = /^(OM|Om|Sri|Shri|Gayatri)$/i;
  return (line || '')
    .replace(/[◌◦•·]+/g, '')
    .replace(/_/g, ' ')
    .replace(/\b[A-Za-z]{1,5}\b/g, (m) => (allowed.test(m) ? m : ''))
    .replace(/\|\|/g, '॥')
    .replace(/\|(?=\s|$)/g, '।')
  // common digit-letter confusions in OCR
    .replace(/(?<=[\u0C00-\u0C7F])0(?=[\u0C00-\u0C7F])/g, 'ో')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Clean extracted Telugu text — removes misread Latin fragments */
export function sanitizeOcrTeluguText(text) {
  return stripDevotionalJunk(
    (text || '')
      .split('\n')
      .map(stripOcrLatinNoise)
      .map((l) => l.trim())
      .filter((l) => l.length > 1)
      .filter((l) => !PAGE_NUM_RE.test(l))
      .filter((l) => !isNumericJunkLine(l))
      .join('\n')
      .trim()
  );
}

function sanitizeTextBlock(text) {
  return sanitizeOcrTeluguText(
    (text || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 1)
      .filter((l) => !PAGE_NUM_RE.test(l))
      .filter((l) => !/^(page\s*)?[ivxlcdm]{1,6}$/i.test(l))
      .filter((l) => !isNumericJunkLine(l))
      .filter((l) => !isGarbledLine(l))
      .join('\n')
      .trim()
  );
}

function isLowQualityContent(text) {
  const t = (text || '').trim();
  if (t.length < 8) return true;
  if (teluguRatio(t) >= 0.1) return false;
  if (isNumericJunkText(t)) return true;
  return t.length > 15 && teluguRatio(t) < 0.05;
}

function isNumericJunkText(text) {
  const lines = (text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return true;
  const junk = lines.filter((l) => isNumericJunkLine(l)).length;
  return junk >= Math.max(1, lines.length * 0.6);
}

function filterBodyRegion(items, pageHeight) {
  if (!pageHeight || !items.length) return items;
  const headerY = pageHeight * 0.9;
  const footerY = pageHeight * 0.08;
  return items.filter((p) => p.y < headerY && p.y > footerY);
}

function isGarbledLine(line) {
  if (!line || line.length < 3) return true;
  if (teluguRatio(line) > 0.2) return false;
  if (/^[\x20-\x7E]+$/.test(line)) return false;

  const suspicious = (line.match(/[ùú˚˝≤≥ÔÆ‘’´˛æÊüßøÎ˙ï]/g) || []).length;
  if (suspicious >= 2) return true;

  const odd = (line.match(/[^\x20-\x7E\u0C00-\u0C7F\u0900-\u097F.,;:'"()\-]/g) || []).length;
  return odd > line.length * 0.1;
}

function getItemPosition(item) {
  const t = item.transform || [1, 0, 0, 1, 0, 0];
  const h = item.height || Math.abs(t[3]) || Math.abs(t[0]) || 12;
  return {
    str: item.str || '',
    x: t[4],
    y: t[5],
    width: item.width || 0,
    height: h,
  };
}

function joinLine(items) {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  return joinIndicFragments(sorted.map((item) => item.str));
}

function assembleLinesWithY(items) {
  if (!items.length) return [];

  const sorted = [...items].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3) return yDiff;
    return a.x - b.x;
  });

  const rows = [];
  let current = [];
  let lineY = sorted[0].y;

  for (const item of sorted) {
    const tol = Math.max(4, item.height * 0.5);
    if (current.length && Math.abs(item.y - lineY) > tol) {
      const text = joinLine(current);
      const height = current.reduce((m, it) => Math.max(m, it.height || 12), 12);
      rows.push({ y: lineY, text, height });
      current = [];
    }
    current.push(item);
    lineY = item.y;
  }
  if (current.length) {
    const text = joinLine(current);
    const height = current.reduce((m, it) => Math.max(m, it.height || 12), 12);
    rows.push({ y: lineY, text, height });
  }

  return rows;
}

function rowsToFormattedPage(teluguRows, englishRows = []) {
  const teluguParas = mergeLinesIntoParagraphs(teluguRows);
  const englishParas = englishRows.length ? mergeLinesIntoParagraphs(englishRows) : [];
  const teluguText = teluguParas.join('\n\n');
  const englishText = englishParas.join('\n\n');
  return formatPageForReading(teluguText, englishText);
}

function cleanLines(rows) {
  return rows
    .map((r) => ({ ...r, text: r.text.trim() }))
    .filter((r) => r.text.length > 1)
    .filter((r) => !PAGE_NUM_RE.test(r.text))
    .filter((r) => !/^(page\s*)?[ivxlcdm]{1,6}$/i.test(r.text))
    .filter((r) => !isNumericJunkLine(r.text))
    .filter((r) => !isGarbledLine(r.text));
}

function pairBilingualRows(primaryRows, secondaryRows) {
  const used = new Set();
  const pairs = [];

  for (const primary of primaryRows) {
    let best = null;
    let bestDist = Infinity;

    secondaryRows.forEach((secondary, idx) => {
      const dist = Math.abs(primary.y - secondary.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = { secondary, idx };
      }
    });

    const meaning = best && bestDist < 18 ? best.secondary.text : '';
    if (best && bestDist < 18) used.add(best.idx);

    pairs.push({ telugu: primary.text, meaning });
  }

  for (const [idx, secondary] of secondaryRows.entries()) {
    if (!used.has(idx) && secondary.text && /^[\x20-\x7E]+$/.test(secondary.text)) {
      pairs.push({ telugu: '', meaning: secondary.text });
    }
  }

  return pairs.filter((p) => p.telugu || p.meaning);
}

export function pageResultFromColumns(teluguText, englishText = '') {
  const telugu = sanitizeTextBlock(teluguText);
  const english = sanitizeTextBlock(englishText);
  const formatted = formatOcrPageContent(telugu, english);
  const pairs = formatted.blocks.map((b) => ({ telugu: b.text, meaning: '' }));

  return {
    text: [formatted.telugu, formatted.meaning].filter(Boolean).join('\n\n'),
    teluguText: formatted.telugu,
    englishText: formatted.meaning,
    blocks: formatted.blocks,
    pairs,
    garbled: isLowQualityContent(formatted.telugu),
  };
}

function extractPageText(items, pageWidth, pageHeight) {
  const positioned = filterBodyRegion(
    items.map(getItemPosition).filter((p) => p.str.trim()),
    pageHeight,
  );
  if (!positioned.length) {
    return { text: '', teluguText: '', englishText: '', pairs: [], garbled: false };
  }

  const mid = pageWidth / 2;
  const gutter = pageWidth * 0.06;
  const left = positioned.filter((p) => p.x + p.width / 2 < mid - gutter);
  const right = positioned.filter((p) => p.x + p.width / 2 > mid + gutter);

  const isTwoColumn = left.length > positioned.length * 0.1 && right.length > positioned.length * 0.1;

  if (isTwoColumn) {
    const leftRows = cleanLines(assembleLinesWithY(left));
    const rightRows = cleanLines(assembleLinesWithY(right));
    const leftText = leftRows.map((r) => r.text).join('\n');
    const rightText = rightRows.map((r) => r.text).join('\n');
    const leftTel = teluguRatio(leftText);
    const rightTel = teluguRatio(rightText);

    const teluguRows = rightTel >= leftTel ? rightRows : leftRows;
    const otherRows = rightTel >= leftTel ? leftRows : rightRows;
    const formatted = rowsToFormattedPage(teluguRows, otherRows);
    const teluguText = sanitizeTextBlock(formatted.telugu);
    const englishText = sanitizeTextBlock(formatted.meaning);
    const pairs = pairBilingualRows(teluguRows, otherRows);

    return {
      text: [teluguText, englishText].filter(Boolean).join('\n\n'),
      teluguText,
      englishText,
      blocks: formatted.blocks,
      pairs,
      garbled: isLowQualityContent(teluguText),
    };
  }

  const rows = cleanLines(assembleLinesWithY(positioned));
  const formatted = rowsToFormattedPage(rows);
  const text = sanitizeTextBlock(formatted.telugu);
  const pairs = formatted.blocks.map((b) => ({ telugu: b.text, meaning: '' }));

  return {
    text,
    teluguText: text,
    englishText: '',
    blocks: formatted.blocks,
    pairs,
    garbled: isLowQualityContent(text),
  };
}

export { teluguRatio, sanitizeTextBlock, isLowQualityContent };

/** Extract text page by page with column-aware reading order */
export async function extractTextFromPDF(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;

  const pages = [];
  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent({ disableNormalization: true });
    pages.push(extractPageText(content.items, viewport.width, viewport.height));
    onProgress?.({ current: i, total });

    if (i % 4 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  return pages;
}

function splitIntoBlocks(body, isBook) {
  const byVerseMarkers = body.split(VERSE_SEP).map((b) => b.trim()).filter((b) => b.length > 3);
  if (!isBook || byVerseMarkers.length > 1) return byVerseMarkers;

  const bySections = body.split(BOOK_SECTION_SEP).map((b) => b.trim()).filter((b) => b.length > 3);
  if (bySections.length > 1) return bySections;

  return body.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b.length > 3);
}

function blockToVerse(block) {
  const markerMatch = block.search(MEANING_MARKERS);
  if (markerMatch !== -1) {
    return {
      telugu: block.slice(0, markerMatch).trim(),
      meaning: block.slice(markerMatch).replace(MEANING_MARKERS, '').trim(),
    };
  }

  const subLines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (subLines.length >= 2) {
    const mid = Math.ceil(subLines.length / 2);
    return {
      telugu: subLines.slice(0, mid).join('\n'),
      meaning: subLines.slice(mid).join(' '),
    };
  }

  return { telugu: block, meaning: '' };
}

function findTitle(pages) {
  const firstPageLines = (pages[0]?.teluguText || pages[0]?.text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !PAGE_NUM_RE.test(l) && !isGarbledLine(l));

  const teluguTitle = firstPageLines.find((l) => teluguRatio(l) > 0.35 && l.length >= 4);
  if (teluguTitle) return teluguTitle;

  const longLine = firstPageLines.find((l) => l.length >= 8);
  return longLine || firstPageLines[0] || '';
}

function buildVersesFromPages(pages, isBook, groupMode = 'auto') {
  const nonEmpty = pages.filter((p) => p.teluguText?.trim() || p.englishText?.trim() || p.text?.trim());
  const usePageMode = groupMode === 'page'
    || (groupMode === 'auto' && isBook && nonEmpty.length >= 15);

  if (usePageMode) {
    return nonEmpty
      .map((p, idx) => {
        const formatted = formatPageForReading(
          p.teluguText || p.text || '',
          p.englishText || '',
        );
        return {
          telugu: sanitizeTextBlock(formatted.telugu),
          meaning: sanitizeTextBlock(formatted.meaning),
          page_number: idx + 1,
          _page: idx + 1,
        };
      })
      .filter((v) => v.telugu || v.meaning);
  }

  const paired = pages.flatMap((p) => p.pairs || []);
  const meaningfulPairs = paired.filter((p) => p.telugu?.trim() || p.meaning?.trim());

  if (meaningfulPairs.length > 1) {
    return meaningfulPairs.map((p) => ({
      telugu: p.telugu?.trim() || '',
      meaning: p.meaning?.trim() || '',
    }));
  }

  const teluguBody = pages.map((p) => p.teluguText).filter(Boolean).join('\n\n');
  const rawBlocks = splitIntoBlocks(teluguBody, isBook);
  return rawBlocks.map(blockToVerse);
}

/** Re-group already extracted pages (e.g. after user changes split mode in UI) */
export function rebuildVersesFromPages(pageResults, groupMode = 'page') {
  const pages = pageResults.map((p) => (
    typeof p === 'string'
      ? { text: p, teluguText: p, englishText: '', pairs: [], garbled: false }
      : p
  ));
  return buildVersesFromPages(pages, true, groupMode);
}

/**
 * Parse extracted PDF pages into scripture form data.
 * Accepts page objects from extractTextFromPDF (or legacy string arrays).
 */
export function parsePDFText(pageResults, options = {}) {
  const {
    parent_category = 'book',
    subcategory = 'scriptures',
    category = 'book',
  } = options;

  const pages = pageResults.map((p) => (
    typeof p === 'string'
      ? { text: p, teluguText: p, englishText: '', pairs: [], garbled: teluguRatio(p) < 0.12 && p.length > 40 }
      : p
  ));

  const isBook = parent_category === 'book';
  const garbledPages = pages.filter((p) => p.garbled || isLowQualityContent(p.teluguText)).length;
  const totalTelugu = pages.map((p) => p.teluguText).join('');
  const overallTeluguRatio = teluguRatio(totalTelugu);
  const nonEmptyTeluguPages = pages.filter((p) => p.teluguText?.trim() && !isLowQualityContent(p.teluguText)).length;

  let extractionWarning = null;
  const lowQuality = garbledPages > pages.length * 0.2
    || nonEmptyTeluguPages < pages.length * 0.1
    || (totalTelugu.length > 80 && overallTeluguRatio < 0.1);

  if (lowQuality) {
    extractionWarning =
      'Little or no Telugu text was found in this PDF (old fonts or scanned pages). '
      + 'Use "PDF book" import instead for exact page display.';
  }

  const title_telugu = findTitle(pages);
  const pageCount = pages.length;
  const groupMode = pageCount >= 15 ? 'page' : 'auto';
  const verses = buildVersesFromPages(pages, isBook, groupMode);
  const descCandidate = verses[0]?.telugu || pages[0]?.teluguText?.split('\n')[0] || '';
  const description = descCandidate.length < 300 ? descCandidate : `${descCandidate.slice(0, 280)}…`;

  if (pageCount >= 15 && !extractionWarning) {
    extractionWarning = `Large book detected (${pageCount} pages). Text is grouped one section per page. You can change grouping below before saving.`;
  }

  return {
    title_telugu,
    title_english: '',
    parent_category,
    subcategory,
    category,
    deity: '',
    description,
    popularity: 80,
    cover_url: null,
    reading_layout: pageCount >= 10 ? 'paginated' : 'verses',
    page_count: pageCount,
    extractionWarning,
    pageCount,
    groupMode,
    rawPages: pages,
    verses: verses.length > 0 ? verses : [{ telugu: '', meaning: '' }],
  };
}
