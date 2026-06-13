import { motion } from "framer-motion";
import { Music, Zap, Hash, List, BookMarked, FlameKindling, CalendarDays, Library, Images } from "lucide-react";

import imgStotras from "../../assets/catagoryImages/stotras.png";
import imgMantras from "../../assets/catagoryImages/mantralu.png";
import imgAshtottaram from "../../assets/catagoryImages/astothranamalu.png";
import imgSahasranamam from "../../assets/catagoryImages/sahastranamalu.png";
import imgAgama from "../../assets/catagoryImages/agama.png";
import imgPooja from "../../assets/catagoryImages/puja_vidhanam.png";
import imgPanchangam from "../../assets/catagoryImages/Panchangam.png";
import imgBooks from "../../assets/catagoryImages/grandalu.png";

export const CATEGORIES = [
  { key: "stotra",         label: "Stotras",       icon: Music,          color: "#7a1a1a",  img: imgStotras      },
  { key: "mantra",         label: "Mantras",        icon: Zap,            color: "#92400e",  img: imgMantras      },
  { key: "ashtottaram",    label: "Ashtottarams",   icon: Hash,           color: "#4c1d95",  img: imgAshtottaram  },
  { key: "sahasranamam",   label: "Sahasranama",    icon: List,           color: "#1e3a8a",  img: imgSahasranamam },
  { key: "agama",          label: "Agamas",         icon: BookMarked,     color: "#064e3b",  img: imgAgama        },
  { key: "pooja_vidhanam", label: "Pooja",          icon: FlameKindling,  color: "#713f12",  img: imgPooja        },
  { key: "panchangam",     label: "Panchangam",     icon: CalendarDays,   color: "#0c4a6e",  img: imgPanchangam,  link: "/panchangam" },
  { key: "book",           label: "Books",          icon: Library,        color: "#1c1917",  img: imgBooks        },
  { key: "gallery",        label: "Gallery",        icon: Images,         color: "#065f46",  img: imgAgama,       link: "/gallery" },
];

function CategoryGrid() {
  return (
    <section className="px-4 sm:px-6 mt-6">
      <h2
        className="font-telugu font-bold text-base sm:text-lg mb-3"
        style={{ color: "#7a1a1a", fontFamily: "Tiro Telugu, serif" }}
      >
        Categories
      </h2>

      <div className="flex sm:grid sm:grid-cols-5 md:grid-cols-9 gap-2 sm:gap-3 overflow-x-auto pb-1 sm:overflow-x-visible sm:pb-0 scrollbar-hide">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const href = cat.link || "/search?cat=" + cat.key;

          return (
            <motion.a
              key={cat.key}
              href={href}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.07, y: -3 }}
              whileTap={{ scale: 0.93 }}
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer select-none flex-shrink-0 sm:flex-shrink"
              style={{ aspectRatio: "1 / 1.2", width: "72px", minWidth: "72px" }}
            >
              {/* bg photo */}
              <img
                src={cat.img}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />

              {/* very light colour tint overlay — just 30% opacity */}
              <div
                className="absolute inset-0"
                style={{ background: cat.color, opacity: 0.30 }}
              />

              {/* subtle bottom gradient so text is always readable */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }}
              />

              {/* content */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-2 sm:p-2.5">
                {/* icon top-right badge */}
                <div className="self-end">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon size={13} color="white" />
                  </div>
                </div>

                {/* label at bottom */}
                <span
                  className="w-full text-center text-white font-semibold leading-tight drop-shadow-sm"
                  style={{ fontFamily: "Tiro Telugu, serif", fontSize: "10px" }}
                >
                  {cat.label}
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryGrid;