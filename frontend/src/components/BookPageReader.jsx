import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { parseDevotionalBlocks, parseMantraHeader } from '../lib/devotionalLayout';
import { toast } from 'sonner';

function DevotionalBlock({ block, fontSize }) {
  const teluguFont = { fontFamily: 'Tiro Telugu, serif' };

  if (block.type === 'heading') {
    return (
      <h2
        className="font-telugu font-bold book-reader-heading gold-glow text-center"
        style={{ ...teluguFont, fontSize: Math.min(fontSize + 4, 32) }}
      >
        {block.text}
      </h2>
    );
  }

  if (block.type === 'mantra-header') {
    const pairs = parseMantraHeader(block.text);
    return (
      <div className="book-reader-meta-card rounded-xl p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-3 text-center">
          మంత్ర వివరాలు
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {pairs.map((pair, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:gap-2 min-w-0">
              {pair.label && (
                <dt className="font-telugu text-xs text-secondary flex-shrink-0" style={teluguFont}>
                  {pair.label}
                </dt>
              )}
              <dd className="font-telugu text-sm gold-glow min-w-0" style={teluguFont}>
                {pair.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (block.type === 'mantra') {
    return (
      <div className="book-reader-mantra-wrap py-3">
        <p
          className="font-telugu book-reader-mantra reading-mantra text-center leading-relaxed"
          style={{ ...teluguFont, fontSize: Math.min(fontSize + 2, 36) }}
        >
          {block.text}
        </p>
      </div>
    );
  }

  return (
    <p
      className="font-telugu book-reader-paragraph reading-text"
      style={{ ...teluguFont, fontSize }}
    >
      {block.text}
    </p>
  );
}

export default function BookPageReader({
  scripture,
  verses,
  fontSize,
  initialPage = 0,
  onPageChange,
  onProgress,
}) {
  const totalPages = verses.length;
  const [pageIdx, setPageIdx] = useState(() => Math.min(Math.max(0, initialPage), totalPages - 1));
  const [showMeaning, setShowMeaning] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPageIdx(Math.min(Math.max(0, initialPage), totalPages - 1));
  }, [initialPage, totalPages, scripture?.id]);

  const current = verses[pageIdx] || { telugu: '', meaning: '' };
  const pageNum = current.page_number || pageIdx + 1;
  const blocks = useMemo(() => parseDevotionalBlocks(current.telugu), [current.telugu]);
  const meaningBlocks = useMemo(
    () => (current.meaning?.trim() ? parseDevotionalBlocks(current.meaning) : []),
    [current.meaning],
  );
  const hasMeaning = meaningBlocks.length > 0;

  const goTo = useCallback((idx) => {
    const next = Math.min(Math.max(0, idx), totalPages - 1);
    setPageIdx(next);
    onPageChange?.(next);
    const pct = totalPages > 1 ? Math.round((next / (totalPages - 1)) * 100) : 100;
    onProgress?.(pct, next);
  }, [totalPages, onPageChange, onProgress]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') goTo(pageIdx - 1);
      if (e.key === 'ArrowRight') goTo(pageIdx + 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pageIdx, goTo]);

  function copyPage() {
    const text = [current.telugu, current.meaning].filter(Boolean).join('\n\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    toast.success('Page copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="book-reader">
      <div className="book-reader-page-nav mx-3 sm:mx-6 xl:mx-0 mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goTo(pageIdx - 1)}
          disabled={pageIdx === 0}
          className="book-reader-nav-btn flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-35"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">మునుపటి</span>
        </button>

        <div className="text-center flex-1 min-w-0">
          <p className="text-xs text-muted uppercase tracking-wider">పుట</p>
          <p className="font-telugu font-bold text-sm gold-glow tabular-nums"
            style={{ fontFamily: 'Tiro Telugu, serif' }}>
            {pageNum} / {scripture.page_count || totalPages}
          </p>
        </div>

        <button
          type="button"
          onClick={() => goTo(pageIdx + 1)}
          disabled={pageIdx >= totalPages - 1}
          className="book-reader-nav-btn flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-35"
        >
          <span className="hidden sm:inline">తరువాత</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pageIdx}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="mx-3 sm:mx-6 xl:mx-0 corner-card rounded-2xl overflow-hidden reader-border book-reader-page"
        >
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 book-reader-page-header">
            <span className="text-xs text-muted font-semibold font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              పుట {pageNum}
            </span>
            <div className="flex items-center gap-2">
              {hasMeaning && (
                <button
                  type="button"
                  onClick={() => setShowMeaning((s) => !s)}
                  className="text-xs px-2.5 py-1 rounded-lg btn-ghost text-muted"
                >
                  {showMeaning ? 'అర్థం దాచు' : 'అర్థం చూపు'}
                </button>
              )}
              <button
                type="button"
                onClick={copyPage}
                className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-white/5 text-muted text-xs"
              >
                {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <div className={`p-5 sm:p-7 md:p-8 ${hasMeaning && showMeaning ? 'lg:grid lg:grid-cols-2 lg:gap-8' : ''}`}>
            <div className={hasMeaning && showMeaning ? 'lg:pr-6' : ''}>
              <div className="book-reader-content space-y-5">
                {blocks.length > 0 ? blocks.map((block, i) => (
                  <DevotionalBlock key={i} block={block} fontSize={fontSize} />
                )) : (
                  <p className="font-telugu text-muted text-sm text-center" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                    ఈ పుటలో వచనం లేదు.
                  </p>
                )}
              </div>
            </div>

            {hasMeaning && showMeaning && (
              <>
                <div className="lg:hidden flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C88F2D44, transparent)' }} />
                  <span className="text-xs text-secondary font-semibold font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                    అర్థం
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C88F2D44, transparent)' }} />
                </div>
                <div className="lg:pl-6 lg:border-l book-reader-meaning-col" style={{ borderColor: '#C88F2D15' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-secondary hidden lg:block font-telugu"
                    style={{ fontFamily: 'Tiro Telugu, serif' }}>
                    అర్థం
                  </p>
                  <div className="space-y-4">
                    {meaningBlocks.map((block, i) => (
                      <DevotionalBlock key={i} block={{ ...block, type: block.type === 'mantra' ? 'paragraph' : block.type }} fontSize={Math.max(fontSize - 4, 14)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="book-reader-bottom-nav sticky bottom-3 mx-3 sm:mx-6 xl:mx-0 mt-4 z-30">
        <div className="corner-card rounded-2xl px-3 py-2.5 flex items-center gap-2 backdrop-blur-md"
          style={{ background: 'var(--bg-nav)' }}>
          <button
            type="button"
            onClick={() => goTo(pageIdx - 1)}
            disabled={pageIdx === 0}
            className="p-2.5 rounded-xl hover:bg-white/5 disabled:opacity-35"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <input
              type="range"
              min={1}
              max={totalPages}
              value={pageIdx + 1}
              onChange={(e) => goTo(Number(e.target.value) - 1)}
              className="book-reader-slider w-full"
              aria-label="Go to page"
            />
            <p className="text-center text-xs text-muted mt-1 tabular-nums font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              {pageIdx + 1} / {totalPages}
            </p>
          </div>

          <button
            type="button"
            onClick={() => goTo(pageIdx + 1)}
            disabled={pageIdx >= totalPages - 1}
            className="p-2.5 rounded-xl hover:bg-white/5 disabled:opacity-35"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
