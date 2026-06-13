import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Bookmark, Calendar, User, Menu, X, Settings, ChevronRight, LogOut } from 'lucide-react';
import SettingsDrawer from './SettingsDrawer';
import logo from '../assets/images/logo.png';

const NAV_LINKS = [
  { to: '/',           icon: Home,     label: 'హోం' },
  { to: '/search',     icon: Search,   label: 'శోధన' },
  { to: '/bookmarks',  icon: Bookmark, label: 'బుక్మార్క్స్' },
  { to: '/panchangam', icon: Calendar, label: 'పంచాంగం' },
  { to: '/profile',    icon: User,     label: 'ప్రొఫైల్' },
];

const GOLD = 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)';
const GOLD_DARK = '#8B6200';
const GOLD_MID = '#C88F2D';

export default function Layout({ children, onLogout }) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(40 43% 95%)' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full z-30 shadow-2xl" style={{ background: GOLD }}>
        <div className="flex items-center gap-3 px-6 py-7 border-b border-white/20">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/20">
            <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="font-telugu font-bold text-lg leading-tight" style={{ color: GOLD_DARK, fontFamily: 'Tiro Telugu, serif' }}>వైఖానస నిధి</div>
            <div className="text-xs" style={{ color: GOLD_DARK + 'aa' }}>Sacred Library</div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-telugu text-sm"
              style={{
                background: isActive(to) ? 'rgba(255,255,255,0.35)' : 'transparent',
                color: isActive(to) ? GOLD_DARK : GOLD_DARK + 'bb',
                fontFamily: 'Tiro Telugu, serif',
              }}>
              <Icon size={18} strokeWidth={isActive(to) ? 2.5 : 1.8} />
              {label}
              {isActive(to) && <motion.div layoutId="sidebar-pill" className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: GOLD_DARK }} />}
            </Link>
          ))}
        </nav>
        <div className="px-4 pb-6 space-y-1">
          <button onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all font-telugu text-sm hover:bg-white/20"
            style={{ color: GOLD_DARK + 'bb', fontFamily: 'Tiro Telugu, serif' }}>
            <Settings size={18} />
            సెట్టింగ్స్
          </button>
          {onLogout && (
            <button onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all font-telugu text-sm hover:bg-white/20"
              style={{ color: GOLD_DARK + 'bb', fontFamily: 'Tiro Telugu, serif' }}>
              <LogOut size={18} />
              లాగ్అవుట్
            </button>
          )}
          <div className="mt-3 text-center text-xs" style={{ color: GOLD_DARK + '88' }}>వైఖానస నిధి v3.0</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-14 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
        style={{ background: GOLD }}>
        <button onClick={() => setDrawerOpen(true)} className="p-2" style={{ color: GOLD_DARK }}>
          <Menu size={22} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-telugu font-bold text-base leading-none" style={{ color: GOLD_DARK, fontFamily: 'Tiro Telugu, serif' }}>వైఖానస నిధి</span>
          <span className="text-xs" style={{ color: GOLD_DARK + '99' }}>Sacred Library</span>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="p-2" style={{ color: GOLD_DARK }}>
          <Settings size={20} />
        </button>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 z-50 shadow-2xl flex flex-col lg:hidden"
              style={{ background: GOLD }}>
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/25">
                    <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <div className="font-telugu font-bold" style={{ color: GOLD_DARK, fontFamily: 'Tiro Telugu, serif' }}>వైఖానస నిధి</div>
                    <div className="text-xs" style={{ color: GOLD_DARK + '99' }}>Sacred Library</div>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} style={{ color: GOLD_DARK }}><X size={20} /></button>
              </div>
              <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to} onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-telugu text-sm transition-all"
                    style={{
                      background: isActive(to) ? 'rgba(255,255,255,0.35)' : 'transparent',
                      color: isActive(to) ? GOLD_DARK : GOLD_DARK + 'bb',
                      fontFamily: 'Tiro Telugu, serif',
                    }}>
                    <Icon size={18} />
                    {label}
                    {isActive(to) && <ChevronRight size={14} className="ml-auto" style={{ color: GOLD_DARK }} />}
                  </Link>
                ))}
              </nav>
              <div className="px-4 pb-6">
                <button onClick={() => { setDrawerOpen(false); setSettingsOpen(true); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl w-full font-telugu text-sm hover:bg-white/20"
                  style={{ color: GOLD_DARK + 'bb', fontFamily: 'Tiro Telugu, serif' }}>
                  <Settings size={18} /> సెట్టింగ్స్
                </button>
                {onLogout && (
                  <button onClick={() => { setDrawerOpen(false); onLogout(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full font-telugu text-sm hover:bg-white/20"
                    style={{ color: GOLD_DARK + 'bb', fontFamily: 'Tiro Telugu, serif' }}>
                    <LogOut size={18} /> లాగ్అవుట్
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 pt-14 lg:pt-0 overflow-x-hidden min-w-0">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t shadow-lg flex items-center" style={{ borderColor: '#E4B24B33' }}>
        {NAV_LINKS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to} className="flex-1 flex flex-col items-center py-2 gap-0.5 relative">
              {active && (
                <motion.div layoutId="bottom-pill"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                  style={{ background: GOLD_MID }} />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} color={active ? GOLD_MID : '#9ca3af'} />
              <span className="font-telugu text-[10px]"
                style={{ fontFamily: 'Tiro Telugu, serif', color: active ? GOLD_MID : '#9ca3af' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
