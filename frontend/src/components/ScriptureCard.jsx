import { Link } from "react-router-dom";
import { Bookmark, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryInfo } from "../data/scriptures";
import { isBookmarked, addBookmark, removeBookmark } from "../store/useAppStore";
import { useState } from "react";

const GOLD = "#C88F2D";
const GOLD_DARK = "#8B6200";

export default function ScriptureCard({ scripture, onBookmarkChange }) {
  const cat = getCategoryInfo(scripture.category);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(scripture.id));

  function toggleBookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) { removeBookmark(scripture.id); setBookmarked(false); }
    else { addBookmark(scripture); setBookmarked(true); }
    onBookmarkChange?.();
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col w-full"
      style={{ border: '1px solid #E4B24B22' }}
    >
      {/* coloured header — golden gradient */}
      <div className="flex items-start justify-between relative overflow-hidden p-2.5"
        style={{ background: 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <pattern id={"dp-" + scripture.id} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="1.2" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill={"url(#dp-" + scripture.id + ")"} />
          </svg>
        </div>
        <div className="z-10 flex-1 min-w-0 pr-1">
          <span className="inline-block px-2 py-0.5 rounded-full bg-white/30 font-medium leading-none"
            style={{ fontSize: 10, fontFamily: "Tiro Telugu, serif", color: GOLD_DARK }}>
            {cat.label}
          </span>
          {scripture.deity && (
            <p className="mt-0.5 truncate" style={{ fontSize: 10, fontFamily: "Tiro Telugu, serif", color: GOLD_DARK + 'bb' }}>
              {scripture.deity}
            </p>
          )}
        </div>
        <button onClick={toggleBookmark}
          className={"z-10 p-1 rounded-full flex-shrink-0 transition-all " +
            (bookmarked ? "bg-white/60" : "bg-white/20 hover:bg-white/35")}>
          <Bookmark size={12} fill={bookmarked ? GOLD_DARK : "none"} color={GOLD_DARK} />
        </button>
      </div>

      {/* body */}
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="font-bold leading-snug mb-1 line-clamp-2"
          style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif", fontSize: 12 }}>
          {scripture.title_telugu}
        </h3>
        <p className="text-gray-400 line-clamp-1 mb-2" style={{ fontSize: 10 }}>
          {scripture.title_english}
        </p>
        <Link to={"/read/" + scripture.id}
          className="mt-auto flex items-center gap-1 font-semibold"
          style={{ color: GOLD, fontSize: 11, fontFamily: "Tiro Telugu, serif" }}>
          <BookOpen size={11} />
          Read
        </Link>
      </div>
    </motion.div>
  );
}
