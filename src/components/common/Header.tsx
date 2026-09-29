import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { PortalRole } from '../../types';
import {
  Compass,
  Briefcase,
  ClipboardList,
  ShieldCheck,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  LogIn,
  CheckCircle2,
  Menu,
  X,
  Phone,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  activeCustomerTab?: 'explore' | 'my-bookings' | 'group-trips';
  setActiveCustomerTab?: (tab: 'explore' | 'my-bookings' | 'group-trips') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenCart,
  onOpenNotifications,
  activeCustomerTab,
  setActiveCustomerTab,
}) => {
  const { currentRole, setCurrentRole, currentUser, logout, cart, notifications } = usePoaStay();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles: { key: PortalRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'customer',
      label: 'Guest / Traveler',
      icon: <Compass className="w-4 h-4" />,
      desc: 'Search, Book, M-Pesa & Trips',
    },
    {
      key: 'staff',
      label: 'Staff Portal',
      icon: <Briefcase className="w-4 h-4" />,
      desc: 'Rooms, Transport & Meals',
    },
    {
      key: 'manager',
      label: 'Manager Portal',
      icon: <ClipboardList className="w-4 h-4" />,
      desc: 'Staff, Duties & Ops',
    },
    {
      key: 'admin',
      label: 'Admin Portal',
      icon: <ShieldCheck className="w-4 h-4" />,
      desc: '360° Channel Manager',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-2xl border-b border-white/10 shadow-2xl text-white transition-all">
      {/* Top Kenyan Utility / Git Sync bar */}
      <div className="bg-black/50 text-stone-300 text-xs px-4 sm:px-8 py-1.5 hidden md:flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Safaricom Daraja M-Pesa Live STK Push Active · Lipa Na M-Pesa Paybill 882100
          </span>
        </div>
        <div className="flex items-center space-x-4 text-stone-400">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" />
            24/7 Concierge & Ops: +254 700 000 111
          </span>
        </div>
      </div>

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentRole('customer');
                if (setActiveCustomerTab) setActiveCustomerTab('explore');
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/30 transition-transform group-hover:scale-105 border border-white/20">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-white">
                    Poa<span className="text-emerald-400">Stay</span>
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                    KENYA
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                  Smart Accommodation & Travel Coordinator
                </p>
              </div>
            </button>
          </div>

          {/* Role Portal Switcher (Modern Glass Segmented Control) */}
          <div className="hidden lg:flex items-center bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 gap-0.5">
            {roles.map((r) => {
              const isActive = currentRole === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setCurrentRole(r.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/30 font-bold'
                      : 'text-stone-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={r.desc}
                >
                  <span className={isActive ? 'text-emerald-300' : 'text-stone-400'}>{r.icon}</span>
                  <span>{r.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Customer Sub-tabs when on customer portal */}
          {currentRole === 'customer' && setActiveCustomerTab && (
            <div className="hidden md:flex items-center space-x-1 bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveCustomerTab('explore')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeCustomerTab === 'explore'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Browse Stays
              </button>
              <button
                onClick={() => setActiveCustomerTab('my-bookings')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeCustomerTab === 'my-bookings'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveCustomerTab('group-trips')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeCustomerTab === 'group-trips'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Group Trips & Split
              </button>
            </div>
          )}

          {/* Right Action Icons: Cart, WhatsApp/SMS alerts, User account */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-stone-200 hover:text-white transition-colors cursor-pointer shadow-sm"
              title="View Cart & Checkout"
            >
              <ShoppingCart className="w-5 h-5 text-stone-200" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Notifications (WhatsApp / SMS alerts) */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-stone-200 hover:text-white transition-colors cursor-pointer shadow-sm"
              title="WhatsApp & SMS Notifications"
            >
              <Bell className="w-5 h-5 text-emerald-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-stone-900 animate-pulse"></span>
              )}
            </button>

            {/* User Profile / Auth Gate */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md pl-2.5 pr-1 py-1 rounded-2xl border border-white/10 text-white">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-emerald-300 font-semibold capitalize">
                    {currentUser.role}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-xl overflow-hidden bg-stone-700 flex items-center justify-center text-xs font-bold text-white border border-white/20">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-stone-300" />
                  )}
                </div>
                <button
                  onClick={logout}
                  className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-lg shadow-emerald-900/40 border border-emerald-400/30 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-stone-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-5 space-y-3 text-white">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Select Portal</p>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => {
                  setCurrentRole(r.key);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  currentRole === r.key
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {currentRole === 'customer' && setActiveCustomerTab && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Customer Menu</p>
              <button
                onClick={() => {
                  setActiveCustomerTab('explore');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  activeCustomerTab === 'explore' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-stone-300 hover:text-white'
                }`}
              >
                Browse Stays & Packages
              </button>
              <button
                onClick={() => {
                  setActiveCustomerTab('my-bookings');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  activeCustomerTab === 'my-bookings' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-stone-300 hover:text-white'
                }`}
              >
                My Bookings & Installments
              </button>
              <button
                onClick={() => {
                  setActiveCustomerTab('group-trips');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  activeCustomerTab === 'group-trips' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-stone-300 hover:text-white'
                }`}
              >
                Group Trip Coordinator
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 text-xs text-stone-400 flex items-center justify-between">
            <span>PoaStay Kenya Concierge</span>
            <span className="text-emerald-400 font-semibold">Daraja API Ready</span>
          </div>
        </div>
      )}
    </header>
  );
};
