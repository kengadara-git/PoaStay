import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { Accommodation, Booking } from '../../types';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Phone,
  Plane,
  Train,
  Car,
  Utensils,
  Share2,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { AccommodationDetailModal } from './AccommodationDetailModal';
import { BookingProgress } from './BookingProgress';
import { LeaveReviewModal } from './LeaveReviewModal';
import confetti from 'canvas-confetti';

interface CustomerPortalProps {
  activeTab: 'explore' | 'my-bookings' | 'group-trips';
  onOpenAuth: () => void;
  onOpenCart: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  activeTab,
  onOpenAuth,
  onOpenCart,
}) => {
  const {
    accommodations,
    bookings,
    currentUser,
    addToCart,
    payInstallment,
    sendNotification,
    reviews,
  } = usePoaStay();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(50000);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');

  // Modal State
  const [selectedAccForDetail, setSelectedAccForDetail] = useState<Accommodation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Leave Review Modal State
  const [leaveReviewModalOpen, setLeaveReviewModalOpen] = useState(false);
  const [reviewTargetAcc, setReviewTargetAcc] = useState<Accommodation | null>(null);
  const [reviewTargetBooking, setReviewTargetBooking] = useState<Booking | null>(null);

  const handleOpenReviewModal = (acc?: Accommodation, booking?: Booking) => {
    setReviewTargetAcc(acc || null);
    setReviewTargetBooking(booking || null);
    setLeaveReviewModalOpen(true);
  };

  // Installment payment modal state
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [installmentAmount, setInstallmentAmount] = useState<number>(10000);
  const [installmentPhone, setInstallmentPhone] = useState<string>('+254 7');
  const [isProcessingInstallment, setIsProcessingInstallment] = useState(false);
  const [installmentReceipt, setInstallmentReceipt] = useState<string | null>(null);
  const [installmentStep, setInstallmentStep] = useState<'form' | 'processing' | 'done'>('form');

  // Filter accommodations
  const filteredAccommodations = accommodations.filter((acc) => {
    // Search match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      acc.title.toLowerCase().includes(q) ||
      acc.location.toLowerCase().includes(q) ||
      acc.county.toLowerCase().includes(q);

    // Destination match
    const matchesDestination =
      selectedDestination === 'all' ||
      acc.location.toLowerCase().includes(selectedDestination.toLowerCase()) ||
      acc.county.toLowerCase().includes(selectedDestination.toLowerCase());

    // Type match
    const matchesType = selectedType === 'all' || acc.type === selectedType;

    // Budget match
    const matchesBudget = acc.pricePerNight <= maxBudget;

    // Amenity match
    const matchesAmenity =
      selectedAmenity === 'all' ||
      acc.amenities.some((a) => a.toLowerCase().includes(selectedAmenity.toLowerCase()));

    return matchesSearch && matchesDestination && matchesType && matchesBudget && matchesAmenity;
  });

  // Filter customer's own bookings
  const myBookings = bookings.filter((b) => {
    if (!currentUser) return true; // show all for demo if not logged in
    if (currentUser.role === 'customer') {
      return (
        b.customerId === currentUser.id ||
        b.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      );
    }
    return true;
  });

  const handleOpenDetail = (acc: Accommodation) => {
    setSelectedAccForDetail(acc);
    setDetailModalOpen(true);
  };

  const handlePayInstallmentModal = (b: Booking) => {
    setPayingBooking(b);
    setInstallmentAmount(Math.min(b.balanceDue, Math.round(b.balanceDue * 0.5) || b.balanceDue));
    setInstallmentPhone(b.customerPhone || '+254 7');
    setInstallmentStep('form');
    setInstallmentReceipt(null);
  };

  const handleExecuteInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBooking) return;

    setIsProcessingInstallment(true);
    setInstallmentStep('processing');

    setTimeout(async () => {
      const res = await payInstallment(payingBooking.id, installmentAmount, installmentPhone);
      setIsProcessingInstallment(false);
      if (res.success && res.transaction) {
        setInstallmentReceipt(res.transaction.receiptNumber);
        setInstallmentStep('done');

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#059669', '#10b981', '#f59e0b'],
          });
        } catch (e) {}
      } else {
        setInstallmentStep('form');
      }
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Tab 1: EXPLORE / BROWSE STAYS */}
      {activeTab === 'explore' && (
        <>
          {/* Kenyan Hero Showcase Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-stone-700">
            <div className="absolute inset-0 opacity-25 mix-blend-overlay">
              <img
                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80"
                alt="Kenyan Savanna"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Kenyan Staycations & Local Channel Manager
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                    Lipa Na M-Pesa Installments
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenReviewModal()}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                  <span>Rate a Visited Stay</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Authentic Kenyan Airbnbs, Beachfront Villas & Safari Camps.
              </h1>

              <p className="text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed">
                Seamlessly coordinate verified staycations from Diani Beach to the Maasai Mara. Select destination-tailored transport (SGR Train, Air Safaris, 4x4 Cruisers) and complete payments in installments directly via M-Pesa.
              </p>

              {/* Quick Destination Tags */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="text-stone-300 text-xs self-center">Popular:</span>
                {[
                  { label: 'Diani Beach', dest: 'Diani' },
                  { label: 'Maasai Mara', dest: 'Mara' },
                  { label: 'Lake Naivasha', dest: 'Naivasha' },
                  { label: 'Watamu', dest: 'Watamu' },
                  { label: 'Nanyuki / Mt Kenya', dest: 'Nanyuki' },
                  { label: 'Lamu Island', dest: 'Lamu' },
                ].map((item) => (
                  <button
                    key={item.dest}
                    onClick={() => setSelectedDestination(item.dest)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer border border-white/10"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search & Filter Matrix */}
          <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/15 shadow-2xl space-y-4 text-stone-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Text Search */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Search Property or Area
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Diani Villa, Mara, Naivasha..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-white/15 rounded-xl bg-stone-950/60 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Destination Filter */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Destination Circuit
                </label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl bg-stone-950/80 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">All Kenya Destinations</option>
                  <option value="Diani">Diani Beach (South Coast)</option>
                  <option value="Mara">Maasai Mara Savanna</option>
                  <option value="Naivasha">Lake Naivasha / Great Rift</option>
                  <option value="Watamu">Watamu Marine Reserve</option>
                  <option value="Nanyuki">Nanyuki & Mount Kenya</option>
                  <option value="Lamu">Lamu Archipelago</option>
                  <option value="Nairobi">Nairobi (Karen & Westlands)</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Staycation Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl bg-stone-950/80 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">All Staycation Types</option>
                  <option value="villa">Luxury Beachfront Villa</option>
                  <option value="safari_camp">Bush Safari Camp</option>
                  <option value="staycation">Cottage / Country Retreat</option>
                  <option value="airbnb">Modern Executive Airbnb</option>
                  <option value="bnb">Lakeside BnB</option>
                </select>
              </div>

              {/* Budget Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Max Rate / Night
                  </label>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    KSh {maxBudget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="2500"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Amenity Filters */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-stone-300 font-semibold">Quick Filters:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'all', label: 'All Amenities' },
                  { key: 'Pool', label: '🏊 Swimming Pool' },
                  { key: 'Chef', label: '👨‍🍳 Private Chef' },
                  { key: 'Beach', label: '🏖️ Beach Access' },
                  { key: 'WiFi', label: '⚡ Starlink WiFi' },
                  { key: 'Solar', label: '☀️ Solar Backup' },
                  { key: 'Game Drive', label: '🦁 Safari Drives' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedAmenity(item.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      selectedAmenity === item.key
                        ? 'bg-emerald-600 text-white font-bold border-emerald-400/40 shadow-sm'
                        : 'bg-white/10 text-stone-300 hover:bg-white/20 border-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-stone-300 font-medium">
                Found <strong className="text-emerald-400">{filteredAccommodations.length}</strong> available stays
              </span>
            </div>
          </div>

          {/* Accommodations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccommodations.map((acc) => {
              const stockRemaining = Math.max(0, acc.totalUnits - (acc.bookedUnits || 0));
              const isOutOfStock = stockRemaining <= 0;

              return (
                <div
                  key={acc.id}
                  className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 overflow-hidden shadow-xl hover:shadow-2xl hover:border-emerald-400/40 hover:-translate-y-1 transition-all flex flex-col justify-between group text-stone-100"
                >
                  {/* Image Card Container */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={acc.images?.[0] || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
                      alt={acc.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3">
                      {isOutOfStock ? (
                        <span className="bg-red-600/90 backdrop-blur-xs text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 border border-red-500/40">
                          <AlertCircle className="w-3.5 h-3.5" />
                          SOLD OUT
                        </span>
                      ) : (
                        <span className="bg-stone-950/80 backdrop-blur-md text-emerald-300 text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md border border-emerald-400/30 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          In Stock: {stockRemaining} {stockRemaining === 1 ? 'unit' : 'units'} left
                        </span>
                      )}
                    </div>

                    {/* Property Type Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-stone-950/80 backdrop-blur-md text-amber-300 border border-white/10 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {acc.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Price Pill */}
                    <div className="absolute bottom-3 right-3 bg-stone-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-md border border-white/10">
                      <span className="text-xs text-stone-300 font-normal">from </span>
                      <span className="text-sm font-black text-amber-400 font-mono">
                        KSh {acc.pricePerNight.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-stone-300"> / night</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 font-semibold text-emerald-400">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {acc.location}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(acc);
                          }}
                          className="flex items-center gap-1 font-extrabold text-amber-300 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/15 transition-colors cursor-pointer"
                          title="Click to view verified guest reviews & ratings"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{acc.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-stone-400 font-semibold">({acc.reviewsCount})</span>
                        </button>
                      </div>

                      <h3 className="text-base font-extrabold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                        {acc.title}
                      </h3>

                      <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                        {acc.description}
                      </p>
                    </div>

                    {/* Guest Review Preview Snippet */}
                    {(() => {
                      const propReviews = reviews.filter((r) => r.accommodationId === acc.id);
                      const latest = propReviews[0];
                      if (!latest) return null;
                      return (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs flex items-start gap-1.5 text-stone-300">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-stone-200 line-clamp-1 italic">
                              "{latest.title || latest.reviewText}"
                            </p>
                            <p className="text-[10px] text-stone-400 font-semibold">
                              — {latest.customerName ? latest.customerName.split(' ')[0] : 'Guest'} ({latest.visitedDate || 'Verified Stay'})
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Highlights: Travel Duration & Top Amenities */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="text-[11px] text-stone-300 flex items-center gap-1 bg-white/5 p-2 rounded-xl border border-white/5">
                        <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">
                          <strong className="text-white">Travel time:</strong> {acc.travelEstimate?.duration || 'Accessible'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(acc.amenities || []).slice(0, 3).map((am, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white/10 text-stone-300 px-2 py-0.5 rounded-md font-medium border border-white/5"
                          >
                            {am}
                          </span>
                        ))}
                      </div>

                      {/* Nearby Dining preview */}
                      {acc.nearbyRestaurants && acc.nearbyRestaurants.length > 0 && acc.nearbyRestaurants[0] && (
                        <div className="text-[11px] text-stone-300 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-stone-300 font-medium">
                            <Utensils className="w-3 h-3 text-amber-400" />
                            Nearby: {acc.nearbyRestaurants[0]?.name || 'Local Bistro'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {acc.nearbyRestaurants[0]?.distance || 'Nearby'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(acc)}
                        className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs rounded-xl border border-white/10 transition-colors text-center cursor-pointer"
                      >
                        View Details & Dining
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReviewModal(acc);
                        }}
                        className="px-2.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        title="Leave a star rating & review for this property"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="hidden sm:inline">Review</span>
                      </button>

                      <button
                        onClick={() => handleOpenDetail(acc)}
                        disabled={isOutOfStock}
                        className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                          isOutOfStock
                            ? 'bg-stone-800 text-stone-500 border border-white/5 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30'
                        }`}
                      >
                        <span>Book</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tab 2: MY BOOKINGS & INSTALLMENTS */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-2xl text-white">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                My PoaStay Bookings & M-Pesa Installments
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Track room allocations, driver schedules, meal vouchers, and complete pending installment balances.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleOpenReviewModal()}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                <span>Rate a Visited Stay</span>
              </button>
              {!currentUser && (
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-md border border-emerald-400/30"
                >
                  Sign In to View Private Passes
                </button>
              )}
            </div>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-stone-900/80 backdrop-blur-xl p-12 text-center rounded-3xl border border-white/15 text-stone-300 shadow-xl">
              <Calendar className="w-12 h-12 text-stone-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No active bookings found</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Once you select an accommodation and make an M-Pesa deposit, your booking confirmation and travel schedule will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((b) => {
                const percentPaid = Math.min(100, Math.round((b.amountPaid / b.totalAmount) * 100));
                const isFullyPaid = b.balanceDue <= 0;

                return (
                  <div
                    key={b.id}
                    className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 shadow-xl overflow-hidden transition-all hover:border-emerald-400/40 text-stone-100"
                  >
                    {/* Top Status Header */}
                    <div className="p-4 bg-stone-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                          Ref: {b.bookingRef}
                        </span>
                        {b.groupTripCode && (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            Group: {b.groupTripCode}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : b.bookingStatus === 'allocated'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-white/10 text-stone-300'
                          }`}
                        >
                          Status: {b.bookingStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            isFullyPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isFullyPaid ? 'Fully Paid' : 'Deposit Paid (Installment Active)'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Progress Tracker */}
                    <div className="px-4 sm:px-5 pt-4">
                      <BookingProgress booking={b} />
                    </div>

                    {/* Main Booking Details */}
                    <div className="p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img
                          src={b.accommodationImage}
                          alt={b.accommodationTitle}
                          className="w-full sm:w-44 h-32 rounded-2xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="text-base font-extrabold text-white">
                              {b.accommodationTitle}
                            </h3>
                            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              {b.accommodationLocation}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-300 bg-stone-950/60 border border-white/10 p-2.5 rounded-2xl">
                            <div>
                              <span className="text-[10px] text-stone-400 block">Check-in</span>
                              <strong className="text-white">{b.checkInDate}</strong>
                              <span className="text-[10px] text-stone-400 block">({b.checkInTime})</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block">Check-out</span>
                              <strong className="text-white">{b.checkOutDate}</strong>
                              <span className="text-[10px] text-stone-400 block">({b.checkOutTime})</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block">Stay Duration</span>
                              <strong className="text-white">{b.nights} Nights</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block">Guest Count</span>
                              <strong className="text-white">{b.guests} Guests</strong>
                            </div>
                          </div>

                          {/* Room & Staff Allocation */}
                          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-300">
                                Allocated Room / Unit:
                              </span>
                              <span className="font-extrabold text-white">
                                {b.allocatedRoomNumber || 'Assignment in progress'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-stone-300 text-[11px]">
                              <span>Assigned PoaStay Coordinator:</span>
                              <span className="font-semibold text-emerald-400">
                                {b.assignedStaffName || 'Faith Chepkemoi'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transportation & Meals Info */}
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        {b.transportOption ? (
                          <div className="p-3 bg-stone-950/60 rounded-2xl border border-white/10 space-y-1">
                            <p className="font-bold text-white flex items-center gap-1.5">
                              {b.transportOption.mode === 'air' && <Plane className="w-3.5 h-3.5 text-amber-400" />}
                              {b.transportOption.mode === 'train' && <Train className="w-3.5 h-3.5 text-emerald-400" />}
                              {b.transportOption.mode === 'road' && <Car className="w-3.5 h-3.5 text-stone-300" />}
                              Transport: {b.transportOption.name}
                            </p>
                            <p className="text-[11px] text-stone-300">
                              Vehicle: {b.transportOption.vehicleReg || 'Pending reg'} • Driver:{' '}
                              {b.transportOption.assignedDriver || 'Assigned prior to travel'}
                            </p>
                            <p className="text-[10px] text-stone-400">
                              Depart: {b.transportOption.departurePoint} ({b.transportOption.schedule})
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-stone-950/60 rounded-2xl border border-white/10 text-stone-300 text-xs">
                            <p className="font-bold text-white">Transport: Client Self-Drive</p>
                            <p className="text-[11px] text-stone-400">
                              Free on-premises secured guest parking allocated.
                            </p>
                          </div>
                        )}

                        <div className="p-3 bg-stone-950/60 rounded-2xl border border-white/10 space-y-1">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-amber-400" />
                            Dining: {b.mealArrangement.dietaryPreference || 'Kenyan Delicacies'}
                          </p>
                          <p className="text-[11px] text-stone-300">
                            Included:{' '}
                            {[
                              b.mealArrangement.breakfast && 'Breakfast',
                              b.mealArrangement.lunch && 'Lunch',
                              b.mealArrangement.dinner && 'Dinner',
                            ]
                              .filter(Boolean)
                              .join(' + ') || 'Self-catering'}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate">
                            Notes: {b.mealArrangement.notes}
                          </p>
                        </div>
                      </div>

                      {/* Financial Installment Progress */}
                      <div className="p-4 bg-stone-950/60 rounded-2xl border border-white/10 space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">
                            Payment Installment Progress ({percentPaid}% Completed)
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            Paid: KSh {b.amountPaid.toLocaleString()} / KSh {b.totalAmount.toLocaleString()}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isFullyPaid ? 'bg-emerald-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          ></div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <div className="text-xs">
                            {isFullyPaid ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                All installments cleared! No balance due.
                              </span>
                            ) : (
                              <span className="text-amber-300 font-bold font-mono">
                                Remaining Balance Due: KSh {b.balanceDue.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Direct WhatsApp link */}
                            <a
                              href={`https://wa.me/254712345601?text=${encodeURIComponent(
                                `Habari! I am inquiring about my PoaStay Booking Ref: ${b.bookingRef} at ${b.accommodationTitle}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WhatsApp Support</span>
                            </a>

                            {/* Pay next installment button */}
                            {!isFullyPaid && (
                              <button
                                onClick={() => handlePayInstallmentModal(b)}
                                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Pay Installment via M-Pesa</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* M-Pesa Receipts List */}
                      {b.mpesaTransactions && b.mpesaTransactions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            Verified Safaricom M-Pesa Receipts:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {b.mpesaTransactions.map((tx) => (
                              <div
                                key={tx.id}
                                className="bg-stone-950/70 px-3 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-stone-300 flex items-center gap-2"
                              >
                                <span className="font-bold text-emerald-400">{tx.receiptNumber}</span>
                                <span>KSh {tx.amount.toLocaleString()}</span>
                                <span className="text-[10px] text-stone-400">({tx.timestamp ? tx.timestamp.split(' ')[0] : 'Recent'})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Guest Stay Rating & Review Status */}
                      {(() => {
                        const bookingReview = reviews.find(
                          (r) =>
                            r.bookingRef === b.bookingRef ||
                            (r.accommodationId === b.accommodationId &&
                              (r.customerId === b.customerId ||
                                r.customerName.toLowerCase() === b.customerName.toLowerCase() ||
                                r.customerPhone === b.customerPhone))
                        );

                        if (bookingReview) {
                          return (
                            <div className="p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-2xl space-y-1.5 text-stone-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    Your Verified Review:
                                  </span>
                                  <div className="flex items-center gap-0.5 text-amber-400">
                                    {[...Array(bookingReview.rating)].map((_, i) => (
                                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    ))}
                                    <span className="text-xs font-black text-amber-300 ml-1">
                                      {bookingReview.rating}.0
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReviewModal(undefined, b)}
                                  className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                                >
                                  Edit Review
                                </button>
                              </div>
                              {bookingReview.title && (
                                <p className="text-xs font-bold text-white">"{bookingReview.title}"</p>
                              )}
                              <p className="text-xs text-stone-300 leading-relaxed italic">
                                "{bookingReview.reviewText}"
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-white/10">
                                <span>Reviewed on {bookingReview.createdAt}</span>
                                {bookingReview.recommend !== undefined && (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    ✓ {bookingReview.recommend ? 'Recommended to fellow travelers' : 'Feedback recorded'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-200">
                            <div className="space-y-0.5">
                              <p className="text-xs font-black text-white flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                {b.bookingStatus === 'completed'
                                  ? 'Stay Completed! How was your experience?'
                                  : 'Visited or staying at this property?'}
                              </p>
                              <p className="text-[11px] text-stone-300">
                                Leave a star rating & written review for {b.accommodationTitle} to assist fellow Kenyan travelers.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenReviewModal(undefined, b)}
                              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                              <span>Rate & Review Stay</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: GROUP TRIP COORDINATOR */}
      {activeTab === 'group-trips' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white space-y-3 border border-white/15 shadow-2xl backdrop-blur-xl">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
              Group Travel & Chama Trip Coordinator
            </span>
            <h2 className="text-2xl font-black">Coordinate Group Stays in Kenya</h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Organizing a family reunion, friends' getaway, or corporate retreat? PoaStay lets you share a unique Group Trip Code. Each member can view the shared itinerary, see the split per head, and pay their M-Pesa installment independently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Group Code Demo: DIANI-SQUAD-2026 */}
            <div className="bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-2xl space-y-4 text-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30">
                    DIANI-SQUAD-2026
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    Diani Beach Coastal Squad Getaway
                  </h3>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-400/30">
                  4 Members
                </span>
              </div>

              <div className="p-3 bg-stone-950/60 border border-white/10 rounded-2xl text-xs space-y-1 text-stone-300">
                <p>
                  <strong className="text-white">Property:</strong> Diani Palm Breeze Luxury Beachfront Villa
                </p>
                <p>
                  <strong className="text-white">Dates:</strong> 2026-10-01 to 2026-10-05 (4 Nights)
                </p>
                <p>
                  <strong className="text-white">Total Package:</strong> KSh 133,200 (Villa + SGR Train + Private Chef)
                </p>
                <p>
                  <strong className="text-white">Individual Split:</strong> KSh 33,300 per person
                </p>
              </div>

              {/* Members Payment Status */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Member Contribution Status:
                </h4>
                {[
                  { name: 'Wangari Maathai (Lead)', status: 'Deposit Paid (KSh 40,000)', ok: true },
                  { name: 'Eng. Dennis Kipchoge', status: 'Pending Share (KSh 33,300)', ok: false },
                  { name: 'Amina Juma', status: 'Pending Share (KSh 33,300)', ok: false },
                  { name: 'Brian Kipruto', status: 'Pending Share (KSh 33,300)', ok: false },
                ].map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-stone-950/60 rounded-xl text-xs border border-white/10"
                  >
                    <span className="font-semibold text-stone-200">{m.name}</span>
                    <span
                      className={`font-bold text-[11px] ${
                        m.ok ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText('https://poastay.co.ke/group/DIANI-SQUAD-2026');
                  alert('Group invite link copied to clipboard!');
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-stone-400" />
                <span>Share Group Invite Link</span>
              </button>
            </div>

            {/* Mara Safari Group Demo: MARA-SAFARI-09 */}
            <div className="bg-stone-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/15 shadow-2xl space-y-4 text-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-400/30">
                    MARA-SAFARI-09
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    Great Migration Photography Camp
                  </h3>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-400/30">
                  Fully Settled
                </span>
              </div>

              <div className="p-3 bg-stone-950/60 border border-white/10 rounded-2xl text-xs space-y-1 text-stone-300">
                <p>
                  <strong className="text-white">Property:</strong> Mara Riverbend Luxury Safari Bush Camp
                </p>
                <p>
                  <strong className="text-white">Dates:</strong> 2026-09-28 to 2026-10-03 (5 Nights)
                </p>
                <p>
                  <strong className="text-white">Transport:</strong> 4x4 Land Cruiser with Pro Guide Ole Kaelo
                </p>
                <p>
                  <strong className="text-white">Total Package:</strong> KSh 225,000 (Full Board)
                </p>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  All member payments verified via Daraja M-Pesa.
                </p>
                <p className="text-[11px] text-stone-300">
                  Driver will meet group at Westlands pickup point at 06:30 AM on departure day.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accommodation Detail Modal */}
      <AccommodationDetailModal
        accommodation={selectedAccForDetail}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onAddedToCart={() => {
          // Open cart drawer or show notice
        }}
        onOpenCartAndCheckout={() => {
          setDetailModalOpen(false);
          onOpenCart();
        }}
        onOpenReviewModal={(acc) => handleOpenReviewModal(acc)}
      />

      {/* Leave Review Modal */}
      <LeaveReviewModal
        isOpen={leaveReviewModalOpen}
        onClose={() => setLeaveReviewModalOpen(false)}
        targetAccommodation={reviewTargetAcc}
        targetBooking={reviewTargetBooking}
      />

      {/* Subsequent Installment Payment Modal */}
      {payingBooking && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-emerald-800 to-stone-900 p-5 text-white relative">
              <button
                onClick={() => setPayingBooking(null)}
                className="absolute top-4 right-4 p-1 text-white/70 hover:text-white rounded-full bg-black/20"
              >
                ✕
              </button>
              <h3 className="text-base font-black">Pay Next M-Pesa Installment</h3>
              <p className="text-xs text-stone-300">
                Booking: {payingBooking.bookingRef} • {payingBooking.accommodationTitle}
              </p>
            </div>

            <div className="p-5">
              {installmentStep === 'form' && (
                <form onSubmit={handleExecuteInstallment} className="space-y-4">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Total Booking:</span>
                      <span className="font-bold">KSh {payingBooking.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Already Paid:</span>
                      <span className="text-emerald-700 font-bold">KSh {payingBooking.amountPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                      <span>Remaining Balance:</span>
                      <span className="text-amber-700">KSh {payingBooking.balanceDue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Installment Amount to Pay (KSh)
                    </label>
                    <input
                      type="number"
                      min="500"
                      max={payingBooking.balanceDue}
                      value={installmentAmount}
                      onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                      required
                    />
                    <div className="flex gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setInstallmentAmount(Math.round(payingBooking.balanceDue * 0.5))}
                        className="text-[10px] font-bold px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700"
                      >
                        50% of Balance (KSh {Math.round(payingBooking.balanceDue * 0.5).toLocaleString()})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstallmentAmount(payingBooking.balanceDue)}
                        className="text-[10px] font-bold px-2 py-1 bg-emerald-100 hover:bg-emerald-200 rounded-md text-emerald-800"
                      >
                        Clear Full Balance (KSh {payingBooking.balanceDue.toLocaleString()})
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      M-Pesa Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={installmentPhone}
                      onChange={(e) => setInstallmentPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Trigger M-Pesa STK Push for KSh {installmentAmount.toLocaleString()}</span>
                  </button>
                </form>
              )}

              {installmentStep === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
                  <p className="text-sm font-bold text-stone-900">
                    Awaiting Safaricom M-Pesa STK Authorization...
                  </p>
                  <p className="text-xs text-stone-500">
                    Please check handset {installmentPhone} and enter your PIN.
                  </p>
                </div>
              )}

              {installmentStep === 'done' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-extrabold text-stone-900">
                    Installment Payment Received!
                  </h4>
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-mono text-xs text-left space-y-0.5">
                    <p className="font-bold text-emerald-900">Receipt No: {installmentReceipt}</p>
                    <p className="text-stone-600">Amount: KSh {installmentAmount.toLocaleString()}</p>
                    <p className="text-stone-600">Daraja Status: SUCCESS (ResultCode 0)</p>
                  </div>
                  <button
                    onClick={() => setPayingBooking(null)}
                    className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                  >
                    Done & Refresh Booking Pass
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
