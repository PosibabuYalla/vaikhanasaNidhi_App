import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Bookmark, CheckCircle, User, Star } from "lucide-react";
import { getReadingProgress, getBookmarks } from "../store/useAppStore";
import { getCategoryInfo } from "../data/scriptures";

const GOLD = "#E4B24B";
const GOLD_SOLID = "#C88F2D";

export default function Profile() {
  const progress = getReadingProgress();
  const bookmarks = getBookmarks();
  const completed = progress.filter(p => p.progress >= 95).length;

  const stats = [
    { icon: BookOpen, label: "Read", value: progress.length, color: GOLD, bg: "#C88F2D22" },
    { icon: CheckCircle, label: "Completed", value: completed, color: "#4ade80", bg: "#4ade8018" },
    { icon: Bookmark, label: "Saved", value: bookmarks.length, color: GOLD_SOLID, bg: "#C88F2D18" },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden page-bg">

      <div className="page-header-dark px-4 pt-8 pb-16">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full flex items-center justify-center corner-card"
              style={{ boxShadow: '0 0 24px rgba(200,143,45,0.25)' }}>
              <User size={32} color={GOLD} strokeWidth={2} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              className="w-20 h-20 rounded-full flex items-center justify-center bg-elevated"
              style={{ border: '1px solid var(--border-medium)' }}>
              <Star size={12} fill={GOLD_SOLID} color={GOLD_SOLID} />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-2xl gold-glow-strong" style={{ fontFamily: "Tiro Telugu, serif" }}>
              భక్తుడు
            </h1>
            <p className="text-sm mt-0.5 text-muted" style={{ fontFamily: "Tiro Telugu, serif" }}>
              Vaikhanasa Bhakti Path
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto">
        <div className="-mt-8 relative z-10">
          <div className="corner-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3" style={{ borderColor: '#C88F2D15' }}>
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex flex-col items-center gap-1 py-5 px-2"
                    style={{ borderRight: i < 2 ? '1px solid #C88F2D15' : undefined }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5"
                      style={{ background: stat.bg, border: '1px solid #C88F2D22' }}>
                      <Icon size={18} color={stat.color} />
                    </div>
                    <span className="font-bold text-2xl tabular-nums gold-glow">{stat.value}</span>
                    <span className="text-xs text-muted">{stat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <section className="mt-6 pb-28">
          <h2 className="font-bold text-base mb-3 gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
            Recent Reading
          </h2>

          {progress.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="corner-card rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#C88F2D18", border: '1px solid #C88F2D33' }}>
                <BookOpen size={28} color={GOLD_SOLID} />
              </div>
              <p className="font-bold text-base mb-1 gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                Nothing read yet
              </p>
              <p className="text-muted text-sm mb-5">Start your devotional journey</p>
              <Link to="/search" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold btn-gold">
                <BookOpen size={14} /> Browse Scriptures
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {progress.map((item, i) => {
                const cat = getCategoryInfo(item.category);
                const done = item.progress >= 95;
                return (
                  <motion.div key={item.scripture_id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <Link to={"/read/" + item.scripture_id}
                      className="corner-card rounded-2xl p-4 flex items-center gap-3 block hover:brightness-110 transition-all">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        className="w-20 h-20 rounded-full flex items-center justify-center bg-elevated"
              style={{ border: '1px solid var(--border-medium)' }}>
                        <BookOpen size={16} color={GOLD} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="rounded-full px-2 py-0.5 font-medium flex-shrink-0 text-xs"
                            style={{ background: "#C88F2D22", color: GOLD, fontFamily: "Tiro Telugu, serif", border: '1px solid #C88F2D33' }}>
                            {cat.label}
                          </span>
                        </div>
                        <p className="font-semibold text-sm truncate gold-glow"
                          style={{ fontFamily: "Tiro Telugu, serif" }}>
                          {item.title_telugu}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#222' }}>
                            <motion.div className="h-full rounded-full"
                              style={{ background: done ? "#4ade80" : 'linear-gradient(90deg, #C88F2D, #E4B24B)' }}
                              initial={{ width: 0 }} animate={{ width: item.progress + "%" }}
                              transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }} />
                          </div>
                          <span className="text-xs tabular-nums flex-shrink-0"
                            style={{ color: done ? "#4ade80" : '#C88F2D88' }}>
                            {item.progress}%
                          </span>
                        </div>
                      </div>
                      {done && <CheckCircle size={18} color="#4ade80" className="flex-shrink-0" />}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
