import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import HeroCard from "../components/home/HeroCard";
import CategoryGrid from "../components/home/CategoryGrid";
import PanchangamWidget from "../components/home/PanchangamWidget";
import ScriptureCard from "../components/ScriptureCard";
import { SCRIPTURES, getCategoryInfo } from "../data/scriptures";
import { getReadingProgress } from "../store/useAppStore";

export default function Home() {
  const [, forceUpdate] = useState(0);
  const progress = getReadingProgress();
  const popular = [...SCRIPTURES].sort((a, b) => b.popularity - a.popularity).slice(0, 6);

  return (
    <div className="pb-10">
      <div className="xl:flex xl:gap-0">

        {/* main column */}
        <div className="xl:flex-1 min-w-0">
          <HeroCard />
          <CategoryGrid />

          {/* continue reading */}
          {progress.length > 0 && (
            <section className="mt-6 px-4 sm:px-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-telugu font-bold text-base sm:text-lg" style={{ color: "#7d5200", fontFamily: "Tiro Telugu, serif" }}>
                  Continue Reading
                </h2>
                <Link to="/profile" className="flex items-center gap-1 text-xs" style={{ color: "hsl(38 80% 35%)" }}>
                  All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide">
                {progress.slice(0, 8).map(item => {
                  const cat = getCategoryInfo(item.category);
                  return (
                    <Link key={item.scripture_id} to={"/read/" + item.scripture_id}
                      className="flex-shrink-0 w-44 sm:w-52 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className={"bg-gradient-to-br p-3 " + cat.color}>
                        <span className="font-telugu text-white text-xs" style={{ fontFamily: "Tiro Telugu, serif" }}>{cat.label}</span>
                      </div>
                      <div className="p-3">
                        <p className="font-telugu text-sm font-semibold leading-snug mb-2 line-clamp-2"
                          style={{ color: "#7a1a1a", fontFamily: "Tiro Telugu, serif" }}>{item.title_telugu}</p>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full"
                            style={{ background: "hsl(38 80% 35%)", width: item.progress + "%" }}
                            initial={{ width: 0 }} animate={{ width: item.progress + "%" }} />
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{item.progress}%</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* panchangam widget - hidden on xl (shown in sidebar) */}
          <div className="xl:hidden"><PanchangamWidget /></div>

          {/* popular */}
          <section className="px-4 sm:px-6 mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} color="hsl(38 80% 35%)" />
                <h2 className="font-telugu font-bold text-base sm:text-lg" style={{ color: "#7d5200", fontFamily: "Tiro Telugu, serif" }}>
                  Popular Scriptures
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {popular.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* stats */}
          <section className="px-4 sm:px-6 mt-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 grid grid-cols-3 gap-2">
              {[
                { label: "Scriptures", value: SCRIPTURES.length, color: "hsl(38 80% 35%)" },
                { label: "Categories", value: 8, color: "hsl(41 56% 40%)" },
                { label: "Verses", value: SCRIPTURES.reduce((a, s) => a + s.verses.length, 0), color: "hsl(200 70% 40%)" },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col items-center gap-1 py-2">
                  <span className="font-bold text-2xl sm:text-3xl" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="text-gray-500 text-xs text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* desktop sidebar */}
        <div className="hidden xl:block w-80 flex-shrink-0 px-4 pt-4">
          <div className="sticky top-6 space-y-4">
            <PanchangamWidget />
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-telugu font-bold text-sm mb-3" style={{ color: "#7d5200", fontFamily: "Tiro Telugu, serif" }}>Quick Links</h3>
              <div className="space-y-1">
                {[
                  { to: "/panchangam", label: "Today Panchangam" },
                  { to: "/search", label: "Mantras" },
                  { to: "/search", label: "Stotras" },
                  { to: "/bookmarks", label: "My Bookmarks" },
                ].map(l => (
                  <Link key={l.label} to={l.to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="font-telugu text-sm text-gray-700" style={{ fontFamily: "Tiro Telugu, serif" }}>{l.label}</span>
                    <ChevronRight size={14} className="text-gray-400" />
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