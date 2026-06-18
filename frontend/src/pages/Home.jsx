import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import HeroCard from "../components/home/HeroCard";
import CategoryGrid from "../components/home/CategoryGrid";
import PanchangamWidget from "../components/home/PanchangamWidget";
import ScriptureCard from "../components/ScriptureCard";
import { SCRIPTURES, getCategoryInfo } from "../data/scriptures";
import { getReadingProgress } from "../store/useAppStore";
import { DAILY_SLOKAS } from "../data/scriptures";

export default function Home() {
  const [, forceUpdate] = useState(0);
  const progress = getReadingProgress();
  const popular = [...SCRIPTURES].sort((a, b) => b.popularity - a.popularity);
  const quoteSloka = DAILY_SLOKAS[0];

  return (
    <div className="pb-10">
      <div className="xl:flex xl:gap-0">

        <div className="xl:flex-1 min-w-0">
          <HeroCard />
          <CategoryGrid />

          {progress.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
                <h2 className="font-telugu font-bold text-scale-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                  Continue Reading
                </h2>
                <Link to="/continue-reading" className="flex items-center gap-1 text-scale-sm font-semibold uppercase text-primary-gold">
                  View All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="scroll-row scrollbar-gold px-4 sm:px-6 lg:px-8">
                {progress.map(item => {
                  const cat = getCategoryInfo(item.category);
                  return (
                    <Link
                      key={item.scripture_id}
                      to={"/read/" + item.scripture_id}
                      className="flex-shrink-0 w-44 sm:w-52 lg:w-56 gold-card overflow-hidden"
                    >
                      <div className="p-3 bg-elevated" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <span className="font-telugu text-scale-sm text-primary-gold" style={{ fontFamily: "Tiro Telugu, serif" }}>{cat.label}</span>
                      </div>
                      <div className="p-3">
                        <p className="font-telugu text-scale-base font-semibold leading-snug mb-2 line-clamp-2 gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                          {item.title_telugu}
                        </p>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-elevated">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: "linear-gradient(90deg, #C88F2D, #E4B24B)", width: item.progress + "%" }}
                            initial={{ width: 0 }}
                            animate={{ width: item.progress + "%" }}
                          />
                        </div>
                        <p className="text-scale-sm mt-1 text-muted">{item.progress}%</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <div className="xl:hidden"><PanchangamWidget /></div>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-gold" />
                <h2 className="font-telugu font-bold text-scale-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                  Popular Scriptures
                </h2>
              </div>
              <Link to="/popular" className="flex items-center gap-1 text-scale-sm font-semibold uppercase text-primary-gold">
                View All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="scroll-row scrollbar-gold px-4 sm:px-6 lg:px-8">
              {popular.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-shrink-0 w-56 sm:w-60 lg:w-64"
                >
                  <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                </motion.div>
              ))}
            </div>
          </section>

          <section className="px-4 sm:px-6 lg:px-8 mt-12 mb-4">
            <div className="flex flex-col items-center text-center py-10">
              <Sparkles size={20} className="text-primary-gold mb-3" style={{ filter: "drop-shadow(0 0 8px rgba(200,143,45,0.5))" }} />
              <p className="text-scale-sm font-semibold tracking-[0.25em] uppercase mb-6 text-muted">
                From the Vaikhanasa Agama
              </p>
              <p className="font-telugu font-bold leading-relaxed max-w-2xl gold-glow-strong text-scale-xl" style={{ fontFamily: "Tiro Telugu, serif" }}>
                {quoteSloka.telugu}
              </p>
            </div>
          </section>

          <section className="px-4 sm:px-6 lg:px-8 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="gold-card p-4 sm:p-5 grid grid-cols-3 gap-2"
            >
              {[
                { label: "Scriptures", value: SCRIPTURES.length },
                { label: "Categories", value: 8 },
                { label: "Verses", value: SCRIPTURES.reduce((a, s) => a + s.verses.length, 0) },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 260 }}
                  whileHover={{ scale: 1.06, y: -3 }}
                  className="flex flex-col items-center gap-1 py-2 rounded-lg transition-shadow"
                >
                  <span className="font-bold text-scale-3xl gold-glow">{stat.value}</span>
                  <span className="text-scale-sm text-center text-muted">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </section>
        </div>

        <div className="hidden xl:block w-80 flex-shrink-0 px-4 pt-4">
          <div className="sticky top-20 space-y-4">
            <PanchangamWidget />
            <div className="gold-card p-4">
              <h3 className="font-telugu font-bold text-scale-base mb-3 gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>Quick Links</h3>
              <div className="space-y-1">
                {[
                  { to: "/panchangam", label: "Today Panchangam" },
                  { to: "/search", label: "Mantras" },
                  { to: "/categories", label: "All Categories" },
                  { to: "/bookmarks", label: "My Bookmarks" },
                ].map(l => (
                  <Link
                    key={l.label}
                    to={l.to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--hover-bg)]"
                  >
                    <span className="font-telugu text-scale-sm text-secondary" style={{ fontFamily: "Tiro Telugu, serif" }}>{l.label}</span>
                    <ChevronRight size={14} className="text-muted" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
