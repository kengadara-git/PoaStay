import React, { useState } from 'react';
import { usePoaStay } from './context/PoaStayContext';
import { Header } from './components/common/Header';
import { FullscreenBackgroundSlideshow } from './components/common/FullscreenBackgroundSlideshow';
import { AuthModal } from './components/common/AuthModal';
import { NotificationsModal } from './components/common/NotificationsModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { StaffPortal } from './components/staff/StaffPortal';
import { ManagerPortal } from './components/manager/ManagerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import {
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Sparkles,
  MapPin,
  Phone,
  Heart,
  Calendar,
  Layers,
  Compass,
} from 'lucide-react';

export const App: React.FC = () => {
  const { currentRole, currentUser, cart } = usePoaStay();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [customerActiveTab, setCustomerActiveTab] = useState<'explore' | 'my-bookings' | 'group-trips'>('explore');

  return (
    <div className="min-h-screen text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* 1. Full-Screen Visual Background Slideshow (Width: 100%, Min-Height: 100vh, Cover, Center) */}
      <FullscreenBackgroundSlideshow />

      {/* Universal Top Navigation Header (Modern Glassmorphic Header) */}
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        activeCustomerTab={customerActiveTab}
        setActiveCustomerTab={setCustomerActiveTab}
      />

      {/* Customer Subtab Navigation (Only visible when customer role is active) */}
      {currentRole === 'customer' && (
        <div className="bg-stone-950/70 backdrop-blur-xl border-b border-white/10 sticky top-16 z-30 shadow-lg transition-all">
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setCustomerActiveTab('explore')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    customerActiveTab === 'explore'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30'
                      : 'text-stone-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore Stays & Safaris</span>
                </button>
                <button
                  onClick={() => setCustomerActiveTab('my-bookings')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    customerActiveTab === 'my-bookings'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30'
                      : 'text-stone-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>My Bookings & Passes</span>
                </button>
                <button
                  onClick={() => setCustomerActiveTab('group-trips')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    customerActiveTab === 'group-trips'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30'
                      : 'text-stone-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Group Trip & Chama Split</span>
                </button>
              </div>

              {/* Quick M-Pesa badge & Cart Quick Action */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-400/30">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Daraja M-Pesa 30% Down Active</span>
                </div>

                <button
                  onClick={() => setCartDrawerOpen(true)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Trip Cart</span>
                  {cart.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area (Fluid Edge-to-Edge Responsive Container) */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-12">
        {currentRole === 'customer' && (
          <CustomerPortal
            activeTab={customerActiveTab}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenCart={() => setCartDrawerOpen(true)}
          />
        )}

        {currentRole === 'staff' && <StaffPortal />}

        {currentRole === 'manager' && <ManagerPortal />}

        {currentRole === 'admin' && <AdminPortal />}
      </main>

      {/* Universal Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
      />
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onBookingSuccess={() => {
          if (currentRole === 'customer') {
            setCustomerActiveTab('my-bookings');
          }
        }}
      />

      {/* Clean, Commercial Kenyan Footer (Modern Glassmorphic) */}
      <footer className="bg-stone-950/85 backdrop-blur-2xl border-t border-white/10 mt-16 text-stone-300">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-stone-400">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center text-white font-black text-base shadow-md border border-white/20">
                  P
                </div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  PoaStay Kenya
                </span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                Smart Kenyan accommodation, BnB channel manager, safari transport & group trip coordination system.
              </p>
              <div className="flex items-center gap-1.5 text-stone-400 text-[11px] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Kenyan Hospitality Platform</span>
              </div>
            </div>

            {/* Kenyan Circuits */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3">
                Popular Circuits
              </h4>
              <ul className="space-y-2 text-stone-300">
                <li>Diani Beach & South Coast (SGR & Air)</li>
                <li>Maasai Mara Savanna (4x4 Cruisers & Flights)</li>
                <li>Lake Naivasha & Rift Valley (Highway & Self-Drive)</li>
                <li>Watamu Marine Reserve & Malindi</li>
                <li>Nanyuki & Mount Kenya Foothills</li>
                <li>Lamu Island Archipelago</li>
              </ul>
            </div>

            {/* Travel Coordination */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3">
                Coordination Features
              </h4>
              <ul className="space-y-2 text-stone-300">
                <li>Daraja M-Pesa STK Push Integration</li>
                <li>Installment Payments (30% Down Deposit)</li>
                <li>Strict Anti-Double-Booking Protection</li>
                <li>Private Chef & Swahili Dining Coordination</li>
                <li>Automated WhatsApp Check-in Alerts</li>
                <li>Group Chama Split & Trip Codes</li>
              </ul>
            </div>

            {/* Emergency & Support */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3">
                Operations & Support
              </h4>
              <div className="space-y-2.5 text-stone-300">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Westlands Hub, Nairobi, Kenya</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+254 712 345 601 (24/7 Operations)</span>
                </p>
                <a
                  href="https://wa.me/254712345601?text=Habari!%20I%20am%20inquiring%20about%20PoaStay%20Kenya%20services."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer mt-1 shadow-lg shadow-emerald-950/40 border border-emerald-400/30"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Direct WhatsApp Channel</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
            <p>© {new Date().getFullYear()} PoaStay Kenya. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Crafted for authentic Kenyan hospitality & travel coordination.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
