import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import axiosInstance from '../lib/axiosInstance';
import { scripturePdf } from '../lib/apiUrls';
import BookVisualReaderLayout from './BookVisualReaderLayout';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

const RENDER_SCALE = 2;

async function fetchPdfArrayBuffer(pdfUrl, scriptureId) {
  try {
    const direct = await fetch(pdfUrl, { mode: 'cors' });
    if (direct.ok) {
      return direct.arrayBuffer();
    }
  } catch {
    // Cloudinary raw PDFs often block cross-origin fetch — use API proxy
  }

  const { data } = await axiosInstance.get(scripturePdf(scriptureId), {
    responseType: 'arraybuffer',
    timeout: 120000,
  });
  return data;
}

export default function BookPdfReader({
  scripture,
  pdfUrl,
  pageCount = 0,
  initialPage = 0,
  onProgress,
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageIdx, setPageIdx] = useState(() => Math.max(0, initialPage));
  const [pageSrc, setPageSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1.25);
  const [direction, setDirection] = useState(0);
  const pageIdxRef = useRef(pageIdx);

  const totalPages = pdfDoc?.numPages || pageCount || 1;

  useEffect(() => {
    pageIdxRef.current = pageIdx;
  }, [pageIdx]);

  useEffect(() => {
    setPageIdx(Math.min(Math.max(0, initialPage), Math.max(0, totalPages - 1)));
    setZoom(1.25);
  }, [initialPage, totalPages, scripture?.id]);

  useEffect(() => {
    const url = pdfUrl?.trim();
    if (!url) {
      setLoading(false);
      setPdfDoc(null);
      setPageSrc('');
      setError('No PDF file linked to this book. Re-import using PDF book mode in admin.');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setPdfDoc(null);
    setPageSrc('');

    (async () => {
      try {
        const data = await fetchPdfArrayBuffer(url, scripture.id);
        const doc = await pdfjsLib.getDocument({ data, disableRange: true }).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load PDF. Check your connection or re-upload the book.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [pdfUrl, scripture?.id]);

  useEffect(() => {
    if (!pdfDoc) return undefined;
    let cancelled = false;
    setRendering(true);
    setError('');

    (async () => {
      try {
        const page = await pdfDoc.getPage(pageIdx + 1);
        const viewport = page.getViewport({ scale: RENDER_SCALE * zoom });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) {
          setPageSrc(canvas.toDataURL('image/jpeg', 0.9));
          setRendering(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not render this page.');
          setRendering(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [pdfDoc, pageIdx, zoom]);

  const goTo = useCallback((idx) => {
    const next = Math.min(Math.max(0, idx), totalPages - 1);
    const prev = pageIdxRef.current;
    setDirection(next > prev ? 1 : next < prev ? -1 : 0);
    setPageIdx(next);
    const pct = totalPages > 1 ? Math.round((next / (totalPages - 1)) * 100) : 100;
    onProgress?.(pct, next);
  }, [totalPages, onProgress]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(pageIdx - 1);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(pageIdx + 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pageIdx, goTo]);

  if (error && !pageSrc) {
    return (
      <p className="text-center text-red-400 text-sm py-12 px-4">{error}</p>
    );
  }

  return (
    <BookVisualReaderLayout
      scripture={scripture}
      pageIdx={pageIdx}
      totalPages={totalPages}
      loading={loading || rendering}
      direction={direction}
      onGoTo={goTo}
      zoom={zoom}
      onZoomIn={() => setZoom((z) => Math.min(2.5, z + 0.15))}
      onZoomOut={() => setZoom((z) => Math.max(0.75, z - 0.15))}
      onZoomReset={() => setZoom(1)}
    >
      {(loading || rendering) && (
        <div className="flex flex-col items-center gap-2 py-16 w-full">
          <Loader2 size={28} className="animate-spin" style={{ color: '#C88F2D' }} />
          <p className="text-xs text-muted">{loading ? 'Loading PDF…' : 'Rendering page…'}</p>
        </div>
      )}
      {!loading && !rendering && pageSrc && (
        <img
          src={pageSrc}
          alt={`${scripture.title_telugu} — page ${pageIdx + 1}`}
          className="book-image-page-img book-swipe-page-img"
          draggable={false}
        />
      )}
    </BookVisualReaderLayout>
  );
}
