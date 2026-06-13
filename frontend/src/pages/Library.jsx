import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, LayoutGrid, List, BookOpen } from "lucide-react";
import ScriptureCard from "../components/ScriptureCard";
import { SCRIPTURES, getCategoryInfo } from "../data/scriptures";
import { CATEGORIES } from "../components/home/CategoryGrid";

const ALL_CATS = [{ key: "all", label: "All" }, ...CATEGORIES];

function ScriptureRow({ scripture }) {
  const cat = getCategoryInfo(scripture.category);
  return (
    <a
      href={"/read/" + scripture.id}
      className="bg-white rounded-2xl flex items-center gap-3 p-3 shadow-sm hover:shadow-md active:scale-98 transition-all"
    >
      {/* coloured avatar */}
      <div
        className={"w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center " + cat.color}
      >
        <span className="text-white font-bold" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 18 }}>
          {scripture.title_telugu.charAt(0)}
        </span>
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span
            className="text-white rounded-full px-2 py-0.5 font-medium"
            style={{ background: "hsl(0 57% 27%)", fontSize: 9 }}
          >
            {cat.label}
          </span>
          {scripture.deity && (
            <span className="text-gray-400 text-xs hidden sm:inline">{scripture.deity}</span>
          )}
        </div>
        <p
          className="font-telugu font-bold truncate"
          style={{ color: "#7a1a1a", fontFamily: "Tiro Telugu, serif", fontSize: 14 }}
        >
          {scripture.title_telugu}
        </p>
        <p className="text-gray-400 truncate text-xs">{scripture.title_english}</p>
      </div>

      {/* meta */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className="text-gray-300 text-xs">{scripture.verses.length}v</span>
        <BookOpen size={14} className="text-gray-300" />
      </div>
    </a>
  );
}

export default function Library() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(params.get("cat") || "all");
  const [view, setView] = useState("grid");
  const [, forceUpdate] = useState(0);

  const filtered = useMemo(() => SCRIPTURES.filter(s => {
    const matchCat = activeCat === "all" || s.category === activeCat;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.title_telugu.includes(q) ||
      s.title_english.toLowerCase().includes(q) ||
      s.deity?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  }), [search, activeCat]);

  return (
    <div className="min-h-screen" style={{ background: "hsl(40 43% 95%)" }}>

      {/* ── Header ── */}
      <div className="temple-gradient px-4 sm:px-6 pt-5 sm:pt-7 pb-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1
              className="font-telugu text-white font-bold text-xl sm:text-2xl md:text-3xl"
              style={{ fontFamily: "Tiro Telugu, serif" }}
            >
              Library
            </h1>
            {/* grid / list toggle */}
            <div className="flex gap-1 bg-white/15 rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                className={"p-1.5 sm:p-2 rounded-lg transition-all " +
                  (view === "grid" ? "bg-white text-gray-700 shadow" : "text-white/70 hover:text-white")}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                className={"p-1.5 sm:p-2 rounded-lg transition-all " +
                  (view === "list" ? "bg-white text-gray-700 shadow" : "text-white/70 hover:text-white")}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {/* search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or deity..."
              className="w-full pl-9 pr-9 py-2.5 sm:py-3 rounded-xl bg-white text-sm focus:outline-none"
              style={{ fontFamily: "Tiro Telugu, serif" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">

        {/* ── Category filter chips ── */}
        <div className="flex gap-2 overflow-x-auto px-4 sm:px-6 pt-3 pb-2 scrollbar-hide">
          {ALL_CATS.map(cat => {
            const active = activeCat === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCat(cat.key)}
                className={
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all " +
                  (active
                    ? "text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300")
                }
                style={{ background: active ? "hsl(0 57% 27%)" : undefined }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Count + clear ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2">
          <span className="text-gray-500 text-xs sm:text-sm">{filtered.length} scriptures</span>
          {activeCat !== "all" && (
            <button
              onClick={() => setActiveCat("all")}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              clear
            </button>
          )}
        </div>

        {/* ── Cards ── */}
        <div className="px-3 sm:px-6 pb-10">
          <AnimatePresence mode="wait">

            {/* grid */}
            {view === "grid" && filtered.length > 0 && (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid gap-2 sm:gap-3 md:gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
              >
                {filtered.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.35) }}
                    className="min-w-0"
                  >
                    <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* list */}
            {view === "list" && filtered.length > 0 && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-2 sm:space-y-3"
              >
                {filtered.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <ScriptureRow scripture={s} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* empty */}
            {filtered.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-400"
              >
                <Search size={44} className="mx-auto mb-4 opacity-20" />
                <p className="font-telugu text-base font-semibold"
                  style={{ color: "#7a1a1a", fontFamily: "Tiro Telugu, serif" }}>
                  No results found
                </p>
                <p className="text-xs mt-1">Try different keywords</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}