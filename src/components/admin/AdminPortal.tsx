import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { Accommodation, Booking, StaffMember } from '../../types';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Layers,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Car,
  Utensils,
  Plus,
  Edit3,
  Trash2,
  Share2,
  Smartphone,
  Sparkles,
  Search,
  Filter,
  Eye,
  GitBranch,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    accommodations,
    updateAccommodation,
    addAccommodation,
    deleteAccommodation,
    bookings,
    staffList,
    managersList,
    usersList,
    gitCommitRef,
  } = usePoaStay();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'kpi-overview' | 'accommodations' | 'calendar-conflicts' | 'payments-ledger' | 'users-staff'
  >('kpi-overview');

  // New property modal state
  const [newAccModalOpen, setNewAccModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Diani Beach, South Coast');
  const [newCounty, setNewCounty] = useState('Kwale County');
  const [newType, setNewType] = useState<any>('villa');
  const [newPrice, setNewPrice] = useState(25000);
  const [newUnits, setNewUnits] = useState(3);
  const [newImage, setNewImage] = useState(
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
  );
  const [newDesc, setNewDesc] = useState('');

  // Edit property modal state
  const [editingAcc, setEditingAcc] = useState<Accommodation | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editUnits, setEditUnits] = useState(0);
  const [editTitle, setEditTitle] = useState('');
  const [editImg, setEditImg] = useState('');

  // Calculations for KPIs
  const totalCollections = bookings.reduce((sum, b) => sum + b.amountPaid, 0);
  const totalReceivables = bookings.reduce((sum, b) => sum + b.balanceDue, 0);
  const totalUnitsInSystem = accommodations.reduce((sum, a) => sum + a.totalUnits, 0);
  const totalBookedUnits = accommodations.reduce((sum, a) => sum + (a.bookedUnits || 0), 0);
  const totalAvailableStock = Math.max(0, totalUnitsInSystem - totalBookedUnits);

  // All M-Pesa transactions extracted from bookings
  const allTransactions = bookings.flatMap((b) =>
    b.mpesaTransactions.map((tx) => ({
      ...tx,
      bookingRef: b.bookingRef,
      customerName: b.customerName,
    }))
  );

  const handleSaveNewAccommodation = (e: React.FormEvent) => {
    e.preventDefault();
    addAccommodation({
      title: newTitle,
      type: newType,
      location: newLocation,
      county: newCounty,
      pricePerNight: newPrice,
      totalUnits: newUnits,
      bookedUnits: 0,
      images: [newImage],
      description: newDesc,
      hostName: 'Verified PoaStay Kenyan Host',
      hostPhone: '+254 700 000 111',
      amenities: ['High-Speed WiFi', 'Backup Power', 'Free Parking', 'Chef Available'],
      checkInTime: '14:00',
      checkOutTime: '10:30',
      travelEstimate: {
        from: 'Nairobi',
        duration: 'Realistic Kenyan route',
        distance: 'Direct highway or flight access',
        routeHighlights: 'Accessible via tarmac routes or airstrip.',
      },
      nearbyRestaurants: [],
    });

    setNewAccModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleSaveEditProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc) return;

    updateAccommodation({
      ...editingAcc,
      title: editTitle,
      pricePerNight: editPrice,
      totalUnits: editUnits,
      images: [editImg, ...editingAcc.images.slice(1)],
    });

    setEditingAcc(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Master Channel & Travel Agency Admin
            </span>
            <span className="text-stone-400 font-mono text-xs bg-stone-800 px-2 py-0.5 rounded">
              recorded in {gitCommitRef}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            PoaStay Central Control & Audit System
          </h1>
          <p className="text-xs text-stone-300 max-w-xl mt-1 leading-relaxed">
            Full 360-degree governance across Manager, Staff, and User portals. Monitor Daraja M-Pesa automated collections, audit double-booking prevention calendars, and manage property pricing and stock.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-white/10 p-1 rounded-2xl border border-white/10 self-start sm:self-center">
          <button
            onClick={() => setActiveAdminTab('kpi-overview')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'kpi-overview' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            KPIs & Overview
          </button>
          <button
            onClick={() => setActiveAdminTab('accommodations')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'accommodations' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            Inventory & Price ({accommodations.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('calendar-conflicts')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'calendar-conflicts' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            Anti-Double Booking Calendar
          </button>
          <button
            onClick={() => setActiveAdminTab('payments-ledger')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'payments-ledger' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            M-Pesa Ledger ({allTransactions.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('users-staff')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'users-staff' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            Users, Staff & Managers
          </button>
        </div>
      </div>

      {/* TAB 1: KPI OVERVIEW */}
      {activeAdminTab === 'kpi-overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-1 text-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Total M-Pesa Collections
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                KSh {totalCollections.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-300 font-medium">
                Verified via Daraja API (Code 0)
              </p>
            </div>

            <div className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-1 text-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Installments Receivable
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                KSh {totalReceivables.toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-300">Scheduled pre-arrival balances</p>
            </div>

            <div className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-1 text-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Total Channel Units
              </span>
              <div className="text-xl sm:text-2xl font-black text-white">
                {totalUnitsInSystem} <span className="text-xs text-stone-400 font-normal">Units</span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium">
                {totalAvailableStock} Available | {totalBookedUnits} Occupied
              </p>
            </div>

            <div className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-1 text-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Anti-Conflict Health
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>100% Synced</span>
              </div>
              <p className="text-[11px] text-stone-300">0 Overlapping double bookings</p>
            </div>
          </div>

          {/* Quick Monitoring Feed & Operations Summary */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Bookings Feed */}
            <div className="lg:col-span-2 bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-xl space-y-4 text-stone-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white">
                  Recent Channel Bookings & Real-Time Sync
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">Live Status</span>
              </div>

              <div className="divide-y divide-white/10">
                {bookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400 bg-stone-950/70 border border-white/10 px-2 py-0.5 rounded">
                          {b.bookingRef}
                        </span>
                        <strong className="text-white">{b.customerName}</strong>
                      </div>
                      <p className="text-stone-300 truncate max-w-sm">
                        {b.accommodationTitle} ({b.checkInDate} to {b.checkOutDate})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-white font-mono">
                        KSh {b.amountPaid.toLocaleString()}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                          b.paymentStatus === 'fully_paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        }`}
                      >
                        {b.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Git Ledger & Channel Sync Status */}
            <div className="bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-xl space-y-4 text-stone-100">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>kengadara-git Channel Sync</span>
              </h3>

              <div className="p-3.5 bg-stone-950/80 text-stone-200 rounded-2xl font-mono text-xs space-y-2 border border-white/10 shadow-inner">
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Ledger Repository:</span>
                  <span className="text-emerald-400 font-bold">kengadara-git</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Commit Hash:</span>
                  <span className="text-amber-400">rev-2026.09-ke</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Daraja Callback:</span>
                  <span className="text-emerald-400">Active (Webhooks 200)</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Double Booking Engine:</span>
                  <span className="text-white">Strict Lock Enforced</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-xs text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Independent Travel Agency Certified
                </p>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  PoaStay functions as a localized channel manager for Kenyan BnB hosts, safaris, and agencies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOMMODATION LISTINGS & PRICE/STOCK CONTROLS */}
      {activeAdminTab === 'accommodations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 text-stone-100 shadow-xl">
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Accommodation Inventory & Stock Channel Manager
              </h2>
              <p className="text-xs text-stone-300">
                Admin can add new Kenyan BnBs/lodges, edit nightly prices (KSh), upload images, and control available stock units.
              </p>
            </div>
            <button
              onClick={() => setNewAccModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/30 transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Kenyan Property</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {accommodations.map((acc) => {
              const remaining = Math.max(0, acc.totalUnits - (acc.bookedUnits || 0));
              const isOut = remaining <= 0;

              return (
                <div
                  key={acc.id}
                  className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 overflow-hidden shadow-xl space-y-3 p-4 flex flex-col justify-between text-stone-100 hover:border-emerald-400/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="relative h-40 rounded-2xl overflow-hidden">
                      <img
                        src={acc.images?.[0] || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
                        alt={acc.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        {isOut ? (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                            SOLD OUT (0 UNITS)
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                            In Stock: {remaining} remaining
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-stone-950/80 backdrop-blur-xs text-emerald-400 border border-white/10 text-xs font-black px-2.5 py-1 rounded-lg font-mono">
                        KSh {acc.pricePerNight.toLocaleString()}
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-white truncate">{acc.title}</h4>
                    <p className="text-xs text-stone-300">{acc.location} • {acc.county}</p>

                    <div className="p-3 bg-stone-950/60 rounded-xl text-xs space-y-1.5 border border-white/10">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Total Units:</span>
                        <strong className="text-white">{acc.totalUnits}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Occupied Units:</span>
                        <strong className="text-amber-400">{acc.bookedUnits || 0}</strong>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t border-white/10">
                        <span className="text-stone-300">Stock Remaining:</span>
                        <span className={isOut ? 'text-rose-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                          {remaining} {remaining === 1 ? 'unit' : 'units'} left
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingAcc(acc);
                        setEditPrice(acc.pricePerNight);
                        setEditUnits(acc.totalUnits);
                        setEditTitle(acc.title);
                        setEditImg(acc.images?.[0] || '');
                      }}
                      className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Edit Price & Stock</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${acc.title}?`)) {
                          deleteAccommodation(acc.id);
                        }
                      }}
                      className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 rounded-xl transition-colors cursor-pointer"
                      title="Delete property"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ANTI-DOUBLE BOOKING & CALENDAR CONFLICT ANALYZER */}
      {activeAdminTab === 'calendar-conflicts' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-2 text-stone-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold text-white">
                Anti-Double Booking Calendar & Overlap Monitor
              </h2>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              PoaStay's channel manager cross-checks all customer bookings against the exact property calendar. If dates overlap and exceed available unit stock, the booking engine blocks conflicting reservations automatically.
            </p>
          </div>

          <div className="grid gap-4">
            {accommodations.map((acc) => {
              const remaining = Math.max(0, acc.totalUnits - (acc.bookedUnits || 0));
              const activeRanges = acc.bookedDateRanges || [];

              return (
                <div
                  key={acc.id}
                  className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-3 text-stone-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-white">{acc.title}</h3>
                      <p className="text-xs text-stone-300">
                        {acc.location} • Total Units: {acc.totalUnits} | Booked: {acc.bookedUnits || 0} | Remaining: {remaining}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        remaining > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                      }`}
                    >
                      {remaining > 0 ? `${remaining} Units Remaining` : 'Sold Out for Dates'}
                    </span>
                  </div>

                  {/* Booked Date Ranges Visualizer */}
                  <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Locked Calendar Intervals:
                    </p>
                    {activeRanges.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No dates locked. 100% capacity available.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {activeRanges.map((r, idx) => (
                          <div
                            key={idx}
                            className="bg-stone-900 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-stone-200 flex items-center gap-2 shadow-2xs"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-bold text-white">
                              {r.from} to {r.to}
                            </span>
                            <span className="bg-stone-950 text-[10px] font-mono px-1.5 py-0.5 rounded text-emerald-400 border border-white/10">
                              Ref: {r.bookingRef}
                            </span>
                            <span className="text-emerald-300 font-bold text-[11px]">
                              ({r.units} {r.units === 1 ? 'unit' : 'units'} locked)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DARAJA M-PESA FINANCIAL LEDGER */}
      {activeAdminTab === 'payments-ledger' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-100 shadow-xl">
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Safaricom Lipa Na M-Pesa Online Daraja API Ledger
              </h2>
              <p className="text-xs text-stone-300">
                Audit trail of all M-Pesa down deposits and subsequent installment settlements.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 self-start sm:self-auto">
              {allTransactions.length} Verified Transactions
            </span>
          </div>

          <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl text-stone-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-stone-200">
                <thead className="bg-stone-950/60 text-stone-400 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="p-3.5">M-Pesa Receipt No</th>
                    <th className="p-3.5">Booking Ref</th>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">M-Pesa Handset</th>
                    <th className="p-3.5">Amount (KSh)</th>
                    <th className="p-3.5">Payment Type</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {allTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-mono font-black text-emerald-400 text-xs">
                        {tx.receiptNumber}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">{tx.bookingRef}</td>
                      <td className="p-3.5 font-semibold text-white">{tx.customerName}</td>
                      <td className="p-3.5 font-mono text-stone-300">{tx.phoneNumber}</td>
                      <td className="p-3.5 font-black text-white font-mono">
                        KSh {tx.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize bg-stone-950/80 border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-stone-300">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-400 text-[11px] whitespace-nowrap">
                        {tx.timestamp}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USERS, STAFF & MANAGERS DIRECTORY */}
      {activeAdminTab === 'users-staff' && (
        <div className="space-y-6">
          {/* Registered Customers */}
          <div className="bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-xl space-y-4 text-stone-100">
            <h3 className="text-base font-extrabold text-white flex items-center justify-between">
              <span>Registered Customers & Travelers</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                {usersList.filter((u) => u.role === 'customer').length} Users
              </span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {usersList
                .filter((u) => u.role === 'customer')
                .map((user) => (
                  <div
                    key={user.id}
                    className="p-3.5 bg-stone-950/60 rounded-2xl border border-white/10 text-xs space-y-1"
                  >
                    <p className="font-bold text-white text-sm">{user.name}</p>
                    <p className="text-stone-300">{user.email}</p>
                    <p className="font-mono text-emerald-400 font-semibold">{user.phone}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Operations Managers */}
          <div className="bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-xl space-y-4 text-stone-100">
            <h3 className="text-base font-extrabold text-white flex items-center justify-between">
              <span>Operations Managers</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">{managersList.length} Active</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {managersList.map((mgr) => (
                <div
                  key={mgr.id}
                  className="p-4 bg-stone-950/60 rounded-2xl border border-white/10 flex gap-3 items-center text-xs"
                >
                  <img
                    src={mgr.avatar}
                    alt={mgr.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-white/15"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{mgr.name}</h4>
                    <p className="text-emerald-400 font-semibold">{mgr.department}</p>
                    <p className="text-stone-300 mt-0.5">{mgr.email} • {mgr.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff List */}
          <div className="bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-xl space-y-4 text-stone-100">
            <h3 className="text-base font-extrabold text-white flex items-center justify-between">
              <span>Field Staff Coordinators</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">{staffList.length} Personnel</span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {staffList.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-stone-950/60 rounded-2xl border border-white/10 text-xs space-y-1"
                >
                  <p className="font-bold text-white">{s.name}</p>
                  <p className="text-emerald-400 text-[11px] font-medium">{s.roleTitle}</p>
                  <p className="text-stone-300">{s.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEW PROPERTY MODAL */}
      {newAccModalOpen && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 to-stone-900 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-black">Add New Kenyan Accommodation</h3>
                <p className="text-xs text-stone-300">Publish new Airbnb, BnB, or staycation home</p>
              </div>
              <button
                onClick={() => setNewAccModalOpen(false)}
                className="p-1 text-white/70 hover:text-white rounded-full bg-black/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAccommodation} className="p-5 overflow-y-auto space-y-3.5 flex-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Property Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Watamu Marine Breeze Oceanfront Haven"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Diani Beach, South Coast"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">County</label>
                  <input
                    type="text"
                    value={newCounty}
                    onChange={(e) => setNewCounty(e.target.value)}
                    placeholder="e.g. Kwale County"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Stay Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="villa">Villa</option>
                    <option value="safari_camp">Safari Camp</option>
                    <option value="staycation">Staycation</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="bnb">BnB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Rate (KSh)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-2 py-2 text-xs border border-stone-200 rounded-xl font-bold text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Units (Stock)</label>
                  <input
                    type="number"
                    min="1"
                    value={newUnits}
                    onChange={(e) => setNewUnits(Number(e.target.value))}
                    className="w-full px-2 py-2 text-xs border border-stone-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the property ambience, views, and unique Kenyan experience..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Publish Accommodation to Channel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROPERTY MODAL */}
      {editingAcc && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-stone-900">Edit Price & Stock</h3>
              <button
                onClick={() => setEditingAcc(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditProperty} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Price Per Night (KSh)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bold text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Units (Stock Capacity)</label>
                  <input
                    type="number"
                    min="1"
                    value={editUnits}
                    onChange={(e) => setEditUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Main Image URL</label>
                <input
                  type="url"
                  value={editImg}
                  onChange={(e) => setEditImg(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-mono text-[11px]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save & Synchronize All Portals
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
