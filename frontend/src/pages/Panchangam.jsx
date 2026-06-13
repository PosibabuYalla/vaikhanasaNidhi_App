import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Moon, Clock, Star, Sunrise, Sunset, Sparkles } from "lucide-react";
import { getPanchangamForDate } from "../lib/panchangam";

const GOLD = "linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)";
const GOLD_DARK = "#8B6200";
const GOLD_SOLID = "#C88F2D";

const CARDS = [
  { key: "tithi",      label: "Tithi",      icon: Moon,    color: "from-indigo-400 to-purple-500" },
  { key: "nakshatra",  label: "Nakshatra",  icon: Star,    color: "from-amber-400 to-yellow-500"  },
  { key: "rahukalam",  label: "Rahukalam",  icon: Clock,   color: "from-red-400 to-rose-500"      },
  { key: "yamagandam", label: "Yamagandam", icon: Clock,   color: "from-orange-400 to-red-400"    },
  { key: "sunrise",    label: "Sunrise",    icon: Sunrise, color: "from-amber-300 to-orange-400"  },
  { key: "sunset",     label: "Sunset",     icon: Sunset,  color: "from-rose-300 to-pink-500"     },
];

export default function Panchangam() {
  const [date, setDate] = useState(new Date());
  const data = getPanchangamForDate(date);

  function prevDay() { setDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; }); }
  function nextDay() { setDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; }); }

  return (
    <div className="min-h-screen">
      {/* header */}
      <div className="px-4 sm:px-6 pt-5 sm:pt-8 pb-5" style={{ background: GOLD }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="font-telugu font-bold text-2xl sm:text-3xl mb-4"
            style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>Panchangam</h1>
          <div className="flex items-center gap-3 bg-white/25 rounded-2xl p-3">
            <button onClick={prevDay} className="p-2 rounded-xl bg-white/30 hover:bg-white/50 transition-colors flex-shrink-0"
              style={{ color: GOLD_DARK }}>
              <ChevronLeft size={18} />
            </button>
            <div className="flex-1 text-center">
              <p className="font-telugu font-bold text-base sm:text-lg leading-tight"
                style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>{data.dateLabel}</p>
              <p className="text-sm font-telugu" style={{ color: GOLD_DARK + '99', fontFamily: "Tiro Telugu, serif" }}>{data.day}</p>
            </div>
            <button onClick={nextDay} className="p-2 rounded-xl bg-white/30 hover:bg-white/50 transition-colors flex-shrink-0"
              style={{ color: GOLD_DARK }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* auspicious banner */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #065f46, #047857)" }}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} color="white" />
          </div>
          <div className="min-w-0">
            <p className="text-white/70 text-xs mb-0.5">Auspicious Time</p>
            <p className="font-telugu text-white font-semibold text-sm sm:text-base"
              style={{ fontFamily: "Tiro Telugu, serif" }}>{data.auspicious}</p>
          </div>
        </motion.div>

        {/* cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.key}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm"
                style={{ border: '1px solid #E4B24B22' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={"w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br flex items-center justify-center " + card.color}>
                    <Icon size={16} color="white" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">{card.label}</span>
                </div>
                <p className="font-telugu text-lg sm:text-xl font-bold"
                  style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
                  {data[card.key]}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* full details */}
        <div className="mt-4 mb-8 bg-white rounded-2xl p-4 sm:p-6 shadow-sm" style={{ border: '1px solid #E4B24B22' }}>
          <h3 className="font-telugu font-bold text-base sm:text-lg mb-4"
            style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>Full Details</h3>
          <div className="divide-y divide-gray-50">
            {[
              ["Date", data.dateLabel], ["Day", data.day], ["Tithi", data.tithi],
              ["Nakshatra", data.nakshatra], ["Rahukalam", data.rahukalam],
              ["Yamagandam", data.yamagandam], ["Sunrise", data.sunrise], ["Sunset", data.sunset],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3">
                <span className="font-telugu text-gray-500 text-sm sm:text-base"
                  style={{ fontFamily: "Tiro Telugu, serif" }}>{label}</span>
                <span className="font-telugu font-semibold text-sm sm:text-base"
                  style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
