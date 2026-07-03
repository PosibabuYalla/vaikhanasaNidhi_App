import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, List } from 'lucide-react';

const SWIPE_THRESHOLD = 40;

export default function BookVisualReaderLayout({
  scripture,
  pageIdx,
  totalPages,
  loading = false,
  direction = 0,
  onGoTo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  children,
}) {
  const viewportRef = useRef(null);
  const touchRef = useRef({ y: 0, x: 0, time: 0, active: false });
  const [jumpValue, setJumpValue] = useState(String(pageIdx + 1));
  const [showJump, setShowJump] = useState(false);

  const displayTotal = scripture?.page_count || totalPages;
  const currentPage = pageIdx + 1;
  const canSwipe = zoom < 1.6;

  useEffect(() => {
    setJumpValue(String(pageIdx + 1));
  }, [pageIdx]);

  const goTo = useCallback((idx) => {
    onGoTo(idx);
    setJumpValue(String(Math.min(Math.max(0, idx), totalPages - 1) + 1));
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
      viewportRef.current.scrollLeft = 0;
    }
  }, [onGoTo, totalPages]);

  const handlePrev = useCallback(() => {
    if (pageIdx > 0 && !loading) goTo(pageIdx - 1);
  }, [pageIdx, loading, goTo]);

  const handleNext = useCallback(() => {
    if (pageIdx < totalPages - 1 && !loading) goTo(pageIdx + 1);
  }, [pageIdx, totalPages, loading, goTo]);

  function handleJumpSubmit(e) {
    e?.preventDefault();
    const num = parseInt(jumpValue, 10);
    if (!Number.isFinite(num) || num < 1 || num > totalPages) return;
    goTo(num - 1);
    setShowJump(false);
  }

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    function onTouchStart(e) {
      if (!canSwipe || loading) return;
      const t = e.touches[0];
      touchRef.current = { y: t.clientY, x: t.clientX, time: Date.now(), active: true };
    }

    function onTouchMove(e) {
      if (!touchRef.current.active || !canSwipe || loading) return;
      const t = e.touches[0];
      const dy = Math.abs(t.clientY - touchRef.current.y);
      const dx = Math.abs(t.clientX - touchRef.current.x);
      if (dy > dx && dy > 8) {
        e.preventDefault();
      }
    }

    function onTouchEnd(e) {
      if (!touchRef.current.active || !canSwipe || loading) return;
      touchRef.current.active = false;
      const t = e.changedTouches[0];
      const dy = touchRef.current.y - t.clientY;
      const dx = touchRef.current.x - t.clientX;
      const dt = Date.now() - touchRef.current.time;
      if (dt > 700) return;
      if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) < Math.abs(dx)) return;
      if (dy > 0) handleNext();
      else handlePrev();
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [canSwipe, loading, handleNext, handlePrev]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    let accum = 0;
    let timer = null;

    function onWheel(e) {
      if (!canSwipe || loading) return;
      if (el.scrollHeight > el.clientHeight + 2) {
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
      }
      e.preventDefault();
      accum += e.deltaY;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { accum = 0; }, 350);
      if (accum > 70) { accum = 0; handleNext(); }
      else if (accum < -70) { accum = 0; handlePrev(); }
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (timer) clearTimeout(timer);
    };
  }, [canSwipe, loading, handleNext, handlePrev]);

  const slideY = direction >= 0 ? '100%' : '-100%';
  const exitY = direction >= 0 ? '-100%' : '100%';

  return (
    <div className="book-swipe-reader">
      <div className="book-swipe-toolbar">
        <div className="book-swipe-controls-bar">
          <button type="button" onClick={() => setShowJump((s) => !s)}
            className="book-swipe-pill" aria-label="Jump to page">
            <List size={14} />
          </button>
          <button type="button" onClick={handlePrev} disabled={pageIdx === 0 || loading}
            className="book-swipe-pill disabled:opacity-35" aria-label="Previous page">
            <ChevronDown size={16} />
          </button>
          <span className="book-swipe-page-label tabular-nums">
            {currentPage} / {displayTotal}
          </span>
          <button type="button" onClick={handleNext} disabled={pageIdx >= totalPages - 1 || loading}
            className="book-swipe-pill disabled:opacity-35" aria-label="Next page">
            <ChevronUp size={16} />
          </button>
          <button type="button" onClick={onZoomOut} className="book-swipe-pill p-2" aria-label="Zoom out">
            <ZoomOut size={13} />
          </button>
          <button type="button" onClick={onZoomReset} className="book-swipe-pill text-xs tabular-nums px-1.5">
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" onClick={onZoomIn} className="book-swipe-pill p-2" aria-label="Zoom in">
            <ZoomIn size={13} />
          </button>
        </div>

        {showJump && (
          <div className="book-swipe-jump-panel">
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpValue}
                onChange={(e) => setJumpValue(e.target.value)}
                className="book-page-jump-input w-16 text-center text-sm font-bold tabular-nums rounded-lg px-2 py-1.5"
                aria-label="Page number"
                autoFocus
              />
              <span className="text-xs text-muted tabular-nums">/ {displayTotal}</span>
              <button type="submit" disabled={loading} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold btn-gold">
                Go
              </button>
              <button type="button" onClick={() => setShowJump(false)}
                className="px-2 py-1.5 rounded-lg text-xs text-muted hover:text-white">
                ✕
              </button>
            </form>
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => goTo(Number(e.target.value) - 1)}
              className="book-reader-slider w-full mt-2"
              aria-label="Go to page"
            />
          </div>
        )}
      </div>

      <div
        ref={viewportRef}
        className={`book-swipe-viewport${canSwipe ? ' book-swipe-viewport--swipe' : ''}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pageIdx}
            initial={{ opacity: 0.5, y: slideY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.5, y: exitY }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="book-swipe-page"
          >
            <div className="book-swipe-page-img-box">
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
