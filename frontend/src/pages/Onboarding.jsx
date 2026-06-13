import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Bell, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import { markOnboardingDone } from '../store/useAppStore';
import logo from '../assets/images/logo.png';

const SLIDES = [
  {
    step: '1 / 4',
    icon: null,
    useAppLogo: true,
    title: 'శ్రీ వైఖానస నిధి కీ స్వాగతం',
    desc: 'మంత్రాలు, స్తోత్రాలు మరియు వైఖానస సంప్రదాయ విషయాలు ఒకే చోట.',
    btnLabel: 'కొనసాగండి',
    btnStyle: 'outline',
    extraBtn: null,
  },
  {
    step: '2 / 4',
    icon: Shield,
    iconBg: '#fdf0e6',
    iconColor: '#e07b2a',
    title: 'లాగిన్ తప్పనిసరి',
    desc: 'యాప్ కంటెంట్‌ను సురక్షితంగా వీక్షించడానికి దయచేసి లాగిన్ అవ్వండి.',
    btnLabel: 'లాగిన్ అవ్వండి / కొనసాగండి',
    btnStyle: 'filled',
    btnColor: '#e07b2a',
    extraBtn: null,
  },
  {
    step: '3 / 4',
    icon: Bell,
    iconBg: '#fdf0e6',
    iconColor: '#e07b2a',
    title: 'నోటిఫికేషన్లను అనుమతించండి',
    desc: 'కొత్త కంటెంట్ అప్డేట్లు, పండుగ సమాచారం మరియు ముఖ్యమైన నోటిఫికేషన్లను పొందడానికి అనుమతించండి.',
    btnLabel: 'నోటిఫికేషన్లు అనుమతించండి',
    btnStyle: 'filled',
    btnColor: '#e07b2a',
    extraBtn: null,
  },
  {
    step: '4 / 4',
    icon: BookOpen,
    iconBg: '#fdf0e6',
    iconColor: '#e07b2a',
    title: 'కంటెంట్ అన్వేషించండి',
    desc: 'భక్తి కంటెంట్‌ను సులభంగా శోధించండి, చదవండి మరియు సేవ్ చేయండి.',
    btnLabel: 'యాప్ ఉపయోగించడం ప్రారంభించండి',
    btnStyle: 'green',
    btnColor: '#1a6b3a',
    extraBtn: null,
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  function next() {
    if (isLast) {
      markOnboardingDone();
      onDone();
    } else {
      setStep(s => s + 1);
    }
  }

  function skip() {
    markOnboardingDone();
    onDone();
  }

  const IconComp = slide.icon;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'hsl(40 43% 90%)' }}>
      <div className="w-full max-w-sm mx-auto h-full flex flex-col px-5 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-telugu text-sm" style={{ color: '#e07b2a', fontFamily: 'Tiro Telugu, serif' }}>
            పరిచయం • {slide.step}
          </span>
          {step < SLIDES.length - 1 && (
            <button onClick={skip} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              దాటవేయి
            </button>
          )}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex-1 bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center px-8 py-10 gap-6"
          >
            {/* Icon / Logo */}
            {slide.useAppLogo ? (
              <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: 'radial-gradient(circle at 35% 35%, #ffd700, #c9a84c 40%, #8b6914 80%)', boxShadow: '0 4px 24px #c9a84c66' }}>
                <img src={logo} alt="Vaikhanasa Nidhi" className="w-16 h-16 object-contain" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: slide.iconBg }}>
                {IconComp && <IconComp size={36} color={slide.iconColor} strokeWidth={1.5} />}
              </div>
            )}

            {/* Title */}
            <h2 className="text-center font-telugu text-2xl font-bold leading-snug"
              style={{ color: '#7a1a1a', fontFamily: 'Tiro Telugu, serif' }}>
              {slide.title}
            </h2>

            {/* Desc */}
            <p className="text-center text-gray-600 font-telugu leading-relaxed text-base"
              style={{ fontFamily: 'Tiro Telugu, serif' }}>
              {slide.desc}
            </p>

            {/* Action button inside card (for slides 2,3,4) */}
            {slide.btnStyle === 'filled' && (
              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-telugu text-base font-semibold transition-all active:scale-95"
                style={{ background: slide.btnColor, fontFamily: 'Tiro Telugu, serif' }}
              >
                {slide.btnLabel}
              </button>
            )}
            {slide.btnStyle === 'green' && (
              <button
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-white font-telugu text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background: slide.btnColor, fontFamily: 'Tiro Telugu, serif' }}
              >
                {slide.btnLabel}
                <ArrowRight size={18} />
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 my-6">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 28 : 10, background: i === step ? '#e07b2a' : '#d1c4a8' }}
              transition={{ duration: 0.3 }}
              className="h-2.5 rounded-full"
            />
          ))}
        </div>

        {/* Bottom continue button (slide 1) */}
        {slide.btnStyle === 'outline' && (
          <button
            onClick={next}
            className="w-full py-4 rounded-2xl border-2 text-gray-700 font-telugu text-base font-semibold flex items-center justify-center gap-2 bg-white/70 transition-all active:scale-95"
            style={{ borderColor: '#ddd', fontFamily: 'Tiro Telugu, serif' }}
          >
            {slide.btnLabel} <ChevronRight size={18} />
          </button>
        )}
        {(slide.btnStyle === 'filled' || slide.btnStyle === 'green') && (
          <button
            onClick={next}
            className="w-full py-4 rounded-2xl border-2 text-gray-500 font-telugu text-base bg-white/60 flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ borderColor: '#ddd', fontFamily: 'Tiro Telugu, serif' }}
          >
            కొనసాగండి <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
