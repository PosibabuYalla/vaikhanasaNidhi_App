import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Hash, LayoutGrid, List, BookOpen } from "lucide-react";
import ScriptureCard from "../components/ScriptureCard";
import { SCRIPTURES, getCategoryInfo } from "../data/scriptures";
import { CATEGORIES } from "../components/home/CategoryGrid";

const GOLD = "linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)";
const GOLD_SOLID = "#C88F2D";
const GOLD_DARK = "#8B6200";

const TRENDING = ["Venkateswara", "Gayatri", "Lakshmi", "Suprabhatam", "Sahasranama", "Mantra", "Narasimha", "Hayagriva"];
const ALL_CATS = [{ key: "all", label: "All" }, ...CATEGORIES];

function ScriptureRow({ scripture }) {
  const cat = getCategoryInfo(scripture.category);
  return (
    <a href={"/read/" + scripture.id}
      className="bg-white rounded-2xl flex items-center gap-3 p-3 shadow-sm active:shadow-md transition-all w-full"
      style={{ border: '1px solid #E4B24B22' }}>
      <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ background: GOLD }}>
        <span className="font-bold" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 15, color: GOLD_DARK }}>
          {scripture.title_telugu.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="rounded-full px-2 py-0.5 font-medium flex-shrink-0 text-xs"
            style={{ background: "#F6D67A55", color: GOLD_DARK }}>{cat.label}</span>
          {scripture.deity && <span className="text-gray-400 truncate" style={{ fontSize: 10 }}>{scripture.deity}</span>}
        </div>
        <p className="font-bold truncate" style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif", fontSize: 13 }}>
          {scripture.title_telugu}
        </p>
        <p className="text-gray-400 truncate" style={{ fontSize: 10 }}>{scripture.title_english}</p>
      </div>
      <BookOpen size={14} className="text-gray-300 flex-shrink-0" />
    </a>
  );
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(params.get("cat") || "all");
  const [view, setView] = useState("list");
  const [, forceUpdate] = useState(0);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return SCRIPTURES.filter(s => {
      const matchCat = activeCat === "all" || s.category === activeCat;
      const matchSearch = !q ||
        s.title_telugu.includes(query) ||
        s.title_english.toLowerCase().includes(q) ||
        s.deity?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.verses?.some(v => v.telugu.includes(query) || v.meaning.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [query, activeCat]);

  const showResults = query.trim() || activeCat !== "all";

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "hsl(40 43% 95%)" }}>

      {/* header */}
      <div className="px-4 pt-4 pb-4" style={{ background: GOLD }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-xl" style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>Search</h1>
          <div className="flex gap-1 rounded-xl p-1 bg-white/30">
            <button onClick={() => setView("list")}
              className={"p-1.5 rounded-lg transition-all " + (view === "list" ? "bg-white shadow" : "")}
              style={{ color: GOLD_DARK }}>
              <List size={15} />
            </button>
            <button onClick={() => setView("grid")}
              className={"p-1.5 rounded-lg transition-all " + (view === "grid" ? "bg-white shadow" : "")}
              style={{ color: GOLD_DARK }}>
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search scriptures, mantras, verses..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white text-sm focus:outline-none"
            style={{ fontFamily: "Tiro Telugu, serif" }}
            autoFocus />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* category chips */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 pt-3 pb-2" style={{ width: "max-content" }}>
          {ALL_CATS.map(cat => {
            const active = activeCat === cat.key;
            return (
              <button key={cat.key} onClick={() => setActiveCat(cat.key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: active ? GOLD_SOLID : "white",
                  color: active ? "white" : "#6b7280",
                  border: active ? "none" : "1px solid #E4B24B44",
                }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-24">
        <AnimatePresence mode="wait">

          {!showResults && (
            <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 mt-2" style={{ border: '1px solid #E4B24B22' }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={15} color={GOLD_SOLID} />
                  <span className="font-semibold text-sm" style={{ color: GOLD_DARK }}>Trending</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map(t => (
                    <button key={t} onClick={() => setQuery(t)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors"
                      style={{ background: "#F6D67A33", border: "1px solid #E4B24B44", color: GOLD_DARK }}>
                      <Hash size={10} style={{ color: GOLD_SOLID }} />{t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-gray-500 text-xs mb-3">All scriptures ({SCRIPTURES.length})</p>
              {view === "list" ? (
                <div className="space-y-2">
                  {SCRIPTURES.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                      <ScriptureRow scripture={s} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {SCRIPTURES.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                      <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {showResults && results.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between py-2 mb-2">
                <span className="text-gray-500 text-xs">
                  {query && <span className="font-semibold" style={{ color: GOLD_DARK }}>"{query}" — </span>}
                  {results.length} results
                </span>
                {(query || activeCat !== "all") && (
                  <button onClick={() => { setQuery(""); setActiveCat("all"); }}
                    className="text-xs underline" style={{ color: GOLD_SOLID }}>clear</button>
                )}
              </div>
              {view === "list" ? (
                <div className="space-y-2">
                  {results.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.25) }}>
                      <ScriptureRow scripture={s} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {results.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.25) }}>
                      <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {showResults && results.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-400">
              <Search size={44} className="mx-auto mb-4 opacity-20" />
              <p className="text-base font-semibold" style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>No results</p>
              <p className="text-xs mt-1">Try different keywords</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
