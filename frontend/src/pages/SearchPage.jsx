import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Hash, LayoutGrid, List, BookOpen } from "lucide-react";
import ScriptureCard from "../components/ScriptureCard";
import { SCRIPTURES, getCategoryInfo } from "../data/scriptures";
import { CATEGORIES } from "../components/home/CategoryGrid";

const GOLD = "#E4B24B";
const GOLD_SOLID = "#C88F2D";
const TRENDING = ["Venkateswara", "Gayatri", "Lakshmi", "Suprabhatam", "Sahasranama", "Mantra", "Narasimha", "Hayagriva"];
const ALL_CATS = [{ key: "all", label: "All" }, ...CATEGORIES];

function ScriptureRow({ scripture }) {
  const cat = getCategoryInfo(scripture.category);
  return (
    <a href={"/read/" + scripture.id}
      className="corner-card rounded-2xl flex items-center gap-3 p-3 active:brightness-110 transition-all w-full">
      <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-elevated"
        style={{ border: '1px solid var(--border-medium)' }}>
        <span className="font-bold gold-glow" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 15 }}>
          {scripture.title_telugu.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="rounded-full px-2 py-0.5 font-medium flex-shrink-0 text-xs"
            style={{ background: "#C88F2D22", color: GOLD, border: '1px solid #C88F2D33' }}>{cat.label}</span>
          {scripture.deity && <span className="text-muted-light truncate" style={{ fontSize: 10 }}>{scripture.deity}</span>}
        </div>
        <p className="font-bold truncate gold-glow" style={{ fontFamily: "Tiro Telugu, serif", fontSize: 13 }}>
          {scripture.title_telugu}
        </p>
        <p className="truncate text-muted" style={{ fontSize: 10 }}>{scripture.title_english}</p>
      </div>
      <BookOpen size={14} className="flex-shrink-0 text-muted" />
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
    <div className="min-h-screen w-full overflow-x-hidden page-bg">

      <div className="page-header-dark px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>Search</h1>
          <div className="flex gap-1 rounded-xl p-1 bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setView("list")}
              className="p-1.5 rounded-lg transition-all"
              style={{ background: view === "list" ? '#C88F2D22' : 'transparent', color: GOLD }}>
              <List size={15} />
            </button>
            <button onClick={() => setView("grid")}
              className="p-1.5 rounded-lg transition-all"
              style={{ background: view === "grid" ? '#C88F2D22' : 'transparent', color: GOLD }}>
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search scriptures, mantras, verses..."
            className="form-input pl-9 pr-9 py-2.5"
            style={{ fontFamily: "Tiro Telugu, serif" }}
            autoFocus />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 pt-3 pb-2" style={{ width: "max-content" }}>
          {ALL_CATS.map(cat => {
            const active = activeCat === cat.key;
            return (
              <button key={cat.key} onClick={() => setActiveCat(cat.key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: active ? GOLD_SOLID : 'var(--bg-card)',
                  color: active ? 'var(--bg-page)' : 'var(--text-muted)',
                  border: active ? 'none' : '1px solid var(--border-medium)',
                }}>
                {cat.label || cat.en}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-24">
        <AnimatePresence mode="wait">

          {!showResults && (
            <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="corner-card rounded-2xl p-4 mb-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={15} color={GOLD_SOLID} />
                  <span className="font-semibold text-sm gold-glow">Trending</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map(t => (
                    <button key={t} onClick={() => setQuery(t)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors bg-elevated"
                      style={{ border: '1px solid var(--border-medium)', color: GOLD }}>
                      <Hash size={10} style={{ color: GOLD_SOLID }} />{t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-muted text-xs mb-3">All scriptures ({SCRIPTURES.length})</p>
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
                <span className="text-muted text-xs">
                  {query && <span className="font-semibold gold-glow">"{query}" — </span>}
                  {results.length} results
                </span>
                {(query || activeCat !== "all") && (
                  <button onClick={() => { setQuery(""); setActiveCat("all"); }}
                    className="text-xs underline gold-glow">clear</button>
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
              className="text-center py-20 text-muted">
              <Search size={44} className="mx-auto mb-4 opacity-20" />
              <p className="text-base font-semibold gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>No results</p>
              <p className="text-xs mt-1 text-muted">Try different keywords</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
