import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, BookOpen, BookmarkX, Grid, List } from "lucide-react";
import { getBookmarks, removeBookmark } from "../store/useAppStore";
import { getCategoryInfo, SCRIPTURES } from "../data/scriptures";
import ScriptureCard from "../components/ScriptureCard";
import { toast } from "sonner";

const GOLD = "linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)";
const GOLD_SOLID = "#C88F2D";
const GOLD_DARK = "#8B6200";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState(getBookmarks);
  const [view, setView] = useState("list");

  function remove(id) {
    removeBookmark(id);
    setBookmarks(getBookmarks());
    toast.success("Removed");
  }

  const bookmarkedScriptures = bookmarks
    .map(b => SCRIPTURES.find(s => s.id === b.scripture_id))
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* header */}
      <div className="px-4 sm:px-6 pt-5 sm:pt-8 pb-5 sm:pb-6" style={{ background: GOLD }}>
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="font-telugu font-bold text-2xl sm:text-3xl mb-1"
              style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>Bookmarks</h1>
            <p className="text-sm" style={{ color: GOLD_DARK + '99' }}>{bookmarks.length} saved scriptures</p>
          </div>
          {bookmarks.length > 0 && (
            <div className="flex gap-1 bg-white/25 rounded-xl p-1">
              <button onClick={() => setView("list")}
                className={"p-2 rounded-lg transition-all " + (view === "list" ? "bg-white shadow" : "")}
                style={{ color: view === "list" ? GOLD_DARK : GOLD_DARK + '99' }}>
                <List size={16} />
              </button>
              <button onClick={() => setView("grid")}
                className={"p-2 rounded-lg transition-all " + (view === "grid" ? "bg-white shadow" : "")}
                style={{ color: view === "grid" ? GOLD_DARK : GOLD_DARK + '99' }}>
                <Grid size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-4 pb-28">
        <AnimatePresence mode="wait">

          {bookmarks.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-24">
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: "#F6D67A44" }}>
                <BookmarkX size={36} color={GOLD_SOLID} />
              </div>
              <p className="font-telugu text-xl font-semibold mb-2"
                style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>No Bookmarks</p>
              <p className="text-gray-500 text-sm mb-6">Tap the bookmark icon while reading to save</p>
              <Link to="/search"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
                style={{ background: GOLD, color: GOLD_DARK }}>
                <BookOpen size={16} /> Browse Scriptures
              </Link>
            </motion.div>
          )}

          {bookmarks.length > 0 && view === "grid" && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {bookmarkedScriptures.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}>
                  <ScriptureCard scripture={s} onBookmarkChange={() => setBookmarks(getBookmarks())} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {bookmarks.length > 0 && view === "list" && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-3">
              {bookmarks.map((b, i) => {
                const cat = getCategoryInfo(b.category);
                return (
                  <motion.div key={b.scripture_id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }}
                    layout
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex"
                    style={{ border: '1px solid #E4B24B22' }}>
                    <div className="w-1.5 flex-shrink-0" style={{ background: GOLD }} />
                    <div className="flex-1 p-3 sm:p-4 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: GOLD }}>
                        <Bookmark size={16} color={GOLD_DARK} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-telugu font-medium"
                            style={{ background: "#F6D67A55", color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
                            {cat.label}
                          </span>
                          {b.deity && <span className="text-gray-400 text-xs hidden sm:inline">{b.deity}</span>}
                        </div>
                        <p className="font-telugu font-semibold text-sm sm:text-base truncate"
                          style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
                          {b.title_telugu}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link to={"/read/" + b.scripture_id}
                          className="p-2 sm:p-2.5 rounded-xl transition-colors hover:bg-amber-50 text-gray-400 hover:text-amber-600">
                          <BookOpen size={16} />
                        </Link>
                        <button onClick={() => remove(b.scripture_id)}
                          className="p-2 sm:p-2.5 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
