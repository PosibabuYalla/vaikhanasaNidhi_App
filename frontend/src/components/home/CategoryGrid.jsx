import { motion } from "framer-motion";
import { Music, Zap, Hash, List, BookMarked, FlameKindling, CalendarDays, Library, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import imgStotras from "../../assets/catagoryImages/stotras.png";
import imgMantras from "../../assets/catagoryImages/mantralu.png";
import imgAshtottaram from "../../assets/catagoryImages/astothranamalu.png";
import imgSahasranamam from "../../assets/catagoryImages/sahastranamalu.png";
import imgAgama from "../../assets/catagoryImages/agama.png";
import imgPooja from "../../assets/catagoryImages/puja_vidhanam.png";
import imgPanchangam from "../../assets/catagoryImages/Panchangam.png";
import imgBooks from "../../assets/catagoryImages/grandalu.png";

export const CATEGORIES = [
  { key: "stotra",         label: "స్తోత్రాలు",       en: "Stotras",       icon: Music,          count: "12 Stotras",   img: imgStotras      },
  { key: "mantra",         label: "మంత్రాలు",          en: "Mantras",        icon: Zap,            count: "12 Mantras",   img: imgMantras      },
  { key: "ashtottaram",    label: "అష్టోత్తరalu",      en: "Ashtottarams",   icon: Hash,           count: "8 Names",      img: imgAshtottaram  },
  { key: "sahasranamam",   label: "సహస్రనామalu",      en: "Sahasranama",    icon: List,           count: "1000 Names",   img: imgSahasranamam },
  { key: "agama",          label: "ఆగమalu",            en: "Agamas",         icon: BookMarked,     count: "5 Procedures", img: imgAgama        },
  { key: "pooja_vidhanam", label: "పూజా విధానalu",    en: "Pooja",          icon: FlameKindling,  count: "8 Rituals",    img: imgPooja        },
  { key: "panchangam",     label: "పంచాంగం",          en: "Panchangam",     icon: CalendarDays,   count: "Daily",        img: imgPanchangam,  link: "/panchangam" },
  { key: "book",           label: "గ్రంధalu",         en: "Books",          icon: Library,        count: "20 Books",     img: imgBooks        },
];

function CategoryGrid() {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-telugu font-bold text-scale-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
            All Categories
          </h2>
          <p className="text-scale-sm mt-1 text-muted">Sacred pathways to eternal knowledge</p>
        </div>
        <Link to="/categories" className="flex items-center gap-1 text-scale-sm font-semibold tracking-wider uppercase text-primary-gold">
          View All <ChevronRight size={12} />
        </Link>
      </div>

      <div className="scroll-row scrollbar-gold px-4 sm:px-6 lg:px-8">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const href = cat.link || "/search?cat=" + cat.key;
          return (
            <motion.a
              key={cat.key}
              href={href}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.93 }}
              className="category-tile relative flex-shrink-0 rounded-xl overflow-hidden cursor-pointer select-none w-[100px] sm:w-[110px] lg:w-[120px]"
              style={{ aspectRatio: "1 / 1.2", border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}
            >
              <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover opacity-60" loading="lazy" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-page) 0%, color-mix(in srgb, var(--bg-page) 40%, transparent) 60%, transparent 100%)" }} />
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-2">
                <div className="self-end">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-elevated" style={{ border: "1px solid var(--border-subtle)" }}>
                    <Icon size={13} className="text-primary-gold" />
                  </div>
                </div>
                <span className="w-full text-center font-semibold leading-tight text-primary-gold text-scale-xs font-telugu" style={{ fontFamily: "Tiro Telugu, serif" }}>
                  {cat.en}
                </span>
              </div>

              <div className="category-popup">
                <p className="font-telugu font-bold text-scale-sm gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>{cat.en}</p>
                <p className="font-telugu text-scale-xs text-muted mt-0.5" style={{ fontFamily: "Tiro Telugu, serif" }}>{cat.label}</p>
                <p className="text-scale-xs text-muted-light mt-1 uppercase tracking-wider">{cat.count}</p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryGrid;
