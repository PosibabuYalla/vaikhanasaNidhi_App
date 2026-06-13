import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Share2, ZoomIn, ZoomOut, Copy, Check, BookOpen } from "lucide-react";
import { SCRIPTURES, getCategoryInfo } from "../data/scriptures";
import { isBookmarked, addBookmark, removeBookmark, saveReadingProgress } from "../store/useAppStore";
import { toast } from "sonner";

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scripture = SCRIPTURES.find(s => s.id === id);
  const [fontSize, setFontSize] = useState(20);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(id));
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  const related = scripture
    ? SCRIPTURES.filter(s => s.category === scripture.category && s.id !== scripture.id).slice(0, 3)
    : [];

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
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="font-telugu text-xl text-gray-500 mb-4" style={{ fontFamily: "Tiro Telugu, serif" }}>
            Scripture not found
          </p>
          <button onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-white text-sm"
            style={{ background: "hsl(0 57% 27%)" }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const cat = getCategoryInfo(scripture.category);

  return (
    <div ref={containerRef} className="min-h-screen pb-12">

      {/* scroll progress */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gray-200 lg:left-64">
        <motion.div className="h-full" style={{ background: "hsl(41 56% 51%)" }}
          animate={{ width: scrollProgress + "%" }} transition={{ duration: 0.15 }} />
      </div>

      {/* sticky toolbar */}
      <div className="sticky top-1 z-40 mx-3 sm:mx-6 mt-3">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg px-3 py-2.5 flex items-center gap-2">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <span className="flex-1 font-telugu text-sm sm:text-base font-semibold truncate"
            style={{ color: "#7a1a1a", fontFamily: "Tiro Telugu, serif" }}>
            {scripture.title_telugu}
          </span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <ZoomOut size={15} />
            </button>
            <span className="text-xs text-gray-400 w-6 text-center hidden sm:inline">{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(32, s + 2))}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <ZoomIn size={15} />
            </button>
            <button onClick={toggleBookmark}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              style={{ color: bookmarked ? "hsl(41 56% 40%)" : "#6b7280" }}>
              <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <button onClick={handleShare}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* two-col on xl */}
      <div className="xl:flex xl:gap-6 xl:px-6 xl:mt-4">

        {/* main content */}
        <div className="xl:flex-1 min-w-0">

          {/* header card */}
          <div className={"mx-3 sm:mx-6 xl:mx-0 mt-3 sm:mt-4 bg-gradient-to-br " + cat.color + " rounded-3xl overflow-hidden shadow-xl"}>
            <div className="p-5 sm:p-7 lotus-bg">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-telugu"
                  style={{ fontFamily: "Tiro Telugu, serif" }}>{cat.label}</span>
                <span className="px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs">
                  {scripture.deity}
                </span>
              </div>
              <h1 className="font-telugu text-white font-bold leading-snug mb-2"
                style={{ fontFamily: "Tiro Telugu, serif", fontSize: Math.max(fontSize + 4, 24) }}>
                {scripture.title_telugu}
              </h1>
              <p className="text-white/55 text-sm mb-3 italic">{scripture.title_english}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400/80 rounded-full transition-all"
                    style={{ width: scrollProgress + "%" }} />
                </div>
                <span className="text-white/60 text-xs flex-shrink-0">
                  {scripture.verses.length} verses
                </span>
              </div>
            </div>
          </div>

          {/* description */}
          {scripture.description && (
            <div className="mx-3 sm:mx-6 xl:mx-0 mt-4 bg-white rounded-2xl p-4 sm:p-5 reader-border">
              <p className="font-telugu text-gray-600 text-sm sm:text-base leading-relaxed"
                style={{ fontFamily: "Tiro Telugu, serif", lineHeight: 1.8 }}>
                {scripture.description}
              </p>
            </div>
          )}

          {/* verses */}
          <div className="mx-3 sm:mx-6 xl:mx-0 mt-4 space-y-4">
            {scripture.verses.map((verse, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(idx * 0.06, 0.3) }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm reader-border group"
              >
                {/* verse header */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: "hsl(0 57% 27%)", fontSize: 10 }}>
                      {idx + 1}
                    </div>
                    <span className="text-xs text-gray-400">Verse</span>
                  </div>
                  <button onClick={() => copyVerse(verse, idx)}
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 text-xs">
                    {copiedIdx === idx
                      ? <Check size={13} className="text-green-500" />
                      : <Copy size={13} />}
                  </button>
                </div>

                {/* verse body: single col mobile, 2-col on md+ */}
                <div className="p-4 sm:p-5 md:grid md:grid-cols-2 md:gap-6 md:divide-x md:divide-gray-100">
                  <div className="md:pr-6">
                    <p className="font-telugu leading-loose whitespace-pre-line text-gray-900"
                      style={{ fontFamily: "Tiro Telugu, serif", fontSize, lineHeight: 1.9 }}>
                      {verse.telugu}
                    </p>
                  </div>

                  {/* mobile divider */}
                  <div className="md:hidden flex items-center gap-3 my-4">
                    <div className="flex-1 h-px"
                      style={{ background: "linear-gradient(90deg,transparent,hsl(41 56% 51%/0.35),transparent)" }} />
                    <span className="text-xs" style={{ color: "hsl(41 56% 51%)" }}>Meaning</span>
                    <div className="flex-1 h-px"
                      style={{ background: "linear-gradient(90deg,transparent,hsl(41 56% 51%/0.35),transparent)" }} />
                  </div>

                  <div className="md:pl-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 hidden md:block">
                      Meaning
                    </p>
                    <p className="font-telugu text-gray-600 leading-relaxed text-sm sm:text-base"
                      style={{ fontFamily: "Tiro Telugu, serif", lineHeight: 1.8 }}>
                      {verse.meaning}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* footer */}
          <div className="mx-3 sm:mx-6 xl:mx-0 mt-8 text-center pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">Completed</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <p className="font-telugu text-gray-400 text-xs"
              style={{ fontFamily: "Tiro Telugu, serif" }}>
              {scripture.title_telugu}
            </p>
          </div>
        </div>

        {/* related sidebar xl+ */}
        {related.length > 0 && (
          <div className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-3">
              <h3 className="font-telugu font-bold text-sm"
                style={{ color: "#7a1a1a", fontFamily: "Tiro Telugu, serif" }}>
                Related Scriptures
              </h3>
              {related.map(s => {
                const rc = getCategoryInfo(s.category);
                return (
                  <a key={s.id} href={"/read/" + s.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex">
                    <div className={"w-2 bg-gradient-to-b flex-shrink-0 " + rc.color} />
                    <div className="p-3 flex-1 min-w-0">
                      <span className="text-xs text-gray-400">{rc.label}</span>
                      <p className="font-telugu font-semibold text-sm leading-snug mt-0.5"
                        style={{ color: "#7a1a1a", fontFamily: "Tiro Telugu, serif" }}>
                        {s.title_telugu}
                      </p>
                    </div>
                    <div className="flex items-center pr-3">
                      <BookOpen size={14} className="text-gray-300" />
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