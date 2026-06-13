import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Bookmark, CheckCircle, User, Star } from "lucide-react";
import { getReadingProgress, getBookmarks } from "../store/useAppStore";
import { getCategoryInfo } from "../data/scriptures";

const GOLD = "linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)";
const GOLD_SOLID = "#C88F2D";
const GOLD_DARK = "#8B6200";

export default function Profile() {
  const progress = getReadingProgress();
  const bookmarks = getBookmarks();
  const completed = progress.filter(p => p.progress >= 95).length;

  const stats = [
    { icon: BookOpen, label: "Read", value: progress.length, color: GOLD_SOLID, bg: "#E4B24B22" },
    { icon: CheckCircle, label: "Completed", value: completed, color: "#059669", bg: "#05966914" },
    { icon: Bookmark, label: "Saved", value: bookmarks.length, color: GOLD_DARK, bg: "#F6D67A44" },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "hsl(40 43% 95%)" }}>

      {/* Hero header */}
      <div className="px-4 pt-8 pb-16" style={{ background: GOLD }}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl bg-white/30">
              <User size={32} color={GOLD_DARK} strokeWidth={2} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow bg-white">
              <Star size={12} fill={GOLD_SOLID} color={GOLD_SOLID} />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-2xl" style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
              భక్తుడు
            </h1>
            <p className="text-sm mt-0.5" style={{ color: GOLD_DARK + '99', fontFamily: "Tiro Telugu, serif" }}>
              Vaikhanasa Bhakti Path
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto">

        {/* stats card */}
        <div className="-mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ border: '1px solid #E4B24B33' }}>
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex flex-col items-center gap-1 py-5 px-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5"
                      style={{ background: stat.bg }}>
                      <Icon size={18} color={stat.color} />
                    </div>
                    <span className="font-bold text-2xl tabular-nums" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                    <span className="text-gray-400 text-xs">{stat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* recent reading */}
        <section className="mt-6 pb-28">
          <h2 className="font-bold text-base mb-3" style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
            Recent Reading
          </h2>

          {progress.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-10 text-center shadow-sm" style={{ border: '1px solid #E4B24B22' }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#F6D67A33" }}>
                <BookOpen size={28} color={GOLD_SOLID} />
              </div>
              <p className="font-bold text-base mb-1" style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
                Nothing read yet
              </p>
              <p className="text-gray-400 text-sm mb-5">Start your devotional journey</p>
              <Link to="/search"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: GOLD, color: GOLD_DARK }}>
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
                      className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm block active:shadow-md transition-shadow"
                      style={{ border: '1px solid #E4B24B22' }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: GOLD }}>
                        <BookOpen size={16} color={GOLD_DARK} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="rounded-full px-2 py-0.5 font-medium flex-shrink-0 text-xs"
                            style={{ background: "#F6D67A55", color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
                            {cat.label}
                          </span>
                        </div>
                        <p className="font-semibold text-sm truncate"
                          style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
                          {item.title_telugu}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full"
                              style={{ background: done ? "#059669" : GOLD_SOLID }}
                              initial={{ width: 0 }} animate={{ width: item.progress + "%" }}
                              transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }} />
                          </div>
                          <span className="text-xs tabular-nums flex-shrink-0"
                            style={{ color: done ? "#059669" : "#9ca3af" }}>
                            {item.progress}%
                          </span>
                        </div>
                      </div>
                      {done && <CheckCircle size={18} color="#059669" className="flex-shrink-0" />}
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
