import React, { useState, useEffect } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { X, Lock, Mail, User, Phone, Shield, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { DEMO_USERS } from '../../data/mockData';
import { SLIDESHOW_IMAGES } from '../../config/slideshowConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, registerCustomer, setCurrentUser } = usePoaStay();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+254 7');
  const [error, setError] = useState('');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Sync with background slideshow
  useEffect(() => {
    const handleSlideChange = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === 'number') {
        setActiveSlideIndex(customEvent.detail);
      }
    };
    window.addEventListener('poastay-slide-changed', handleSlideChange);
    return () => window.removeEventListener('poastay-slide-changed', handleSlideChange);
  }, []);

  const handleSelectSlide = (idx: number) => {
    setActiveSlideIndex(idx);
    window.dispatchEvent(new CustomEvent('poastay-set-slide', { detail: idx }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (isRegister) {
      if (!name || !phone) {
        setError('Please enter your full name and M-Pesa phone number.');
        return;
      }
      const ok = registerCustomer(name, email, phone, password);
      if (ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('Registration failed. Please try again.');
      }
    } else {
      const ok = login(email, password);
      if (ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('Invalid credentials. Check email or select a 1-click demo user below.');
      }
    }
  };

  const handleQuickDemoUser = (user: (typeof DEMO_USERS)[0]) => {
    setCurrentUser(user);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Semi-transparent Glassmorphic Login/Welcome Card */}
      <div className="relative w-full max-w-lg bg-stone-900/85 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden text-white my-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 text-stone-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with System Logo & Branding */}
        <div className="p-7 sm:p-8 pb-4 text-center relative z-10 border-b border-white/10">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-amber-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-950/60 border border-white/30 mb-3">
            P
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-2xl font-black tracking-tight text-white">
              Poa<span className="text-emerald-400">Stay</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
              KENYA
            </span>
          </div>

          <h3 className="text-lg font-bold text-stone-200">
            {isRegister ? 'Create Your Guest Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto mt-1">
            {isRegister
              ? 'Register with your email and Safaricom M-Pesa phone to unlock checkout'
              : 'Sign in to access your itinerary, M-Pesa installments, and group trips'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-7 sm:p-8 pt-6 relative z-10 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-xs text-rose-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Wangari Maathai Kimani"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-2xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-stone-900/90 transition-all"
                      required={isRegister}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Safaricom M-Pesa Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-2xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-stone-900/90 transition-all"
                      required={isRegister}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Used for Daraja STK Push prompt & automated WhatsApp trip passes
                  </span>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@poastay.co.ke"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-2xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-stone-900/90 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-2xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-stone-900/90 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-950/60 border border-emerald-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isRegister ? 'Complete Registration & Proceed' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch login / register */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-stone-300 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
            >
              {isRegister
                ? 'Already have an account? Sign in here'
                : "Don't have an account yet? Register with email"}
            </button>
          </div>

          {/* Quick Demo Pre-fill Accounts */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Quick 1-Click Role Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoUser(u)}
                  className="text-left p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-400/40 transition-all text-xs group cursor-pointer"
                >
                  <p className="font-bold text-stone-200 group-hover:text-emerald-300 truncate">
                    {u.name}
                  </p>
                  <p className="text-[10px] text-stone-400 capitalize">{u.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Slideshow Dot Indicators Inside Card as requested */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-[10px] text-stone-400 font-medium mr-1">Scene:</span>
            {SLIDESHOW_IMAGES.map((img, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => handleSelectSlide(dotIdx)}
                className={`transition-all rounded-full cursor-pointer ${
                  dotIdx === activeSlideIndex
                    ? 'w-4 h-2 bg-amber-400 shadow-sm shadow-amber-400/50'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Switch background to ${img.title}`}
                aria-label={`Switch background scene ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
