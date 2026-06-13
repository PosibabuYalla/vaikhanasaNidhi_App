import { Link } from "react-router-dom";
import { Sun, Moon, Clock, Star, ChevronRight } from "lucide-react";
import { getPanchangamForDate } from "../../lib/panchangam";

const GOLD = "linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)";
const GOLD_DARK = "#8B6200";

export default function PanchangamWidget() {
  const data = getPanchangamForDate(new Date());

  return (
    <div className="mx-4 sm:mx-6 mt-6 bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E4B24B33' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: GOLD }}>
        <div>
          <h3 className="font-telugu font-bold text-sm" style={{ color: GOLD_DARK, fontFamily: "Tiro Telugu, serif" }}>
            Today Panchangam
          </h3>
          <p className="text-xs" style={{ color: GOLD_DARK + '99' }}>{data.dateLabel} - {data.day}</p>
        </div>
        <Link to="/panchangam" className="flex items-center gap-1 text-xs font-semibold" style={{ color: GOLD_DARK }}>
          More <ChevronRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-100">
        <Cell icon={<Moon size={14} className="text-indigo-500" />} label="Tithi" value={data.tithi} />
        <Cell icon={<Star size={14} style={{ color: '#C88F2D' }} />} label="Nakshatra" value={data.nakshatra} />
        <Cell icon={<Clock size={14} className="text-red-400" />} label="Rahukalam" value={data.rahukalam} />
        <Cell icon={<Sun size={14} className="text-orange-400" />} label="Sunrise" value={data.sunrise} />
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100" style={{ background: "hsl(40 43% 97%)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <p className="text-xs text-green-700 font-medium">{data.auspicious}</p>
        </div>
      </div>
    </div>
  );
}

function Cell({ icon, label, value }) {
  return (
    <div className="px-4 py-3 flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">{icon}<span className="text-gray-400 text-xs">{label}</span></div>
      <span className="font-telugu text-sm font-semibold" style={{ color: '#8B6200', fontFamily: "Tiro Telugu, serif" }}>
        {value}
      </span>
    </div>
  );
}
