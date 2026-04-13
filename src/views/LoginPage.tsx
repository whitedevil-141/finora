// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoImage from '../assets/logo.png';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage({ isDark, toggleTheme }: { isDark: boolean, toggleTheme: (e: any) => void }) {
  const { login, loginWithGoogle, signup, isLoading, authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      if (mode === 'signup') {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleGoogleLogin = async () => {
    clearAuthError();
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  const switchMode = () => {
    clearAuthError();
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError('');
    setPassword('');
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <style>{`
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(24px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
        }
        .login-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .login-fade-in { animation: fadeIn 1s ease forwards; opacity: 0; }
        .glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .orbit-1 { animation: orbit 20s linear infinite; }
        .orbit-2 { animation: orbit 28s linear infinite reverse; }
        .orbit-3 { animation: orbit 35s linear infinite; }
        .input-glow:focus-within {
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15), 0 0 20px rgba(124, 58, 237, 0.08);
        }
      `}</style>

      <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#09090B] text-zinc-900 dark:text-white font-sans flex relative overflow-hidden transition-colors duration-500">
        
        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-zinc-200/50 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all active:scale-95 border border-zinc-300/50 dark:border-white/5 backdrop-blur-md">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {/* Ambient Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/6 rounded-full blur-[100px] glow-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px]" />
        </div>

        {/* Left: Branding Panel (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-12">
          <div className="relative z-10 max-w-md">
            {/* Orbiting dots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="orbit-1 absolute w-2 h-2 rounded-full bg-violet-400/60" />
                <div className="orbit-2 absolute w-1.5 h-1.5 rounded-full bg-fuchsia-400/40" />
                <div className="orbit-3 absolute w-1 h-1 rounded-full bg-indigo-400/50" />
              </div>
            </div>

            {/* Logo */}
            <div className="mb-12">
              <div className="relative inline-flex flex-col items-start">
                <div className="relative">
                  <div
                    className="absolute left-1/2 -bottom-5 h-7 w-[160px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/40 via-fuchsia-400/30 to-indigo-400/40 blur-3xl"
                    aria-hidden="true"
                  />
                  <img
                    src={LogoImage}
                    alt="Finora Logo"
                    className="relative h-[158px] object-contain drop-shadow-2xl brightness-110"
                    style={{ filter: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.4))' }}
                  />
                </div>
                <span className="mt-4 text-4xl font-black tracking-tight text-zinc-900 dark:text-white">Finora</span>
              </div>
            </div>

            <div className="login-fade-up" style={{ animationDelay: '200ms' }}>
              <h1 className="text-5xl font-black tracking-tighter mb-4 leading-[1.1]">
                Your finances,
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">beautifully simple.</span>
              </h1>
            </div>

            <div className="login-fade-up" style={{ animationDelay: '350ms' }}>
              <p className="text-zinc-500 text-base leading-relaxed max-w-sm">
                Track expenses, manage accounts, and gain insights into your spending — all in one premium experience.
              </p>
            </div>

            {/* Stats row */}
            <div className="login-fade-up mt-12 flex gap-8" style={{ animationDelay: '500ms' }}>
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '4.9', label: 'App Rating' },
                { value: '256-bit', label: 'Encryption' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-black text-zinc-900 dark:text-white">{stat.value}</div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="flex-1 flex items-center justify-center p-5 sm:p-8 relative z-10">
          <div className="w-full max-w-[420px]">
            {/* Mobile Logo */}
            <div className="lg:hidden login-fade-up flex items-center gap-3 mb-10" style={{ animationDelay: '0ms' }}>
              <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-[1rem] flex items-center justify-center shadow-lg shadow-violet-500/10 p-1.5">
                <img src={LogoImage} alt="Finora Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className="text-2xl font-extrabold tracking-tighter">Finora</span>
            </div>

            {/* Header */}
            <div className="login-fade-up mb-8" style={{ animationDelay: '100ms' }}>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-sm text-zinc-500">
                {mode === 'login'
                  ? 'Sign in to access your financial dashboard'
                  : 'Start tracking your finances in seconds'}
              </p>
            </div>

            {/* Google Button */}
            <div className="login-fade-up mb-6" style={{ animationDelay: '200ms' }}>
              <button
                id="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-zinc-900/[0.03] dark:bg-white/[0.03] border border-zinc-900/[0.06] dark:border-white/[0.06] hover:bg-zinc-900/[0.06] dark:hover:bg-white/[0.06] hover:border-zinc-900/[0.12] dark:hover:border-white/[0.12] transition-all duration-300 active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-zinc-400 dark:border-zinc-500 border-t-zinc-700 dark:border-t-zinc-300 rounded-full animate-spin" />
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Signing in...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                      Continue with Google
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="login-fade-up flex items-center gap-4 mb-6" style={{ animationDelay: '250ms' }}>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">or continue with email</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (signup only) */}
              {mode === 'signup' && (
                <div className="login-fade-up" style={{ animationDelay: '280ms' }}>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <div className={`relative rounded-2xl transition-all duration-300 input-glow ${focusedField === 'name' ? 'bg-zinc-900/[0.04] dark:bg-white/[0.04]' : 'bg-transparent dark:bg-white/[0.02]'}`}>
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'name' ? 'text-violet-500 dark:text-violet-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                      <User size={18} />
                    </div>
                    <input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-5 py-4 bg-transparent border border-zinc-200 dark:border-white/[0.06] rounded-2xl text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="login-fade-up" style={{ animationDelay: mode === 'signup' ? '320ms' : '300ms' }}>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className={`relative rounded-2xl transition-all duration-300 input-glow ${focusedField === 'email' ? 'bg-zinc-900/[0.04] dark:bg-white/[0.04]' : 'bg-transparent dark:bg-white/[0.02]'}`}>
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-violet-500 dark:text-violet-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                    <Mail size={18} />
                  </div>
                  <input
                    id="login-email"
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-5 py-4 bg-transparent border border-zinc-200 dark:border-white/[0.06] rounded-2xl text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-fade-up" style={{ animationDelay: mode === 'signup' ? '360ms' : '350ms' }}>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className={`relative rounded-2xl transition-all duration-300 input-glow ${focusedField === 'password' ? 'bg-zinc-900/[0.04] dark:bg-white/[0.04]' : 'bg-transparent dark:bg-white/[0.02]'}`}>
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-violet-500 dark:text-violet-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                    <Lock size={18} />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-12 pr-14 py-4 bg-transparent border border-zinc-200 dark:border-white/[0.06] rounded-2xl text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span className="text-xs font-bold text-rose-400">{error}</span>
                </div>
              )}

              {/* Forgot password (login only) */}
              {mode === 'login' && (
                <div className="login-fade-up flex justify-end" style={{ animationDelay: '380ms' }}>
                  <button type="button" className="text-xs font-bold text-violet-400/80 hover:text-violet-400 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <div className="login-fade-up pt-2" style={{ animationDelay: mode === 'signup' ? '400ms' : '420ms' }}>
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 text-white font-bold text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 hover:brightness-110 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 relative overflow-hidden group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Switch mode */}
            <div className="login-fade-up mt-8 text-center" style={{ animationDelay: '500ms' }}>
              <p className="text-sm text-zinc-600">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  id="auth-switch-btn"
                  onClick={switchMode}
                  className="font-bold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Footer */}
            <div className="login-fade-in mt-12 text-center" style={{ animationDelay: '700ms' }}>
              <p className="text-[10px] text-zinc-700 font-medium">
                By continuing, you agree to FinSpace's{' '}
                <a href="#" className="text-zinc-500 hover:text-zinc-400 underline underline-offset-2">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-zinc-500 hover:text-zinc-400 underline underline-offset-2">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
