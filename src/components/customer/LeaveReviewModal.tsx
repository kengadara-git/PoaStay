import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { Accommodation, Booking } from '../../types';
import {
  X,
  Star,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Calendar,
  ShieldCheck,
  Heart,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAccommodation?: Accommodation | null;
  targetBooking?: Booking | null;
  onReviewSubmitted?: (newRating: number) => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  targetAccommodation,
  targetBooking,
  onReviewSubmitted,
}) => {
  const { accommodations, bookings, currentUser, addPropertyReview } = usePoaStay();

  // Find eligible accommodations (either passed prop or all available)
  const defaultAccId =
    targetAccommodation?.id ||
    targetBooking?.accommodationId ||
    accommodations[0]?.id ||
    '';

  const [selectedAccId, setSelectedAccId] = useState<string>(defaultAccId);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Sub-category ratings
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [hospitalityRating, setHospitalityRating] = useState<number>(5);
  const [locationRating, setLocationRating] = useState<number>(5);

  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [recommend, setRecommend] = useState<boolean>(true);
  const [visitedDate, setVisitedDate] = useState<string>(() => {
    if (targetBooking?.checkInDate) return targetBooking.checkInDate;
    return new Date().toISOString().split('T')[0];
  });

  const [reviewerName, setReviewerName] = useState<string>(
    currentUser?.name || targetBooking?.customerName || 'Wangari Maathai Kimani'
  );
  const [reviewerPhone, setReviewerPhone] = useState<string>(
    currentUser?.phone || targetBooking?.customerPhone || '+254 718 223 344'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const currentAccommodation = accommodations.find((a) => a.id === selectedAccId);

  // Quick review suggestion tags
  const promptTags = [
    '✨ Breathtaking Views',
    '🌊 Direct Beachfront Access',
    '🍲 Delicious Swahili Meals',
    '📶 Fast Starlink WiFi',
    '🦁 Excellent Game Drives',
    '🏊 Clean Private Pool',
    '🤝 Hospitable Host & Staff',
    '🚗 Smooth Transport Pick-up',
  ];

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
    if (reviewText.includes(cleanTag)) return;
    setReviewText((prev) => (prev ? `${prev}. ${cleanTag}` : cleanTag));
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return 'Exceptional (Poa Sana! 🌟 Highly Recommended)';
      case 4:
        return 'Very Good (Mazingira Mazuri & Great Hospitality)';
      case 3:
        return 'Good (Pleasant stay, met expectations)';
      case 2:
        return 'Fair (Had a few issues, room for improvement)';
      case 1:
        return 'Poor (Disappointing experience)';
      default:
        return 'Select your rating';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedAccId || !currentAccommodation) {
      setErrorMessage('Please select the property you stayed at.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please provide a star rating from 1 to 5.');
      return;
    }

    if (reviewText.trim().length < 15) {
      setErrorMessage('Please write at least 15 characters to share details about your experience.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = addPropertyReview({
        accommodationId: currentAccommodation.id,
        accommodationTitle: currentAccommodation.title,
        bookingRef: targetBooking?.bookingRef || 'VERIFIED-VISIT',
        customerId: currentUser?.id,
        customerName: reviewerName.trim() || 'Verified Guest',
        customerPhone: reviewerPhone.trim(),
        rating,
        title: reviewTitle.trim() || `${rating}-Star Experience at ${currentAccommodation.title}`,
        reviewText: reviewText.trim(),
        visitedDate,
        recommend,
        cleanlinessRating,
        hospitalityRating,
        locationRating,
      });

      setIsSubmitting(false);

      if (result.success) {
        setIsSuccess(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#059669', '#10b981', '#f59e0b', '#fbbf24'],
          });
        } catch (err) {}

        if (onReviewSubmitted) {
          onReviewSubmitted(result.newRating);
        }

        setTimeout(() => {
          onClose();
          setIsSuccess(false);
        }, 1800);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-stone-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden my-auto max-h-[92vh] flex flex-col text-stone-100">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-stone-950/90 text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                Rate & Review Property
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Verified Guest
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Share your authentic stay experience to help future Kenyan travelers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-white">Asante Sana! Review Published!</h4>
                <p className="text-xs text-stone-300 max-w-sm mx-auto">
                  Your star rating and written review for{' '}
                  <strong className="text-white">{currentAccommodation?.title}</strong> have been
                  verified and updated on the accommodation card.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live on PoaStay Kenya
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Target Property Highlight */}
              {targetAccommodation || targetBooking ? (
                <div className="flex items-center gap-3.5 p-3.5 bg-stone-950/60 rounded-2xl border border-white/10">
                  <img
                    src={currentAccommodation?.images?.[0] || targetBooking?.accommodationImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
                    alt={currentAccommodation?.title || 'Accommodation'}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/30">
                      {targetBooking ? `Visited Booking Ref: ${targetBooking.bookingRef}` : 'Selected Accommodation'}
                    </span>
                    <h4 className="text-sm font-extrabold text-white truncate mt-1">
                      {currentAccommodation?.title}
                    </h4>
                    <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {currentAccommodation?.location} ({currentAccommodation?.county})
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Select Property You Visited *
                  </label>
                  <select
                    value={selectedAccId}
                    onChange={(e) => setSelectedAccId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-950/70 border border-white/15 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {accommodations.map((acc) => (
                      <option key={acc.id} value={acc.id} className="bg-stone-900 text-white">
                        {acc.title} — {acc.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Main Overall Star Rating */}
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-white/10 text-center space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-stone-300">
                  Overall Star Rating *
                </label>

                {/* Interactive Stars */}
                <div className="flex justify-center items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-stone-500 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                        aria-label={`${star} Stars`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                              : 'text-stone-600 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-bold text-amber-300 h-4">
                  {getRatingLabel(hoverRating || rating)}
                </p>
              </div>

              {/* Category Breakdown (Sub-scores) */}
              <div className="p-3.5 bg-stone-950/60 rounded-2xl border border-white/10 space-y-2.5">
                <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                  Detailed Rating Breakdown
                </span>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  {/* Cleanliness */}
                  <div className="space-y-1 bg-stone-900/80 p-2.5 rounded-xl border border-white/10">
                    <span className="text-stone-300 block text-[11px] font-semibold">Cleanliness</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setCleanlinessRating(s)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              cleanlinessRating >= s ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-white ml-1">{cleanlinessRating}.0</span>
                    </div>
                  </div>

                  {/* Hospitality */}
                  <div className="space-y-1 bg-stone-900/80 p-2.5 rounded-xl border border-white/10">
                    <span className="text-stone-300 block text-[11px] font-semibold">Staff & Host</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setHospitalityRating(s)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              hospitalityRating >= s ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-white ml-1">{hospitalityRating}.0</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1 bg-stone-900/80 p-2.5 rounded-xl border border-white/10">
                    <span className="text-stone-300 block text-[11px] font-semibold">Location & Views</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setLocationRating(s)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              locationRating >= s ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-white ml-1">{locationRating}.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Headline & Text */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Review Headline / Title
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Unforgettable weekend in Diani! Chef Hamisi was amazing."
                    className="w-full px-3.5 py-2.5 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder-stone-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-300">
                      Your Written Review *
                    </label>
                    <span className="text-[10px] text-stone-400">
                      {reviewText.length} characters (min 15)
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe your stay experience: What did you think of the rooms, the scenery, host hospitality, local cuisine, cleanliness, and travel logistics?"
                    className="w-full px-3.5 py-2.5 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-normal placeholder-stone-400"
                  />

                  {/* Suggestion tags */}
                  <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-stone-400">Quick highlights:</span>
                    {promptTags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="text-[10px] bg-white/10 hover:bg-emerald-500/20 text-stone-300 hover:text-emerald-300 border border-white/10 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendation & Stay Date */}
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-300">
                    Would you recommend this stay?
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRecommend(true)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        recommend
                          ? 'bg-emerald-600 text-white shadow-xs border-emerald-500'
                          : 'bg-white/10 text-stone-400 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Yes, Recommend</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecommend(false)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        !recommend
                          ? 'bg-rose-600 text-white shadow-xs border-rose-500'
                          : 'bg-white/10 text-stone-400 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>No</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-300">Date of Visit</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={visitedDate}
                      onChange={(e) => setVisitedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reviewer Details */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Your Name (Displayed on Review)
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Phone / M-Pesa Contact
                  </label>
                  <input
                    type="text"
                    value={reviewerPhone}
                    onChange={(e) => setReviewerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-extrabold rounded-xl shadow-lg border border-emerald-400/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Publishing Review...</span>
                  ) : (
                    <>
                      <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                      <span>Submit Star Rating & Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
