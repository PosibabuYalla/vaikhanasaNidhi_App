import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import BookVisualReaderLayout from './BookVisualReaderLayout';

function sortPageImages(images) {
  return [...(images || [])].sort((a, b) => {
    const pa = a.page_number || 0;
    const pb = b.page_number || 0;
    if (pa && pb) return pa - pb;
    return 0;
  });
}

export default function BookImageReader({
  scripture,
  images,
  initialPage = 0,
  onProgress,
}) {
  const pages = useMemo(() => sortPageImages(images), [images]);
  const totalPages = pages.length;
  const [pageIdx, setPageIdx] = useState(() => Math.min(Math.max(0, initialPage), Math.max(0, totalPages - 1)));
  const [zoom, setZoom] = useState(1);
  const [direction, setDirection] = useState(0);
  const pageIdxRef = useRef(pageIdx);

  useEffect(() => {
    pageIdxRef.current = pageIdx;
  }, [pageIdx]);

  useEffect(() => {
    setPageIdx(Math.min(Math.max(0, initialPage), Math.max(0, totalPages - 1)));
    setZoom(1);
  }, [initialPage, totalPages, scripture?.id]);

  const current = pages[pageIdx] || {};
  const pageNum = current.page_number || pageIdx + 1;

  const goTo = useCallback((idx) => {
    const next = Math.min(Math.max(0, idx), totalPages - 1);
    const prev = pageIdxRef.current;
    setDirection(next > prev ? 1 : next < prev ? -1 : 0);
    setPageIdx(next);
    setZoom(1);
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

  if (!totalPages) {
    return (
      <p className="text-center text-muted text-sm py-12 font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
        ఈ పుస్తకానికి పుట చిత్రాలు లేవు.
      </p>
    );
  }

  return (
    <BookVisualReaderLayout
      scripture={scripture}
      pageIdx={pageIdx}
      totalPages={totalPages}
      direction={direction}
      onGoTo={goTo}
      zoom={zoom}
      onZoomIn={() => setZoom((z) => Math.min(2.5, z + 0.15))}
      onZoomOut={() => setZoom((z) => Math.max(0.75, z - 0.15))}
      onZoomReset={() => setZoom(1)}
    >
      <div
        className="book-swipe-page-img-wrap"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
      >
        <img
          src={current.url}
          alt={`${scripture.title_telugu} — page ${pageNum}`}
          className="book-image-page-img book-swipe-page-img"
          loading="eager"
          draggable={false}
        />
      </div>
    </BookVisualReaderLayout>
  );
}
