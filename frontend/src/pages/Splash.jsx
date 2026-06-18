import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState("in");   // "in" | "hold" | "out"

  useEffect(() => {
    // hold for 2.2 s total, then fade out over 0.6 s
    const t1 = setTimeout(() => setPhase("out"), 2200);
    const t2 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== "out" && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(160deg, #1a0a00 0%, #2e0d0d 40%, #0f0a00 100%)" }}
        >

          {/* ── ambient glow rings ── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 520, height: 520, background: "radial-gradient(circle, #c9a84c18 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 320, height: 320, background: "radial-gradient(circle, #7a1a1a22 0%, transparent 70%)" }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />

          {/* ── rotating outer ring ── */}
          <motion.div
            className="absolute rounded-full border border-yellow-600/20 pointer-events-none"
            style={{ width: 300, height: 300 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <div
                key={deg}
                className="absolute w-1.5 h-1.5 rounded-full bg-yellow-500/60"
                style={{
                  top: "50%", left: "50%",
                  transform: "rotate(" + deg + "deg) translateX(148px) translateY(-50%)"
                }}
              />
            ))}
          </motion.div>

          {/* ── counter-rotate inner ring ── */}
          <motion.div
            className="absolute rounded-full border border-red-800/25 pointer-events-none"
            style={{ width: 230, height: 230 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            {[0, 60, 120, 180, 240, 300].map(deg => (
              <div
                key={deg}
                className="absolute w-1 h-1 rounded-full bg-red-400/50"
                style={{
                  top: "50%", left: "50%",
                  transform: "rotate(" + deg + "deg) translateX(113px) translateY(-50%)"
                }}
              />
            ))}
          </motion.div>

          {/* ── logo ── */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
          >
            {/* logo image with pulse glow */}
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            >
              {/* glow behind logo */}
              <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: "radial-gradient(circle, #c9a84c55 0%, transparent 70%)", transform: "scale(1.4)" }}
              />
              <img
                src="/vaikhanasa.png"
                alt="Vaikhanasa Nidhi"
                className="relative z-10 drop-shadow-2xl"
                style={{ width: 180, height: 180, objectFit: "contain" }}
              />
            </motion.div>

            {/* app name */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              <p
                className="gold-gradient-text font-telugu text-xl font-medium tracking-normal leading-tight"
              >
                వైఖానస మహాగురవే నమః
              </p>
              <p className="text-white/40 text-xs tracking-[0.3em] mt-1 uppercase">Sacred Scripture Library</p>
            </motion.div>
          </motion.div>

          {/* ── loading dots ── */}
          <motion.div
            className="absolute bottom-16 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: "#c9a84c" }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </motion.div>

          {/* ── om symbol watermark ── */}
          {/* <motion.div
            className="absolute text-white/4 pointer-events-none select-none"
            style={{ fontSize: 320, fontFamily: "serif", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            ॐ
          </motion.div> */}

        </motion.div>
      )}
    </AnimatePresence>
  );
}