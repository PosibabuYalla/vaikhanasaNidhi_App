import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

const DEFAULT_SCALE = 2;
const DEFAULT_QUALITY = 0.85;

/**
 * Render every PDF page to a JPEG blob (exact visual — no OCR).
 * @returns {Promise<Array<{ blob: Blob, pageNumber: number, fileName: string }>>}
 */
export async function renderPdfPagesToBlobs(file, onProgress, options = {}) {
  const scale = options.scale ?? DEFAULT_SCALE;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const format = options.format ?? 'image/jpeg';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const pages = [];

  for (let i = 1; i <= total; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), format, quality);
    });

    if (!blob) throw new Error(`Failed to render page ${i}`);

    pages.push({
      blob,
      pageNumber: i,
      fileName: `page-${String(i).padStart(4, '0')}.jpg`,
    });

    onProgress?.({ phase: 'render', current: i, total });

    if (i % 3 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return pages;
}

export function titleFromPdfFilename(fileName) {
  return (fileName || '')
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

export async function getPdfPageCount(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}
