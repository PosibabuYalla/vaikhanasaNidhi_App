import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Bell, Shield, HelpCircle, ChevronRight, Palette, Moon, Sun } from 'lucide-react';
import { getSettings, saveSettings } from '../store/useAppStore';
import { applyTheme } from '../lib/theme';

const FONT_OPTIONS = [
  { id: 'small', label: 'S' },
  { id: 'medium', label: 'M' },
  { id: 'large', label: 'L' },
  { id: 'xlarge', label: 'XL' },
];

const COLOR_OPTIONS_DARK = [
  { id: 'standard', label: 'Standard', sample: '#E4B24B', desc: 'Classic gold' },
  { id: 'bright', label: 'Bright', sample: '#F6D67A', desc: 'Easier to read' },
  { id: 'maximum', label: 'Maximum', sample: '#FFF8E7', desc: 'Highest contrast' },
];

const COLOR_OPTIONS_LIGHT = [
  { id: 'standard', label: 'Standard', sample: '#8B6914', desc: 'Classic gold' },
  { id: 'bright', label: 'Bright', sample: '#9A7209', desc: 'Easier to read' },
  { id: 'maximum', label: 'Maximum', sample: '#2D2200', desc: 'Highest contrast' },
];

export default function SettingsDrawer({ open, onClose }) {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    if (open) setSettings(getSettings());
  }, [open]);

  function update(key, val) {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSettings(next);
    applyTheme(next);
  }

  const colorOptions = settings.themeMode === 'light' ? COLOR_OPTIONS_LIGHT : COLOR_OPTIONS_DARK;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: 'var(--bg-overlay)' }} onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="settings-drawer fixed right-0 top-0 h-full w-80 max-w-full z-50 shadow-2xl flex flex-col">

            <div className="flex items-center justify-between px-5 py-4 border-gold" style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}>
              <h2 className="font-semibold text-lg gold-glow" style={{ fontFamily: 'Playfair Display, serif' }}>Settings</h2>
              <button onClick={onClose} className="text-muted hover:opacity-80"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Section title="Appearance">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-3">
                    {settings.themeMode === 'dark' ? <Moon size={18} className="text-muted" /> : <Sun size={18} className="text-muted" />}
                    <span className="flex-1 text-sm text-body">Theme</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => update('themeMode', 'dark')}
                      className={`theme-pill flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold ${settings.themeMode === 'dark' ? 'active' : ''}`}
                    >
                      <Moon size={14} /> Dark
                    </button>
                    <button
                      onClick={() => update('themeMode', 'light')}
                      className={`theme-pill flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold ${settings.themeMode === 'light' ? 'active' : ''}`}
                    >
                      <Sun size={14} /> Light
                    </button>
                  </div>
                  <p className="text-[10px] text-muted mt-2 text-center">
                    {settings.themeMode === 'dark' ? 'Black background with gold glow' : 'White background with gold glow'}
                  </p>
                </div>
              </Section>

              <Section title="Reading">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-3">
                    <Type size={18} className="text-muted" />
                    <span className="flex-1 text-sm text-body">Font size</span>
                  </div>
                  <div className="flex gap-2">
                    {FONT_OPTIONS.map(s => (
                      <button key={s.id}
                        onClick={() => update('fontSize', s.id)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all theme-pill ${settings.fontSize === s.id ? 'active' : ''}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-3">
                    <Palette size={18} className="text-muted" />
                    <span className="flex-1 text-sm text-body">Text brightness</span>
                  </div>
                  <div className="space-y-2">
                    {colorOptions.map(opt => (
                      <button key={opt.id}
                        onClick={() => update('textColor', opt.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left bg-elevated"
                        style={{
                          border: settings.textColor === opt.id ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                          background: settings.textColor === opt.id ? 'var(--hover-bg)' : 'var(--bg-elevated)',
                        }}>
                        <div className="w-6 h-6 rounded-full flex-shrink-0"
                          style={{ background: opt.sample, boxShadow: `0 0 8px ${opt.sample}66` }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-body">{opt.label}</p>
                          <p className="text-xs text-muted">{opt.desc}</p>
                        </div>
                        {settings.textColor === opt.id && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#C88F2D' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-4 mb-3 p-3 rounded-xl page-bg" style={{ border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[10px] uppercase tracking-wider text-muted mb-2">Preview</p>
                  <p className="font-telugu gold-glow-strong text-base mb-1" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                    ఓం నమో నారాయణాయ
                  </p>
                  <p className="font-telugu reading-meaning text-sm" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                    Salutations to Lord Narayana
                  </p>
                </div>
              </Section>

              <Section title="Notifications">
                <ToggleRow icon={Bell} label="Daily sloka" value={settings.notifyDailySloka}
                  onChange={v => update('notifyDailySloka', v)} />
                <ToggleRow icon={Bell} label="Panchangam" value={settings.notifyPanchangam}
                  onChange={v => update('notifyPanchangam', v)} />
              </Section>

              <Section title="About">
                <LinkRow icon={Shield} label="Privacy policy" />
                <LinkRow icon={HelpCircle} label="Help & support" />
              </Section>
            </div>

            <div className="px-5 py-4 text-center border-gold" style={{ borderTopWidth: 1, borderTopStyle: 'solid' }}>
              <p className="font-telugu text-xs text-muted-light" style={{ fontFamily: 'Tiro Telugu, serif' }}>
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
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="px-5 pt-4 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, value, onChange }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={18} className="text-muted" />
      <span className="flex-1 text-sm text-body">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-all duration-200 relative"
        style={{ background: value ? 'linear-gradient(135deg, #C88F2D, #E4B24B)' : 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`}
          style={{ background: value ? 'var(--bg-page)' : 'var(--text-muted)' }}
        />
      </button>
    </div>
  );
}

function LinkRow({ icon: Icon, label }) {
  return (
    <button className="flex items-center gap-3 px-4 py-3 w-full transition-colors" style={{ background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <Icon size={18} className="text-muted" />
      <span className="flex-1 text-sm text-left text-body">{label}</span>
      <ChevronRight size={16} className="text-muted-light" />
    </button>
  );
}
