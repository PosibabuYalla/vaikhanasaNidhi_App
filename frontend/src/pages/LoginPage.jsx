import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Eye, EyeOff, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { loginAsUser, loginAsAdmin, signup, continueAsGuest } from '../store/authStore';
import logo from '../assets/images/logo.png';

function PasswordInput({ value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange}
        placeholder={placeholder || '••••••••'}
        required={required}
        className="form-input pr-11"
      />
      <button type="button" onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function SignUpForm({ onDone, onSwitch }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function handle(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) return setError('Username is required.');
    if (pass.length < 4) return setError('Password must be at least 4 characters.');
    if (pass !== confirm) return setError('Passwords do not match.');
    const result = signup(name, username, pass);
    if (result === 'username_taken') return setError('Username already taken. Choose another.');
    onDone('user');
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Full Name (optional)">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="భక్తుడు"
          className="form-input" style={{ fontFamily: 'Tiro Telugu, serif' }} />
      </Field>
      <Field label="Username *">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="your_username" required className="form-input" />
      </Field>
      <Field label="Password *">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 4 characters" required />
      </Field>
      <Field label="Confirm Password *">
        <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
      </Field>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm">
        <UserPlus size={16} /> Create Account
      </button>
      <p className="text-center text-xs text-muted">
        Already have an account?{' '}
        <button type="button" onClick={() => onSwitch('login')} className="font-semibold underline gold-glow">
          Login
        </button>
      </p>
    </form>
  );
}

function UserLoginForm({ onDone, onSwitch }) {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function handle(e) {
    e.preventDefault();
    setError('');
    const result = loginAsUser(username.trim(), pass);
    if (result === 'not_found') return setError('No account found with that username.');
    if (result === 'wrong_password') return setError('Incorrect password. Try again.');
    onDone('user');
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Username">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="your_username" required className="form-input" />
      </Field>
      <Field label="Password">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)} required />
      </Field>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm">
        <LogIn size={16} /> Login
      </button>
      <p className="text-center text-xs text-muted">
        New here?{' '}
        <button type="button" onClick={() => onSwitch('signup')} className="font-semibold underline gold-glow">
          Create an account
        </button>
      </p>
    </form>
  );
}

function AdminLoginForm({ onDone }) {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function handle(e) {
    e.preventDefault();
    setError('');
    if (loginAsAdmin(username.trim(), pass)) onDone('admin');
    else setError('Invalid credentials.');
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <Field label="Admin Username">
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="admin" required className="form-input" />
      </Field>
      <Field label="Password">
        <PasswordInput value={pass} onChange={e => setPass(e.target.value)} required />
      </Field>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 btn-gold text-sm">
        <Shield size={16} /> Login as Admin
      </button>
      <p className="text-center text-xs text-muted">
        Default: <span className="font-mono font-semibold gold-glow">admin</span> / <span className="font-mono font-semibold gold-glow">admin@123</span>
      </p>
    </form>
  );
}

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  function handleLogoTap() {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) { setAdminUnlocked(true); setMode('admin'); setTapCount(0); }
  }

  const tabs = [
    { id: 'signup', label: 'Sign Up', icon: UserPlus },
    { id: 'login',  label: 'Login',   icon: LogIn },
    ...(adminUnlocked ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-bg"
      style={{ backgroundImage: 'var(--hero-glow)' }}>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

        <div className="flex flex-col items-center mb-7 gap-3">
          <button onClick={handleLogoTap}
            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden select-none focus:outline-none active:scale-95 transition-transform corner-card"
            style={{ boxShadow: '0 0 30px rgba(200,143,45,0.3)' }}>
            <img src={logo} alt="logo" className="w-12 h-12 object-contain pointer-events-none" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-3xl gold-glow-strong" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              వైఖానస నిధి
            </h1>
            <p className="text-sm text-muted mt-1">Sacred Library</p>
            {tapCount > 0 && tapCount < 5 && (
              <motion.p key={tapCount} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-1 text-muted">{'● '.repeat(tapCount).trim()}</motion.p>
            )}
            {adminUnlocked && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs mt-1 font-semibold gold-glow">
                Admin access unlocked
              </motion.p>
            )}
          </div>
        </div>

        <div className="corner-card rounded-3xl overflow-hidden bg-card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="flex bg-elevated" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setMode(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all"
                style={{
                  background: mode === id ? 'linear-gradient(135deg, #C88F2D, #E4B24B)' : 'transparent',
                  color: mode === id ? 'var(--bg-page)' : 'var(--text-muted)',
                }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="p-7 bg-card">
            <AnimatePresence mode="wait">
              <motion.div key={mode}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                {mode === 'signup' && <SignUpForm onDone={onLogin} onSwitch={setMode} />}
                {mode === 'login'  && <UserLoginForm onDone={onLogin} onSwitch={setMode} />}
                {mode === 'admin'  && <AdminLoginForm onDone={onLogin} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <button onClick={() => { continueAsGuest(); onLogin('user'); }}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-2xl text-sm font-semibold btn-ghost active:scale-95">
          <ArrowRight size={15} /> Continue without Login
        </button>
      </motion.div>
    </div>
  );
}
