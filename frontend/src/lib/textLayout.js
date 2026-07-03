import { formatDevotionalPage, stripDevotionalJunk } from './devotionalLayout';

const TELUGU_RE = /[\u0C00-\u0C7F]/;
const SANSKRIT_RE = /[\u0900-\u097F]/;
const INDIC_RE = /[\u0C00-\u0C7F\u0900-\u097F]/;
const SENTENCE_END_RE = /[।॥.!?;:]\s*$/;
const HEADING_RE = /^(?:అధ్యాయ|అధ్యాయం|chapter|ముందు\s*మాట|ప్రకరణ|శ్లోక|మంత్ర|సూక్త|భాగం)\s*[-–:.]?\s*/i;

export function isIndicChar(ch) {
  return INDIC_RE.test(ch);
}

export function teluguRatio(text) {
  const chars = [...(text || '').replace(/\s/g, '')];
  if (!chars.length) return 0;
  const indic = chars.filter((c) => TELUGU_RE.test(c) || SANSKRIT_RE.test(c)).length;
  return indic / chars.length;
}

export function isHeadingLine(text) {
  const t = (text || '').trim();
  if (!t || t.length > 120) return false;
  if (HEADING_RE.test(t)) return true;
  if (t.length <= 48 && teluguRatio(t) > 0.5 && !SENTENCE_END_RE.test(t) && !/[,\-–]/.test(t.slice(-3))) {
    const words = t.split(/\s+/).filter(Boolean);
    if (words.length <= 6) return true;
  }
  return false;
}

/** Join text fragments — no space between adjacent Indic characters */
export function joinIndicFragments(parts) {
  let out = '';
  for (const raw of parts) {
    const s = (raw || '').trim();
    if (!s) continue;
    if (!out) {
      out = s;
      continue;
    }
    const last = out[out.length - 1];
    const first = s[0];
    const needSpace = !isIndicChar(last) && !isIndicChar(first)
      && /[a-zA-Z0-9.,;:]$/.test(out) && /^[a-zA-Z0-9]/.test(s);
    out += (needSpace ? ' ' : '') + s;
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

function medianLineHeight(lines) {
  const heights = lines.map((l) => l.height || l.bbox?.y1 - l.bbox?.y0 || 0).filter((h) => h > 0);
  if (!heights.length) return 20;
  heights.sort((a, b) => a - b);
  return heights[Math.floor(heights.length / 2)] || 20;
}

function lineY(line) {
  return line.y ?? line.bbox?.y0 ?? 0;
}

/**
 * Merge position-aware lines into paragraphs using vertical gap.
 * lines: [{ text, y?, height?, bbox? }]
 */
export function mergeLinesIntoParagraphs(lines, options = {}) {
  if (!lines?.length) return [];
  const sorted = [...lines]
    .map((l) => ({ ...l, text: (l.text || '').trim() }))
    .filter((l) => l.text.length > 0)
    .sort((a, b) => lineY(a) - lineY(b));

  if (!sorted.length) return [];

  const lineH = medianLineHeight(sorted);
  const gapFactor = options.gapFactor ?? 1.65;
  const paragraphs = [];
  let current = sorted[0].text;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const gap = lineY(curr) - lineY(prev);
    const bigGap = gap > lineH * gapFactor;
    const headingBreak = isHeadingLine(curr.text) || isHeadingLine(current);
    const sentenceEnd = SENTENCE_END_RE.test(current);

    if (bigGap || headingBreak || (sentenceEnd && curr.text.length > 2)) {
      paragraphs.push(current.trim());
      current = curr.text;
    } else {
      current = joinIndicFragments([current, curr.text]);
    }
  }
  if (current.trim()) paragraphs.push(current.trim());
  return paragraphs;
}

/** Merge plain text lines when OCR puts one word/short phrase per line */
export function mergeBrokenTextLines(rawText) {
  const lines = (rawText || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return lines;

  const out = [];
  let buf = '';

  for (const line of lines) {
    if (!buf) {
      buf = line;
      continue;
    }

    const headingBreak = isHeadingLine(line) || isHeadingLine(buf);
    const sentenceEnd = SENTENCE_END_RE.test(buf);
    const bothIndic = teluguRatio(buf) > 0.25 && teluguRatio(line) > 0.25;
    const shortLine = line.length < 55 || buf.length < 55;
    const shouldMerge = !headingBreak && !sentenceEnd && bothIndic && shortLine;

    if (shouldMerge) {
      buf = joinIndicFragments([buf, line]);
    } else {
      out.push(buf);
      buf = line;
    }
  }
  if (buf) out.push(buf);
  return out;
}

/** Split paragraphs into typed blocks for Reader rendering */
export function paragraphsToBlocks(paragraphs) {
  return (paragraphs || [])
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({
      type: isHeadingLine(text) ? 'heading' : 'paragraph',
      text,
    }));
}

/**
 * Full page formatter: raw column text → flowing paragraphs for storage/display.
 * Uses devotional structure for mantra books (Vaikhanasa, etc.).
 */
export function formatPageForReading(teluguText, englishText = '') {
  const cleanedTelugu = stripDevotionalJunk(teluguText);
  const cleanedEnglish = englishText?.trim() ? stripDevotionalJunk(englishText) : '';

  const devotional = formatDevotionalPage(cleanedTelugu, cleanedEnglish);
  if (devotional.blocks.length > 0) {
    return devotional;
  }

  const teluguParas = mergeBrokenTextLines(cleanedTelugu);
  const englishParas = cleanedEnglish ? mergeBrokenTextLines(cleanedEnglish) : [];

  return {
    telugu: teluguParas.join('\n\n'),
    meaning: englishParas.join('\n\n'),
    blocks: paragraphsToBlocks(teluguParas),
    englishBlocks: paragraphsToBlocks(englishParas),
  };
}

/** Reconstruct page from OCR paragraph objects (Tesseract) or line objects */
export function formatOcrPageContent(paragraphsOrLines, englishText = '') {
  let teluguParas = [];

  if (paragraphsOrLines?.length && paragraphsOrLines[0]?.lines) {
    teluguParas = paragraphsOrLines
      .map((para) => joinIndicFragments((para.lines || []).map((l) => l.text)))
      .filter(Boolean);
  } else if (paragraphsOrLines?.length && paragraphsOrLines[0]?.bbox) {
    teluguParas = mergeLinesIntoParagraphs(paragraphsOrLines);
  } else if (typeof paragraphsOrLines === 'string') {
    teluguParas = mergeBrokenTextLines(paragraphsOrLines);
  } else if (Array.isArray(paragraphsOrLines)) {
    teluguParas = mergeBrokenTextLines(paragraphsOrLines.map((l) => l.text || l).join('\n'));
  }

  const telugu = teluguParas.join('\n\n');
  const englishParas = englishText?.trim() ? mergeBrokenTextLines(englishText) : [];
  return {
    telugu,
    meaning: englishParas.join('\n\n'),
    blocks: paragraphsToBlocks(teluguParas),
    englishBlocks: paragraphsToBlocks(englishParas),
  };
}

export function isBookPaginatedScripture(scripture) {
  if (!scripture) return false;
  if (scripture.reading_layout === 'paginated') return true;
  if (scripture.reading_layout === 'verses') return false;
  const verses = scripture.verses || [];
  if (scripture.parent_category === 'book' && verses.length >= 10) return true;
  if (verses.length >= 15 && verses.some((v) => v.page_number != null)) return true;
  return false;
}
