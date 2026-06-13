import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker via URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

/** Extract raw text from a PDF File object, page by page */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    pages.push(text.trim());
  }
  return pages;
}

/**
 * Smart parse: tries to detect title, verses and meanings from raw page texts.
 * Works for Telugu mantras/stotras that follow common patterns.
 *
 * Heuristics:
 *  - First non-empty line with substantial text → title candidate
 *  - Lines/paragraphs with Telugu unicode chars → verse candidates
 *  - Lines after "అర్థం", "meaning", "తాత్పర్యం" etc → meaning candidates
 *  - Splits on double newlines or verse number patterns like ॥1॥, ||1||, 1.
 */
export function parsePDFText(pages) {
  const fullText = pages.join('\n\n');

  // Normalise whitespace while preserving paragraph breaks
  const normalized = fullText
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  // ── Title: first line that has >= 4 chars and looks like a heading ──
  const titleLine = lines.find(l => l.length >= 4) || '';
  const title_telugu = titleLine;
  const title_english = '';

  // ── Split body into verse blocks ──
  // Common separators: ॥n॥  ||n||  ।।  double-newline paragraphs
  const body = normalized
    .replace(/^.*?\n/, '') // remove first line (title)
    .trim();

  const VERSE_SEP = /\u0964\u0964\s*\d*\s*\u0964\u0964|\|\|\s*\d+\s*\|\||[\u0964]{2}|\n\n+/g;
  const rawBlocks = body.split(VERSE_SEP).map(b => b.trim()).filter(b => b.length > 3);

  // ── For each block, try to separate verse from meaning ──
  const MEANING_MARKERS = /అర్థం|తాత్పర్యం|meaning|భావం|వివరణ|explanation/i;

  const verses = rawBlocks.map(block => {
    const markerMatch = block.search(MEANING_MARKERS);
    if (markerMatch !== -1) {
      const teluguPart = block.slice(0, markerMatch).trim();
      const meaningPart = block.slice(markerMatch).replace(MEANING_MARKERS, '').trim();
      return { telugu: teluguPart, meaning: meaningPart };
    }
    // Heuristic: if block has two lines, first = verse, second = meaning
    const subLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (subLines.length >= 2) {
      const mid = Math.ceil(subLines.length / 2);
      return {
        telugu: subLines.slice(0, mid).join('\n'),
        meaning: subLines.slice(mid).join(' '),
      };
    }
    return { telugu: block, meaning: '' };
  });

  // ── Description: first paragraph that isn't the title ──
  const descCandidate = rawBlocks[0] || '';
  const description = descCandidate.length < 300 ? descCandidate : descCandidate.slice(0, 280) + '…';

  return {
    title_telugu,
    title_english,
    category: 'stotra',
    deity: '',
    description,
    popularity: 80,
    cover_url: null,
    verses: verses.length > 0 ? verses : [{ telugu: '', meaning: '' }],
  };
}
