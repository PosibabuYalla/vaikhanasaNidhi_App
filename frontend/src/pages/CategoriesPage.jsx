import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CATEGORIES } from "../components/home/CategoryGrid";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <h1 className="font-telugu font-bold text-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
          All Categories
        </h1>
        <p className="text-sm text-muted mt-1">Sacred pathways to eternal knowledge</p>
      </div>

      <div className="px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const href = cat.link || "/search?cat=" + cat.key;
          return (
            <motion.a
              key={cat.key}
              href={href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="corner-card block p-5 hover:brightness-110 transition-all"
            >
              <div className="relative rounded-xl overflow-hidden mb-4 aspect-[4/3]" style={{ border: "1px solid var(--border-subtle)" }}>
                <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-page) 0%, transparent 70%)" }} />
                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center bg-elevated" style={{ border: "1px solid var(--border-subtle)" }}>
                  <Icon size={16} className="text-primary-gold" />
                </div>
              </div>
              <p className="font-telugu font-bold text-sm gold-glow mb-0.5" style={{ fontFamily: "Tiro Telugu, serif" }}>{cat.en}</p>
              <p className="font-telugu text-xs text-muted" style={{ fontFamily: "Tiro Telugu, serif" }}>{cat.label}</p>
              <p className="text-[10px] text-muted-light mt-2 uppercase tracking-wider">{cat.count}</p>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
