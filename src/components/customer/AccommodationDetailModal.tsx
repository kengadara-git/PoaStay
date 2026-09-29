import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { Accommodation, TransportOption } from '../../types';
import {
  X,
  MapPin,
  Star,
  Users,
  Calendar,
  Clock,
  Car,
  Plane,
  Train,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Phone,
  ShieldCheck,
  Compass,
  ArrowRight,
  Info,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface AccommodationDetailModalProps {
  accommodation: Accommodation | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart: () => void;
  onOpenCartAndCheckout?: () => void;
  onOpenReviewModal?: (acc: Accommodation) => void;
}

export const AccommodationDetailModal: React.FC<AccommodationDetailModalProps> = ({
  accommodation,
  isOpen,
  onClose,
  onAddedToCart,
  onOpenCartAndCheckout,
  onOpenReviewModal,
}) => {
  const { transportOptions, addToCart, checkDateAvailability, getAccommodationReviews } = usePoaStay();

  // Date and guest defaults
  const today = new Date().toISOString().split('T')[0];
  const nextThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(nextThreeDays);
  const [guests, setGuests] = useState(2);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selected addons
  const [selectedTransport, setSelectedTransport] = useState<TransportOption | undefined>(undefined);
  const [selectedMealPlan, setSelectedMealPlan] = useState<'none' | 'breakfast' | 'half_board' | 'full_board'>('breakfast');

  if (!isOpen || !accommodation) return null;

  // Available transport for this specific Kenyan destination
  const availableTransports = transportOptions[accommodation.location] || [];

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate meal price
  const mealDailyRates = {
    none: 0,
    breakfast: 1200,
    half_board: 2800,
    full_board: 4500,
  };
  const mealPriceTotal = mealDailyRates[selectedMealPlan] * guests * nights;

  // Transport total
  const transportPriceTotal = selectedTransport ? selectedTransport.pricePerPerson * guests : 0;

  // Accommodation total
  const accommodationTotal = accommodation.pricePerNight * nights;
  const grandTotal = accommodationTotal + transportPriceTotal + mealPriceTotal;

  // Real-time stock & conflict check
  const stockRemaining = Math.max(0, accommodation.totalUnits - (accommodation.bookedUnits || 0));
  const isOutOfStock = stockRemaining <= 0;
  const availabilityCheck = checkDateAvailability(accommodation.id, checkIn, checkOut, 1);

  const handleAddToCart = (proceedToCheckout: boolean = false) => {
    if (!availabilityCheck.available) return;

    addToCart({
      accommodation,
      checkIn,
      checkOut,
      nights,
      guests,
      transport: selectedTransport,
      mealPlan: selectedMealPlan,
      mealPriceTotal,
      totalPrice: grandTotal,
    });

    onAddedToCart();

    if (proceedToCheckout && onOpenCartAndCheckout) {
      onOpenCartAndCheckout();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-900/95 backdrop-blur-2xl w-full max-w-4xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden my-auto max-h-[95vh] flex flex-col text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Sticky Bar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-stone-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-400/30 capitalize">
              {accommodation.type.replace('_', ' ')}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {accommodation.county}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Stock Badge */}
            {isOutOfStock ? (
              <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full border border-rose-400/30 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                SOLD OUT
              </span>
            ) : (
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                In Stock ({stockRemaining} {stockRemaining === 1 ? 'unit' : 'units'} left)
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Images Carousel / Gallery */}
          <div className="space-y-2">
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden group">
              <img
                src={
                  accommodation.images?.[activeImageIndex] ||
                  accommodation.images?.[0] ||
                  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
                }
                alt={accommodation.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              {(accommodation.images?.length || 0) > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev > 0 ? prev - 1 : (accommodation.images?.length || 1) - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev < accommodation.images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-lg border border-white/10">
                Photo {activeImageIndex + 1} of {accommodation.images.length}
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {accommodation.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-emerald-500 scale-102' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Title and Rating Info */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {accommodation.title}
              </h2>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  KSh {accommodation.pricePerNight.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-stone-400">/ night</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300">
              <span className="flex items-center gap-1 font-semibold text-white">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {accommodation.location} ({accommodation.county})
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {accommodation.rating} ({accommodation.reviewsCount} verified reviews)
              </span>
              <span className="flex items-center gap-1 text-stone-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Check-in: {accommodation.checkInTime} • Check-out: {accommodation.checkOutTime}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-stone-950/60 rounded-2xl border border-white/10 text-xs sm:text-sm text-stone-200 leading-relaxed">
            {accommodation.description}
          </div>

          {/* Travel & Route Estimates */}
          <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-2xl space-y-1.5 text-xs text-stone-200">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              Kenyan Travel Route & Destination Accessibility:
            </p>
            <div className="grid sm:grid-cols-2 gap-2 pt-1 text-stone-300">
              <div>
                <span className="font-semibold text-white">From:</span> {accommodation.travelEstimate.from}
              </div>
              <div>
                <span className="font-semibold text-white">Estimated Duration:</span>{' '}
                {accommodation.travelEstimate.duration}
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-white">Route Highlights:</span>{' '}
                {accommodation.travelEstimate.routeHighlights}
              </div>
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Featured Amenities & Guest Perks
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {accommodation.amenities.map((am, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 bg-stone-950/60 rounded-xl border border-white/10 text-xs text-stone-200 font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transport Selector Based on Destination */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Available Transport for {accommodation.location ? accommodation.location.split(',')[0] : 'Destination'}</span>
                  <span className="bg-stone-100 text-stone-600 text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {availableTransports.length} Options
                  </span>
                </h4>
                <p className="text-xs text-stone-700">
                  Select your preferred mode of travel based on realistic Kenyan routes
                </p>
              </div>
            </div>

            {availableTransports.length === 0 ? (
              <p className="text-xs text-stone-700 italic">
                Self-drive / private vehicle recommended for this location.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {/* No transport option */}
                <div
                  onClick={() => setSelectedTransport(undefined)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTransport === undefined
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">Self-Drive / Client Car</span>
                    <span className="text-xs font-bold text-emerald-800">FREE</span>
                  </div>
                  <p className="text-[11px] text-stone-700 mt-1">
                    Free secure parking provided at the property with 24/7 security.
                  </p>
                </div>

                {availableTransports.map((t) => {
                  const isSelected = selectedTransport?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTransport(t)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                            {t.mode === 'air' && <Plane className="w-4 h-4 text-amber-600" />}
                            {t.mode === 'train' && <Train className="w-4 h-4 text-emerald-600" />}
                            {t.mode === 'road' && <Car className="w-4 h-4 text-stone-700" />}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-stone-900 leading-tight">
                              {t.name}
                            </p>
                            <p className="text-[10px] text-stone-700 font-medium">
                              {t.operator} • {t.duration}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-extrabold text-stone-900">
                            KSh {t.pricePerPerson.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-stone-700">per person</p>
                        </div>
                      </div>

                      <div className="text-[11px] text-stone-700 bg-stone-50 p-2 rounded-xl">
                        <p>
                          <strong className="text-stone-900">Depart:</strong> {t.departurePoint}
                        </p>
                        <p>
                          <strong className="text-stone-900">Arrive:</strong> {t.arrivalPoint}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {t.features.slice(0, 2).map((f, fi) => (
                          <span
                            key={fi}
                            className="bg-stone-100 text-stone-600 text-[10px] px-1.5 py-0.5 rounded font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meal Coordination Packages */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Kenyan Dining & Meal Arrangements</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'none', label: 'Self-Catering', rate: 0, desc: 'Equipped kitchen or nearby dining' },
                { key: 'breakfast', label: 'Farmhouse Breakfast', rate: 1200, desc: 'Fresh fruits, eggs, tea/coffee' },
                { key: 'half_board', label: 'Half Board', rate: 2800, desc: 'Breakfast + 3-Course Dinner' },
                { key: 'full_board', label: 'Full Board Safari', rate: 4500, desc: 'Breakfast, Lunch & Gourmet Dinner' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMealPlan(m.key as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedMealPlan === m.key
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 text-stone-900'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <p className="text-xs font-bold">{m.label}</p>
                  <p className="text-[11px] font-extrabold text-amber-800">
                    {m.rate === 0 ? 'Included' : `+KSh ${m.rate.toLocaleString()} / day`}
                  </p>
                  <p className="text-[10px] text-stone-700 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Nearby Kenyan Restaurants Section */}
          {accommodation.nearbyRestaurants && accommodation.nearbyRestaurants.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Nearby Kenyan Restaurants & Dining Options
                  </h4>
                  <p className="text-xs text-stone-700">
                    Local dining spots located within or near this staycation property
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {accommodation.nearbyRestaurants.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5"
                  >
                    <div className="flex gap-3">
                      <img
                        src={r.image}
                        alt={r.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <h5 className="text-xs font-extrabold text-stone-900 truncate">{r.name}</h5>
                          <span className="text-[11px] font-bold text-amber-800 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {r.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-medium truncate mt-0.5">
                          {r.cuisine}
                        </p>
                        <p className="text-[10px] text-stone-700">
                          {r.distance} • {r.priceRange}
                        </p>
                      </div>
                    </div>

                    {/* Signature dishes */}
                    <div className="bg-white p-2 rounded-xl border border-stone-200/70 space-y-1 text-xs">
                      <p className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                        Sample Menu & Signature Dishes:
                      </p>
                      {r.signatureDishes.map((dish, di) => (
                        <div key={di} className="flex justify-between items-center text-[11px] gap-2">
                          <span className="text-stone-800 truncate">{dish.name}</span>
                          <span className="font-bold text-stone-900 shrink-0">
                            KSh {dish.priceKsh.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guest Ratings & Verified Reviews Section */}
          <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    Guest Ratings & Verified Reviews
                  </h4>
                  <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                    ★ {accommodation.rating.toFixed(1)} / 5.0
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Based on {accommodation.reviewsCount} verified stays on PoaStay Kenya
                </p>
              </div>

              {onOpenReviewModal && (
                <button
                  type="button"
                  onClick={() => onOpenReviewModal(accommodation)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Star className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                  <span>Leave a Review</span>
                </button>
              )}
            </div>

            {/* Sub-ratings showcase */}
            <div className="grid grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-stone-200 text-xs">
              <div className="text-center">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Cleanliness</span>
                <span className="text-sm font-black text-stone-900 flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>
              <div className="text-center border-x border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Staff & Host</span>
                <span className="text-sm font-black text-stone-900 flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  5.0
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Location</span>
                <span className="text-sm font-black text-stone-900 flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>
            </div>

            {/* Reviews List */}
            {(() => {
              const reviewsList = getAccommodationReviews(accommodation.id);
              if (reviewsList.length === 0) {
                return (
                  <div className="text-center py-6 bg-white rounded-xl border border-dashed border-stone-300 space-y-2">
                    <p className="text-xs text-stone-600 font-medium">
                      No written reviews yet for this property.
                    </p>
                    {onOpenReviewModal && (
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(accommodation)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                      >
                        Be the first to leave a review!
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {reviewsList.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-white rounded-xl border border-stone-200/90 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">{rev.customerName}</span>
                            {rev.verifiedStay && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                Verified Stay
                              </span>
                            )}
                          </div>
                          {rev.visitedDate && (
                            <span className="text-[10px] text-stone-600">
                              Stayed on {rev.visitedDate} {rev.bookingRef ? `• Ref: ${rev.bookingRef}` : ''}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <h6 className="text-xs font-bold text-stone-900">"{rev.title}"</h6>
                      )}

                      <p className="text-xs text-stone-600 leading-relaxed">{rev.reviewText}</p>

                      {rev.recommend && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 pt-1 border-t border-stone-100">
                          <ThumbsUp className="w-3 h-3 text-emerald-600" />
                          <span>Recommends this property to fellow travelers</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Date Picker & Availability Verification Bar */}
          <div className="p-4 bg-stone-950/60 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Select Trip Dates & Guest Count
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl bg-stone-900 text-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl bg-stone-900 text-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">Number of Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl bg-stone-900 text-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <option key={num} value={num} className="bg-stone-900 text-white">
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Availability Conflict Alert */}
            {!availabilityCheck.available && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-400/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Calendar Conflict:</strong> {availabilityCheck.reason} Please adjust dates.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-white/10 bg-stone-950/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-100">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white font-mono">
                KSh {grandTotal.toLocaleString()}
              </span>
              <span className="text-xs text-stone-400">
                ({nights} {nights === 1 ? 'night' : 'nights'}, {guests} guests)
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold font-mono">
              M-Pesa 30% Down Deposit: KSh {Math.round(grandTotal * 0.3).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={isOutOfStock || !availabilityCheck.available}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                isOutOfStock || !availabilityCheck.available
                  ? 'bg-white/5 text-stone-500 border-white/10 cursor-not-allowed'
                  : 'bg-white/10 text-stone-200 border-white/15 hover:bg-white/20'
              }`}
            >
              Add to Cart
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              disabled={isOutOfStock || !availabilityCheck.available}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                isOutOfStock || !availabilityCheck.available
                  ? 'bg-stone-800 text-stone-500 border border-white/10 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/50 border border-emerald-400/30'
              }`}
            >
              <span>Instant M-Pesa Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
