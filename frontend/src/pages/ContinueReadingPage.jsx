import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen, CheckCircle } from "lucide-react";
import { getReadingProgress } from "../store/useAppStore";
import { getCategoryInfo } from "../data/scriptures";

export default function ContinueReadingPage() {
  const progress = getReadingProgress();

  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <h1 className="font-telugu font-bold text-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
          Continue Reading
        </h1>
        <p className="text-sm text-muted mt-1">{progress.length} in progress</p>
      </div>

      <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
        {progress.length === 0 ? (
          <div className="corner-card rounded-2xl p-10 text-center">
            <BookOpen size={32} className="mx-auto mb-4 text-primary-gold" />
            <p className="font-telugu font-bold gold-glow mb-2" style={{ fontFamily: "Tiro Telugu, serif" }}>Nothing read yet</p>
            <Link to="/search" className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 text-sm mt-4">
              Browse Scriptures
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {progress.map((item, i) => {
              const cat = getCategoryInfo(item.category);
              const done = item.progress >= 95;
              return (
                <motion.div key={item.scripture_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={"/read/" + item.scripture_id} className="corner-card rounded-2xl p-4 flex items-center gap-3 block hover:brightness-110 transition-all">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-elevated" style={{ border: "1px solid var(--border-medium)" }}>
                      <BookOpen size={16} className="text-primary-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="rounded-full px-2 py-0.5 text-xs text-primary-gold bg-elevated" style={{ border: "1px solid var(--border-subtle)", fontFamily: "Tiro Telugu, serif" }}>
                        {cat.label}
                      </span>
                      <p className="font-telugu font-semibold text-sm truncate gold-glow mt-1" style={{ fontFamily: "Tiro Telugu, serif" }}>
                        {item.title_telugu}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-elevated">
                          <div className="h-full rounded-full" style={{ width: item.progress + "%", background: done ? "#4ade80" : "linear-gradient(90deg, #C88F2D, #E4B24B)" }} />
                        </div>
                        <span className="text-xs tabular-nums text-muted">{item.progress}%</span>
                      </div>
                    </div>
                    {done && <CheckCircle size={18} color="#4ade80" className="flex-shrink-0" />}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
