import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Type, Globe, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { getSettings, saveSettings } from '../store/useAppStore';

export default function SettingsDrawer({ open, onClose }) {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    if (open) setSettings(getSettings());
  }, [open]);

  function update(key, val) {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSettings(next);
    if (key === 'darkMode') {
      if (val) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
    if (key === 'fontSize') {
      const map = { small: '14px', medium: '16px', large: '19px' };
      document.documentElement.style.fontSize = map[val] || '16px';
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 max-w-full z-50 bg-white shadow-2xl flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b temple-gradient">
              <h2 className="font-telugu text-white font-bold text-lg" style={{ fontFamily: 'Tiro Telugu, serif' }}>సెట్టింగ్స్</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Appearance */}
              <Section title="రూపం">
                <ToggleRow
                  icon={settings.darkMode ? Moon : Sun}
                  label="డార్క్ మోడ్"
                  value={settings.darkMode}
                  onChange={v => update('darkMode', v)} />

                <div className="flex items-center gap-3 px-4 py-3">
                  <Type size={18} className="text-gray-500" />
                  <span className="flex-1 font-telugu text-sm text-gray-700" style={{ fontFamily: 'Tiro Telugu, serif' }}>అక్షర పరిమాణం</span>
                  <div className="flex gap-1">
                    {['small', 'medium', 'large'].map(s => (
                      <button key={s}
                        onClick={() => update('fontSize', s)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${settings.fontSize === s ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                        style={{ background: settings.fontSize === s ? 'hsl(0 57% 27%)' : undefined }}>
                        {s === 'small' ? 'A' : s === 'medium' ? 'A' : 'A'}
                        <span className="sr-only">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <Globe size={18} className="text-gray-500" />
                  <span className="flex-1 font-telugu text-sm text-gray-700" style={{ fontFamily: 'Tiro Telugu, serif' }}>భాష</span>
                  <select value={settings.language} onChange={e => update('language', e.target.value)}
                    className="text-sm border rounded-lg px-2 py-1 text-gray-700 bg-gray-50">
                    <option value="telugu">తెలుగు</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </Section>

              {/* Notifications */}
              <Section title="నోటిఫికేషన్లు">
                <ToggleRow icon={Bell} label="రోజువారీ శ్లోకం" value={settings.notifyDailySloka}
                  onChange={v => update('notifyDailySloka', v)} />
                <ToggleRow icon={Bell} label="పంచాంగం" value={settings.notifyPanchangam}
                  onChange={v => update('notifyPanchangam', v)} />
              </Section>

              {/* About */}
              <Section title="గురించి">
                <LinkRow icon={Shield} label="గోప్యతా విధానం" />
                <LinkRow icon={HelpCircle} label="సహాయం & మద్దతు" />
              </Section>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t text-center">
              <p className="font-telugu text-gray-400 text-xs" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                వైఖానస నిధి v3.0 / © 2024
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-b last:border-0">
      <div className="px-5 pt-4 pb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={18} className="text-gray-500" />
      <span className="flex-1 font-telugu text-sm text-gray-700" style={{ fontFamily: 'Tiro Telugu, serif' }}>{label}</span>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all duration-200 relative ${value ? '' : 'bg-gray-200'}`}
        style={{ background: value ? 'hsl(0 57% 27%)' : undefined }}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function LinkRow({ icon: Icon, label }) {
  return (
    <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 transition-colors">
      <Icon size={18} className="text-gray-500" />
      <span className="flex-1 font-telugu text-sm text-gray-700 text-left" style={{ fontFamily: 'Tiro Telugu, serif' }}>{label}</span>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}
