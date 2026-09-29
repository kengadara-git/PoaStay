import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { CartItem } from '../../types';
import {
  X,
  Trash2,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  ArrowRight,
  Sparkles,
  Plane,
  Train,
  Car,
  Utensils,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onBookingSuccess?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onBookingSuccess,
}) => {
  const { cart, removeFromCart, clearCart, currentUser, createBookingFromCart } = usePoaStay();

  // Checkout modal state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);
  const [paymentOption, setPaymentOption] = useState<'deposit_30' | 'deposit_50' | 'full'>('deposit_30');
  const [mpesaPhone, setMpesaPhone] = useState(currentUser?.phone || '+254 7');
  const [groupCode, setGroupCode] = useState('');
  const [isProcessingStk, setIsProcessingStk] = useState(false);
  const [stkStep, setStkStep] = useState<'idle' | 'push_sent' | 'simulating_pin' | 'completed'>('idle');
  const [mpesaPinInput, setMpesaPinInput] = useState('');
  const [confirmedReceipt, setConfirmedReceipt] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  if (!isOpen) return null;

  const totalCartValue = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  const handleStartCheckout = (item: CartItem) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setSelectedCartItem(item);
    setMpesaPhone(currentUser.phone || '+254 7');
    setIsCheckingOut(true);
    setStkStep('idle');
    setConfirmedReceipt(null);
    setCheckoutError('');
  };

  const getDepositAmount = (item: CartItem) => {
    if (paymentOption === 'full') return item.totalPrice;
    if (paymentOption === 'deposit_50') return Math.round(item.totalPrice * 0.5);
    return Math.round(item.totalPrice * 0.3); // 30% default
  };

  const handleSendStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCartItem) return;

    if (!mpesaPhone || mpesaPhone.length < 9) {
      setCheckoutError('Please enter a valid Kenyan Safaricom phone number (e.g. 0712345678).');
      return;
    }

    setIsProcessingStk(true);
    setStkStep('push_sent');

    // Simulate Daraja API STK Push delay
    setTimeout(() => {
      setStkStep('simulating_pin');
      setIsProcessingStk(false);
    }, 1200);
  };

  const handleConfirmPinAndPay = async () => {
    if (!selectedCartItem) return;
    setIsProcessingStk(true);

    const deposit = getDepositAmount(selectedCartItem);
    const result = await createBookingFromCart(
      selectedCartItem,
      deposit,
      mpesaPhone,
      groupCode.trim() || undefined
    );

    setIsProcessingStk(false);

    if (result.success && result.booking) {
      setStkStep('completed');
      setConfirmedReceipt(result.booking.mpesaTransactions[0]?.receiptNumber || 'QKJ89420KL');

      // Remove booked item from cart
      removeFromCart(selectedCartItem.id);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#f59e0b', '#d97706'],
        });
      } catch (err) {
        console.error(err);
      }

      if (onBookingSuccess) onBookingSuccess();
    } else {
      setCheckoutError(result.error || 'Failed to process M-Pesa payment.');
      setStkStep('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-lg bg-stone-900/95 backdrop-blur-2xl border-l border-white/15 text-stone-100 h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-stone-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {cart.length}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Your PoaStay Trip Cart</h3>
              <p className="text-xs text-stone-400">Kenyan Stays, Transport & Catering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-400">
                <Users className="w-8 h-8 text-stone-500" />
              </div>
              <h4 className="text-base font-bold text-stone-200">Your cart is empty</h4>
              <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                Explore Kenyan Airbnbs, beachfront BnBs, safari camps, and staycations to begin your trip.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Browse Kenyan Accommodations
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const deposit = Math.round(item.totalPrice * 0.3);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-stone-950/60 border border-white/10 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.accommodation.images[0]}
                        alt={item.accommodation.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-extrabold text-white truncate">
                            {item.accommodation.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-red-400 p-0.5 rounded transition-colors"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                          {item.accommodation.location}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-500" />
                            {item.checkIn} to {item.checkOut} ({item.nights} nights)
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-stone-500" />
                            {item.guests} Guests
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Transport addon */}
                    {item.transport && (
                      <div className="bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-white/10 text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-stone-300">
                          {item.transport.mode === 'air' && <Plane className="w-3.5 h-3.5 text-amber-400" />}
                          {item.transport.mode === 'train' && <Train className="w-3.5 h-3.5 text-emerald-400" />}
                          {item.transport.mode === 'road' && <Car className="w-3.5 h-3.5 text-stone-400" />}
                          <span className="font-semibold text-stone-200 truncate max-w-[200px]">
                            {item.transport.name}
                          </span>
                        </div>
                        <span className="text-white font-bold">
                          KSh {(item.transport.pricePerPerson * item.guests).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Selected Meal Plan addon */}
                    {item.mealPlan !== 'none' && (
                      <div className="bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-white/10 text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-stone-300">
                          <Utensils className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-semibold capitalize text-stone-200">
                            {item.mealPlan.replace('_', ' ')} Catering
                          </span>
                        </div>
                        <span className="text-white font-bold">
                          KSh {item.mealPriceTotal.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Price and Action */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-400 block">Total Package</span>
                        <span className="text-sm font-black text-white">
                          KSh {item.totalPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-medium">
                          Deposit from KSh {deposit.toLocaleString()} (30%)
                        </span>
                      </div>

                      <button
                        onClick={() => handleStartCheckout(item)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                      >
                        <span>Purchase via M-Pesa</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Auth status */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-stone-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300">Total Cart Value</span>
              <span className="text-lg font-black text-white">
                KSh {totalCartValue.toLocaleString()}
              </span>
            </div>

            {!currentUser ? (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                <span>Sign in with Email & Password to complete checkout</span>
                <button
                  onClick={onOpenAuth}
                  className="font-bold underline text-amber-400 hover:text-amber-200"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Daraja M-Pesa STK Push Checkout Modal */}
      {isCheckingOut && selectedCartItem && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900/95 backdrop-blur-2xl text-stone-100 w-full max-w-md rounded-3xl shadow-2xl border border-white/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900/90 to-stone-900 p-5 text-white relative border-b border-white/10">
              <button
                onClick={() => setIsCheckingOut(false)}
                className="absolute top-4 right-4 p-1 text-white/70 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Safaricom Daraja API Integration
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white">Lipa Na M-Pesa Online STK Push</h3>
              <p className="text-xs text-stone-300 truncate">
                {selectedCartItem.accommodation.title}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {checkoutError && (
                <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium">
                  {checkoutError}
                </div>
              )}

              {stkStep === 'idle' && (
                <form onSubmit={handleSendStkPush} className="space-y-4">
                  {/* Installment Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      Choose Payment Installment Plan
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentOption('deposit_30')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentOption === 'deposit_30'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                            : 'bg-stone-950/60 border-white/10 text-stone-300 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-xs font-black">30% Deposit</span>
                        <span className="text-[11px] font-extrabold text-white">
                          KSh {Math.round(selectedCartItem.totalPrice * 0.3).toLocaleString()}
                        </span>
                        <span className="text-[9px] text-stone-400 block">Locks Room</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentOption('deposit_50')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentOption === 'deposit_50'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                            : 'bg-stone-950/60 border-white/10 text-stone-300 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-xs font-black">50% Half</span>
                        <span className="text-[11px] font-extrabold text-white">
                          KSh {Math.round(selectedCartItem.totalPrice * 0.5).toLocaleString()}
                        </span>
                        <span className="text-[9px] text-stone-400 block">Balance Later</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentOption('full')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentOption === 'full'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                            : 'bg-stone-950/60 border-white/10 text-stone-300 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-xs font-black">100% Full</span>
                        <span className="text-[11px] font-extrabold text-white">
                          KSh {selectedCartItem.totalPrice.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-emerald-400 block font-semibold">Fully Settled</span>
                      </button>
                    </div>
                  </div>

                  {/* Safaricom Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      M-Pesa Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="+254 7XX XXX XXX or 07XXXXXXXX"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-stone-950/70 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">
                      An automated Daraja prompt will appear on this handset to input PIN.
                    </p>
                  </div>

                  {/* Optional Group Trip Code */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center justify-between">
                      <span>Group Trip / Chama Code (Optional)</span>
                      <span className="text-[10px] text-stone-400">For group splits</span>
                    </label>
                    <div className="relative">
                      <Share2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={groupCode}
                        onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                        placeholder="e.g. DIANI-SQUAD-2026"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-stone-950/70 border border-white/15 rounded-xl text-white placeholder-stone-500 uppercase font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Breakdown Box */}
                  <div className="p-3 bg-stone-950/60 rounded-xl border border-white/10 text-xs space-y-1.5">
                    <div className="flex justify-between text-stone-400">
                      <span>Total Trip Package:</span>
                      <span className="text-stone-200">KSh {selectedCartItem.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-400 text-sm">
                      <span>Amount Due Now:</span>
                      <span>KSh {getDepositAmount(selectedCartItem).toLocaleString()}</span>
                    </div>
                    {paymentOption !== 'full' && (
                      <div className="flex justify-between text-stone-400 text-[11px]">
                        <span>Remaining Balance:</span>
                        <span>
                          KSh {(selectedCartItem.totalPrice - getDepositAmount(selectedCartItem)).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingStk}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Send M-Pesa STK Push Prompt</span>
                  </button>
                </form>
              )}

              {/* Step 2: Simulating Handset PIN Prompt */}
              {stkStep === 'simulating_pin' && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
                    <Smartphone className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white">
                      Check Your Handset ({mpesaPhone})
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Safaricom Daraja STK Push prompt dispatched. Enter your M-Pesa PIN to complete payment.
                    </p>
                  </div>

                  {/* Mobile Screen Mockup */}
                  <div className="bg-stone-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs text-left shadow-inner border border-white/10 space-y-2">
                    <p className="text-stone-500 text-[10px] uppercase">Safaricom Sim Toolkit</p>
                    <p className="text-white font-bold text-sm">
                      Do you want to pay KSh {getDepositAmount(selectedCartItem).toLocaleString()} to POASTAY SAFARIS KE (Till 982014)?
                    </p>
                    <div className="pt-2">
                      <label className="text-[10px] text-stone-400 block mb-1">Enter 4-Digit M-Pesa PIN:</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={mpesaPinInput}
                        onChange={(e) => setMpesaPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-stone-900 border border-white/20 text-white text-center tracking-widest text-lg py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStkStep('idle')}
                      className="w-1/2 py-2.5 border border-white/15 text-stone-300 hover:text-white font-bold text-xs rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPinAndPay}
                      disabled={isProcessingStk}
                      className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isProcessingStk ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Authorize Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Completed with Receipt & Alerts */}
              {stkStep === 'completed' && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-white">
                      Payment Received Successfully!
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">
                      Your booking and staycation stock units have been locked.
                    </p>
                  </div>

                  {/* Safaricom Receipt Box */}
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl text-left text-xs space-y-1 font-mono">
                    <div className="flex justify-between font-bold text-emerald-300">
                      <span>M-Pesa Receipt No:</span>
                      <span>{confirmedReceipt}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Paid to:</span>
                      <span>POASTAY SAFARIS & AIRBNB CHANNELS</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Amount:</span>
                      <span>KSh {getDepositAmount(selectedCartItem).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">COMPLETED (Code 0)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-950/60 border border-white/10 rounded-xl text-xs text-stone-300 text-left">
                    <p className="font-bold text-stone-100 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Automated Alerts Dispatched:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-stone-400">
                      <li>WhatsApp confirmation sent to {mpesaPhone}</li>
                      <li>SMS gateway voucher recorded</li>
                      <li>Coordinator assigned for your destination</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setIsCheckingOut(false);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
                  >
                    View in My Bookings & Passes
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
