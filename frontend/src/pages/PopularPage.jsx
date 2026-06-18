import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, TrendingUp } from "lucide-react";
import ScriptureCard from "../components/ScriptureCard";
import { SCRIPTURES } from "../data/scriptures";

export default function PopularPage() {
  const [, forceUpdate] = useState(0);
  const popular = [...SCRIPTURES].sort((a, b) => b.popularity - a.popularity);

  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-gold" />
          <h1 className="font-telugu font-bold text-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
            Popular Scriptures
          </h1>
        </div>
        <p className="text-sm text-muted mt-1">{popular.length} scriptures by popularity</p>
      </div>

      <div className="px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {popular.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
