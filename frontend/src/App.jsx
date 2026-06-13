import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';

import Layout from './components/Layout';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Reader from './pages/Reader';
import SearchPage from './pages/SearchPage';
import Bookmarks from './pages/Bookmarks';
import Panchangam from './pages/Panchangam';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import Gallery from './pages/Gallery';
import { hasSeenOnboarding, getSettings } from './store/useAppStore';
import { getAuth, isAdmin, logout } from './store/authStore';

const queryClient = new QueryClient();

function PageWrapper({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [phase, setPhase] = useState('splash'); // 'splash' | 'onboarding' | 'login' | 'app' | 'admin'

  useEffect(() => {
    const settings = getSettings();
    if (settings.darkMode) document.documentElement.classList.add('dark');
    const fontMap = { small: '14px', medium: '16px', large: '19px' };
    document.documentElement.style.fontSize = fontMap[settings.fontSize] || '16px';
  }, []);

  function afterSplash() {
    const auth = getAuth();
    if (auth.loggedIn) {
      setPhase(auth.role === 'admin' ? 'admin' : 'app');
    } else if (hasSeenOnboarding()) {
      setPhase('login');
    } else {
      setPhase('onboarding');
    }
  }

  function handleLogin(role) {
    setPhase(role === 'admin' ? 'admin' : 'app');
  }

  function handleLogout() {
    logout();
    setPhase('login');
  }

  if (phase === 'splash') return <Splash onDone={afterSplash} />;
  if (phase === 'onboarding') return <Onboarding onDone={() => setPhase('login')} />;
  if (phase === 'login') return <LoginPage onLogin={handleLogin} />;
  if (phase === 'admin') return <AdminPanel onLogout={handleLogout} />;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes onLogout={handleLogout} />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { fontFamily: 'Tiro Telugu, serif', background: 'hsl(0 57% 27%)', color: 'white', border: 'none' },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AppRoutes({ onLogout }) {
  return (
    <Layout onLogout={onLogout}>
      <PageWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/read/:id" element={<Reader />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/panchangam" element={<Panchangam />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </PageWrapper>
    </Layout>
  );
}
