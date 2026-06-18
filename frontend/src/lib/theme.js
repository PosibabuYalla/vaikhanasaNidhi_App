const MODE_VARS = {
  dark: {
    '--bg-page': '#0a0a0a',
    '--bg-card': '#141414',
    '--bg-elevated': '#1a1a1a',
    '--bg-nav': 'rgba(10, 10, 10, 0.92)',
    '--bg-overlay': 'rgba(0, 0, 0, 0.7)',
    '--bg-input': '#1a1a1a',
    '--border-subtle': '#C88F2D22',
    '--border-medium': '#C88F2D44',
    '--gold-mantra': '#D4AF37',
    '--gold-heading': '#C9A227',
    '--gold-strong': '#D4AF37',
    '--text-shadow-gold': '0 1px 2px rgba(0, 0, 0, 0.4)',
    '--scrollbar-track': '#141414',
    '--header-gradient': 'linear-gradient(180deg, #1a1407 0%, #0a0a0a 100%)',
    '--hero-glow': 'radial-gradient(circle at 70% 50%, rgba(200,143,45,0.14) 0%, transparent 60%)',
    '--drawer-bg': '#111111',
    '--hover-bg': 'rgba(255, 255, 255, 0.05)',
  },
  light: {
    '--bg-page': '#FAFAF8',
    '--bg-card': '#FFFFFF',
    '--bg-elevated': '#F5F3EE',
    '--bg-nav': 'rgba(250, 250, 248, 0.96)',
    '--bg-overlay': 'rgba(0, 0, 0, 0.35)',
    '--bg-input': '#FFFFFF',
    '--border-subtle': '#C88F2D30',
    '--border-medium': '#C88F2D55',
    '--gold-mantra': '#8B6914',
    '--gold-heading': '#7A5A08',
    '--gold-strong': '#9A7209',
    '--text-shadow-gold': '0 1px 0 rgba(255, 255, 255, 0.6)',
    '--scrollbar-track': '#F0EDE6',
    '--header-gradient': 'linear-gradient(180deg, #FFF9ED 0%, #FAFAF8 100%)',
    '--hero-glow': 'radial-gradient(circle at 70% 50%, rgba(200,143,45,0.1) 0%, transparent 60%)',
    '--drawer-bg': '#FFFFFF',
    '--hover-bg': 'rgba(200, 143, 45, 0.08)',
  },
};

const TEXT_PRESETS_DARK = {
  standard: {
    '--text-primary': '#E4B24B',
    '--text-secondary': '#D4B86A',
    '--text-muted': '#B8954A',
    '--text-body': '#E8D5A0',
  },
  bright: {
    '--text-primary': '#F6D67A',
    '--text-secondary': '#F5E8B8',
    '--text-muted': '#E4B24B',
    '--text-body': '#FFF0C8',
  },
  maximum: {
    '--text-primary': '#FFF8E7',
    '--text-secondary': '#FFF5DC',
    '--text-muted': '#F5E6B8',
    '--text-body': '#FFFFFF',
  },
};

const TEXT_PRESETS_LIGHT = {
  standard: {
    '--text-primary': '#8B6914',
    '--text-secondary': '#6B5200',
    '--text-muted': '#A08030',
    '--text-body': '#4A3800',
  },
  bright: {
    '--text-primary': '#9A7209',
    '--text-secondary': '#7A5A08',
    '--text-muted': '#B8860B',
    '--text-body': '#3D2E00',
  },
  maximum: {
    '--text-primary': '#2D2200',
    '--text-secondary': '#3D2E00',
    '--text-muted': '#5C4500',
    '--text-body': '#1A1200',
  },
};

const FONT_SIZE_MAP = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
};

const READER_BASE_FONT = {
  small: 17,
  medium: 20,
  large: 23,
  xlarge: 26,
};

const DEFAULT_SETTINGS = {
  themeMode: 'dark',
  fontSize: 'large',
  textColor: 'bright',
  notifyDailySloka: true,
  notifyPanchangam: false,
};

export function getReaderBaseFontSize(fontSize = 'medium') {
  return READER_BASE_FONT[fontSize] || READER_BASE_FONT.medium;
}

export function applyTheme(settings = {}) {
  const themeMode = settings.themeMode || DEFAULT_SETTINGS.themeMode;
  const fontSize = settings.fontSize || DEFAULT_SETTINGS.fontSize;
  const textColor = settings.textColor || DEFAULT_SETTINGS.textColor;
  const modeVars = MODE_VARS[themeMode] || MODE_VARS.dark;
  const textPresets = themeMode === 'light' ? TEXT_PRESETS_LIGHT : TEXT_PRESETS_DARK;
  const textVars = textPresets[textColor] || textPresets.bright;
  const root = document.documentElement;

  root.style.fontSize = FONT_SIZE_MAP[fontSize] || FONT_SIZE_MAP.medium;
  root.dataset.theme = themeMode;
  root.dataset.textColor = textColor;
  root.dataset.fontSize = fontSize;

  Object.entries({ ...modeVars, ...textVars }).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  window.dispatchEvent(new CustomEvent('themechange', { detail: { fontSize, textColor, themeMode } }));
}

export { MODE_VARS, FONT_SIZE_MAP, DEFAULT_SETTINGS };
