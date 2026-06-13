import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, BookOpen, Sparkles, X, ChevronRight } from "lucide-react";
import { DAILY_SLOKAS } from "../../data/scriptures";
import heroImg from "../../assets/images/heroImg.png";

const GOLD_DARK = "#8B6200";
const GOLD = "linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)";

export default function HeroCard() {
  const sloka = DAILY_SLOKAS[0];
  const [open, setOpen] = useState(false);

  function handleShare() {
    if (navigator.share) navigator.share({ title: "Vaikhanasa Nidhi", text: sloka.telugu });
    else navigator.clipboard?.writeText(sloka.telugu);
  }

  return (
    <>
      {/* ── Hero Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="lotus-bg rounded-3xl overflow-hidden shadow-xl mx-4 sm:mx-6 mt-4 sm:mt-6 cursor-pointer"
        style={{ background: GOLD }}
        onClick={() => setOpen(true)}
      >
        {/* top label row */}
        <div className="flex items-center gap-2 px-5 pt-5 sm:px-7 sm:pt-7">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-white/30">
            <Sparkles size={12} color={GOLD_DARK} />
          </div>
          <span className="text-xs font-medium tracking-wide uppercase" style={{ color: GOLD_DARK }}>నేటి దివ్య శ్లోకం</span>
          <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            <span className="hidden sm:inline">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* hero body — relative container */}
        <div className="relative min-h-[280px]">

          {/* hero image — absolute right, oversized */}
          <img src={heroImg} alt="deity"
            className="absolute bottom-0 right-0 object-contain object-bottom drop-shadow-xl pointer-events-none select-none"
            style={{ height: 320, width: "55%" }} />

          {/* sloka content — overlays image via z-10 */}
          <div className="relative z-10 flex flex-col justify-center px-4 sm:px-6 py-4 sm:py-5" style={{ width: "70%" }}>
            <p className="font-telugu leading-relaxed font-semibold mb-3"
              style={{ fontFamily: "Tiro Telugu, serif", color: "#fff", fontSize: 15 }}>
              {sloka.telugu}
            </p>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-white/40" />
              <span className="text-xs flex-shrink-0" style={{ color: GOLD_DARK }}>అర్థం</span>
              <div className="flex-1 h-px bg-white/40" />
            </div>

            <p className="font-telugu text-xs leading-relaxed line-clamp-3 mb-1"
              style={{ fontFamily: "Tiro Telugu, serif", color: "rgba(255,255,255,0.85)" }}>
              {sloka.meaning}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>— {sloka.source}</p>

            <p className="text-xs mt-3 font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
              పూర్తిగా చదవడానికి నొక్కండి →
            </p>
          </div>

        </div>
      </motion.div>

      {/* ── Full Sloka Overlay ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* panel */}
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 top-16 z-50 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ background: GOLD }}
            >
              {/* panel header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                    <Sparkles size={14} color={GOLD_DARK} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
                      నేటి దివ్య శ్లోకం
                    </p>
                    <p className="text-xs" style={{ color: GOLD_DARK + "88" }}>{sloka.source}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center"
                  style={{ color: GOLD_DARK }}>
                  <X size={16} />
                </button>
              </div>

              {/* scrollable content */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row">

                  {/* image */}
                  <div className="flex justify-center md:w-56 md:flex-shrink-0 md:self-end">
                    <img src={heroImg} alt="deity"
                      className="object-contain object-bottom drop-shadow-xl"
                      style={{ height: 220, maxWidth: 180 }} />
                  </div>

                  {/* sloka full text */}
                  <div className="flex-1 px-5 py-5 md:py-6">

                    {/* telugu sloka */}
                    <div className="bg-white/25 rounded-2xl p-4 mb-4">
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: GOLD_DARK + "99" }}>శ్లోకం</p>
                      <p className="font-telugu leading-loose font-semibold"
                        style={{ fontFamily: "Tiro Telugu, serif", color: GOLD_DARK, fontSize: 16 }}>
                        {sloka.telugu}
                      </p>
                    </div>

                    {/* meaning */}
                    <div className="bg-white/20 rounded-2xl p-4 mb-4">
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: GOLD_DARK + "99" }}>అర్థం</p>
                      <p className="font-telugu leading-relaxed"
                        style={{ fontFamily: "Tiro Telugu, serif", color: GOLD_DARK + "ee", fontSize: 14 }}>
                        {sloka.meaning}
                      </p>
                    </div>

                    {/* source */}
                    <p className="text-xs text-center mb-5" style={{ color: GOLD_DARK + "77" }}>— {sloka.source}</p>

                    {/* action buttons */}
                    <div className="flex gap-3">
                      <button onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium bg-white/30 hover:bg-white/45 active:scale-95 transition-all"
                        style={{ color: GOLD_DARK }}>
                        <Share2 size={15} /> Share
                      </button>
                      <Link to="/search" onClick={() => setOpen(false)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-white/50 hover:bg-white/65 active:scale-95 transition-all"
                        style={{ color: GOLD_DARK }}>
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
