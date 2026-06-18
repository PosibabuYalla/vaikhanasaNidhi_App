import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Share2, ZoomIn, ZoomOut, Copy, Check, BookOpen } from "lucide-react";
import { SCRIPTURES, getCategoryInfo } from "../data/scriptures";
import { isBookmarked, addBookmark, removeBookmark, saveReadingProgress, getSettings } from "../store/useAppStore";
import { getReaderBaseFontSize } from "../lib/theme";
import { toast } from "sonner";

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scripture = SCRIPTURES.find(s => s.id === id);
  const [fontSize, setFontSize] = useState(() => getReaderBaseFontSize(getSettings().fontSize));
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(id));
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  const related = scripture
    ? SCRIPTURES.filter(s => s.category === scripture.category && s.id !== scripture.id).slice(0, 3)
    : [];

  useEffect(() => {
    function onThemeChange(e) {
      setFontSize(getReaderBaseFontSize(e.detail?.fontSize || getSettings().fontSize));
    }
    window.addEventListener('themechange', onThemeChange);
    return () => window.removeEventListener('themechange', onThemeChange);
  }, []);

  useEffect(() => {
    if (!scripture) return;
    const handler = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.round((window.scrollY / total) * 100) : 0;
      setScrollProgress(pct);
      if (pct > 5) {
        const lv = Math.floor((pct / 100) * scripture.verses.length);
        saveReadingProgress(scripture, Math.min(pct, 100), lv);
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [scripture]);

  function copyVerse(verse, idx) {
    navigator.clipboard?.writeText(verse.telugu + "\n\n" + verse.meaning);
    setCopiedIdx(idx);
    toast.success("Copied!");
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function toggleBookmark() {
    if (bookmarked) { removeBookmark(id); setBookmarked(false); toast.info("Bookmark removed"); }
    else { addBookmark(scripture); setBookmarked(true); toast.success("Bookmarked!"); }
  }

  function handleShare() {
    const text = scripture.title_telugu + "\n\n" + (scripture.verses[0]?.telugu || "");
    if (navigator.share) navigator.share({ title: scripture.title_telugu, text });
    else { navigator.clipboard?.writeText(text); toast.success("Copied!"); }
  }

  if (!scripture) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 page-bg">
        <div className="text-center corner-card rounded-2xl p-8">
          <p className="font-telugu text-xl text-muted mb-4" style={{ fontFamily: "Tiro Telugu, serif" }}>
            Scripture not found
          </p>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-xl text-sm btn-gold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const cat = getCategoryInfo(scripture.category);

  return (
    <div ref={containerRef} className="min-h-screen pb-12 page-bg">

      <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ background: '#222' }}>
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg, #C88F2D, #E4B24B)' }}
          animate={{ width: scrollProgress + "%" }} transition={{ duration: 0.15 }} />
      </div>

      <div className="sticky top-0 z-40 mx-3 sm:mx-6 mt-3 lg:top-16">
        <div className="corner-card rounded-2xl px-3 py-2.5 flex items-center gap-2 backdrop-blur-md"
          style={{ background: 'var(--bg-nav)' }}>
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white/5 text-muted hover:text-white flex-shrink-0 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="flex-1 font-telugu text-sm sm:text-base font-semibold truncate gold-glow"
            style={{ fontFamily: "Tiro Telugu, serif" }}>
            {scripture.title_telugu}
          </span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="p-2 rounded-xl hover:bg-white/5 text-muted">
              <ZoomOut size={15} />
            </button>
            <span className="text-xs text-secondary w-8 text-center hidden sm:inline">{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(40, s + 2))}
              className="p-2 rounded-xl hover:bg-white/5 text-muted">
              <ZoomIn size={15} />
            </button>
            <button onClick={toggleBookmark}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
              style={{ color: bookmarked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <button onClick={handleShare}
              className="p-2 rounded-xl hover:bg-white/5 text-muted">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="xl:flex xl:gap-6 xl:px-6 xl:mt-4">
        <div className="xl:flex-1 min-w-0">

          <div className="mx-3 sm:mx-6 xl:mx-0 mt-3 sm:mt-4 corner-card rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-7 page-header">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-telugu text-primary-gold"
                  style={{ fontFamily: "Tiro Telugu, serif", background: '#C88F2D22', border: '1px solid #C88F2D33' }}>
                  {cat.label}
                </span>
                {scripture.deity && (
                  <span className="px-3 py-1 rounded-full text-xs text-secondary"
                    className="rounded-xl p-3 bg-elevated"
                    style={{ border: '1px solid var(--border-subtle)' }}>
                    {scripture.deity}
                  </span>
                )}
              </div>
              <h1 className="font-telugu font-bold leading-snug mb-2 gold-glow-strong"
                style={{ fontFamily: "Tiro Telugu, serif", fontSize: Math.max(fontSize + 4, 24) }}>
                {scripture.title_telugu}
              </h1>
              <p className="text-secondary text-sm mb-3 italic">{scripture.title_english}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#222' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ background: 'linear-gradient(90deg, #C88F2D, #E4B24B)', width: scrollProgress + "%" }} />
                </div>
                <span className="text-muted text-xs flex-shrink-0">
                  {scripture.verses.length} verses
                </span>
              </div>
            </div>
          </div>

          {scripture.description && (
            <div className="mx-3 sm:mx-6 xl:mx-0 mt-4 corner-card rounded-2xl p-4 sm:p-5 reader-border">
              <p className="font-telugu reading-text text-sm sm:text-base"
                style={{ fontFamily: "Tiro Telugu, serif" }}>
                {scripture.description}
              </p>
            </div>
          )}

          <div className="mx-3 sm:mx-6 xl:mx-0 mt-4 space-y-4">
            {scripture.verses.map((verse, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(idx * 0.06, 0.3) }}
                className="corner-card rounded-2xl overflow-hidden reader-border group"
              >
                <div className="flex items-center justify-between px-4 sm:px-5 py-2.5"
                  style={{ borderBottom: '1px solid #C88F2D15' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold"
                      style={{ background: 'linear-gradient(135deg, #C88F2D, #E4B24B)', color: '#0a0a0a', fontSize: 10 }}>
                      {idx + 1}
                    </div>
                    <span className="text-xs text-muted">Verse</span>
                  </div>
                  <button onClick={() => copyVerse(verse, idx)}
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/5 text-muted text-xs">
                    {copiedIdx === idx
                      ? <Check size={13} className="text-green-400" />
                      : <Copy size={13} />}
                  </button>
                </div>

                <div className="p-4 sm:p-5 md:grid md:grid-cols-2 md:gap-6"
                  style={{ borderColor: '#C88F2D15' }}>
                  <div className="md:pr-6" style={{ borderRight: 'none' }}>
                    <p className="font-telugu whitespace-pre-line reading-mantra"
                      style={{ fontFamily: "Tiro Telugu, serif", fontSize }}>
                      {verse.telugu}
                    </p>
                  </div>

                  <div className="md:hidden flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C88F2D44, transparent)' }} />
                    <span className="text-xs text-secondary font-semibold uppercase tracking-wider">Meaning</span>
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C88F2D44, transparent)' }} />
                  </div>

                  <div className="md:pl-6 md:border-l" style={{ borderColor: '#C88F2D15' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-secondary hidden md:block">
                      Meaning
                    </p>
                    <p className="font-telugu reading-meaning text-sm sm:text-base"
                      style={{ fontFamily: "Tiro Telugu, serif", fontSize: Math.max(fontSize - 4, 14) }}>
                      {verse.meaning}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mx-3 sm:mx-6 xl:mx-0 mt-8 text-center pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px" style={{ background: '#C88F2D22' }} />
              <span className="text-muted text-sm">Completed</span>
              <div className="flex-1 h-px" style={{ background: '#C88F2D22' }} />
            </div>
            <p className="font-telugu text-muted text-xs" style={{ fontFamily: "Tiro Telugu, serif" }}>
              {scripture.title_telugu}
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-3">
              <h3 className="font-telugu font-bold text-sm gold-glow"
                style={{ fontFamily: "Tiro Telugu, serif" }}>
                Related Scriptures
              </h3>
              {related.map(s => {
                const rc = getCategoryInfo(s.category);
                return (
                  <a key={s.id} href={"/read/" + s.id}
                    className="corner-card rounded-2xl overflow-hidden hover:brightness-110 transition-all flex">
                    <div className="w-1 flex-shrink-0" style={{ background: 'linear-gradient(180deg, #C88F2D, #E4B24B)' }} />
                    <div className="p-3 flex-1 min-w-0">
                      <span className="text-xs text-muted">{rc.label}</span>
                      <p className="font-telugu font-semibold text-sm leading-snug mt-0.5 gold-glow"
                        style={{ fontFamily: "Tiro Telugu, serif" }}>
                        {s.title_telugu}
                      </p>
                    </div>
                    <div className="flex items-center pr-3">
                      <BookOpen size={14} className="text-muted" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
