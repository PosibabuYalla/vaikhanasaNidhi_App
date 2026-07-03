import { Link } from "react-router-dom";
import { Bookmark, BookOpen } from "lucide-react";
import { getCategoryInfo } from "../utils/categoryLookup";
import { usePublicCategories } from "../hooks/usePublicCategories";
import { useBookmarks, useBookmarkActions } from "../hooks/useUserData";
import { useState, useEffect } from "react";

const GOLD = "#E4B24B";

export default function ScriptureCard({ scripture, onBookmarkChange }) {
  const { data: mainCategories = [] } = usePublicCategories();
  const cat = getCategoryInfo(scripture.category, mainCategories);
  const { data: bookmarks = [] } = useBookmarks();
  const { addMutation, removeMutation, isBookmarked } = useBookmarkActions();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(scripture.id, bookmarks));
  }, [bookmarks, scripture.id, isBookmarked]);

  function toggleBookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) {
      removeMutation.mutate(scripture.id, {
        onSuccess: () => { setBookmarked(false); onBookmarkChange?.(); },
      });
    } else {
      addMutation.mutate(scripture, {
        onSuccess: () => { setBookmarked(true); onBookmarkChange?.(); },
      });
    }
  }

  return (
    <Link
      to={"/read/" + scripture.id}
      className="gold-card overflow-hidden h-full flex flex-col w-full hover:brightness-105 transition-all"
    >
      <div className="flex items-start justify-between relative overflow-hidden p-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex-1 min-w-0 pr-1">
          <span
            className="inline-block px-2 py-0.5 rounded-full font-medium leading-none text-primary-gold text-scale-xs font-telugu"
            style={{ border: "1px solid var(--border-medium)", background: "var(--bg-elevated)", fontFamily: "Tiro Telugu, serif" }}
          >
            {cat.label}
          </span>
          {scripture.deity && (
            <p className="mt-1 truncate text-scale-xs text-muted font-telugu" style={{ fontFamily: "Tiro Telugu, serif" }}>
              {scripture.deity}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={toggleBookmark}
          className="p-1 rounded-full flex-shrink-0 transition-all hover:bg-white/5"
          style={{ border: "1px solid var(--border-subtle)" }}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark size={12} fill={bookmarked ? GOLD : "none"} color={GOLD} />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold leading-snug mb-1 line-clamp-2 gold-glow text-scale-sm font-telugu" style={{ fontFamily: "Tiro Telugu, serif" }}>
          {scripture.title_telugu}
        </h3>
        <p className="line-clamp-1 mb-2 text-scale-xs text-muted">
          {scripture.title_english}
        </p>
        <span
          className="mt-auto flex items-center gap-1 font-semibold text-scale-sm text-primary-gold font-telugu"
          style={{ fontFamily: "Tiro Telugu, serif" }}
        >
          <BookOpen size={12} />
          Read
        </span>
      </div>
    </Link>
  );
}
