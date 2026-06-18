import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, BookOpen, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { DAILY_SLOKAS } from "../../data/scriptures";
import heroImg from "../../assets/images/heroImg.png";

export default function HeroCard() {
  const sloka = DAILY_SLOKAS[0];
  const [open, setOpen] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  function handleShare() {
    if (navigator.share) navigator.share({ title: "Vaikhanasa Nidhi", text: sloka.telugu });
    else navigator.clipboard?.writeText(sloka.telugu);
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-card mx-3 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 lg:mt-8"
      >
        <div className="hero-card-shell rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="hero-card-texture" aria-hidden="true" />
          <div className="hero-card-shine" aria-hidden="true" />

          <div className="hero-deity" aria-hidden="true">
            <motion.img
              src={heroImg}
              alt=""
              className="hero-deity-img"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="hero-content">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Sparkles size={13} className="text-primary-gold flex-shrink-0" />
              <span className="hero-eyebrow">{sloka.source}</span>
            </div>

            <h1
              className="hero-mantra font-telugu gold-glow-strong"
              style={{ fontFamily: "Tiro Telugu, serif" }}
              onClick={() => setOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && setOpen(true)}
            >
              {sloka.telugu}
            </h1>

            <div className="hero-meaning-block">
              <p
                className={`hero-meaning reading-meaning font-telugu ${showMeaning ? "" : "hero-meaning-collapsed"}`}
                style={{ fontFamily: "Tiro Telugu, serif" }}
              >
                {sloka.meaning}
              </p>
              <button
                type="button"
                onClick={() => setShowMeaning(v => !v)}
                className="hero-more-btn"
              >
                {showMeaning ? (
                  <>తక్కువ చూపు <ChevronUp size={12} /></>
                ) : (
                  <>మరింత చదవండి <ChevronDown size={12} /></>
                )}
              </button>
            </div>

            <Link to="/search" className="btn-gold hero-cta">
              <span className="font-telugu" style={{ fontFamily: "Tiro Telugu, serif" }}>
                ప్రయాణాన్ని ప్రారంభించండి
              </span>
              <Sparkles size={14} />
            </Link>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 backdrop-blur-sm"
              style={{ background: "var(--bg-overlay)" }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 top-16 z-50 rounded-2xl overflow-hidden shadow-2xl flex flex-col corner-card bg-card"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary-gold" />
                  <div>
                    <p className="font-bold text-sm gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                      నేటి దివ్య శ్లోకం
                    </p>
                    <p className="text-xs text-muted">{sloka.source}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center btn-ghost">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row">
                  <div className="flex justify-center md:w-56 md:flex-shrink-0 md:self-end">
                    <img src={heroImg} alt="deity" className="object-contain object-bottom" style={{ height: 220, maxWidth: 180, filter: "drop-shadow(0 0 20px rgba(200,143,45,0.3))" }} />
                  </div>
                  <div className="flex-1 px-5 py-5 md:py-6">
                    <div className="rounded-xl p-4 mb-4 bg-elevated" style={{ border: "1px solid var(--border-subtle)" }}>
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted">శ్లోకం</p>
                      <p className="font-telugu leading-loose font-semibold gold-glow-strong whitespace-pre-line" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 16 }}>
                        {sloka.telugu}
                      </p>
                    </div>
                    <div className="rounded-xl p-4 mb-4 bg-elevated" style={{ border: "1px solid var(--border-subtle)" }}>
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted">అర్థం</p>
                      <p className="font-telugu leading-relaxed reading-meaning" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 14 }}>
                        {sloka.meaning}
                      </p>
                    </div>
                    <p className="text-xs text-center mb-5 text-muted-light">— {sloka.source}</p>
                    <div className="flex gap-3">
                      <button onClick={handleShare} className="btn-ghost flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium active:scale-95 transition-all">
                        <Share2 size={15} /> Share
                      </button>
                      <Link to="/search" onClick={() => setOpen(false)} className="btn-gold flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold active:scale-95 transition-all">
                        <BookOpen size={15} /> Read More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
