import React from 'react';
import { Booking } from '../../types';
import {
  CheckCircle2,
  Clock,
  Smartphone,
  Home,
  Car,
  Plane,
  Train,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface BookingProgressProps {
  booking: Booking;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export interface ProgressStage {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: React.ReactNode;
  detail: string;
  subtext: string;
  badge: string;
}

/**
 * Reusable BookingProgress visual tracker component:
 * Deposit Paid -> Accommodation Confirmed -> Transport Assigned -> Trip Ready
 */
export const BookingProgress: React.FC<BookingProgressProps> = ({
  booking,
  showDetails = true,
  compact = false,
  className = '',
}) => {
  // 1. Stage 1: Deposit Paid
  const isDepositPaid =
    booking.amountPaid > 0 ||
    booking.paymentStatus === 'deposit_paid' ||
    booking.paymentStatus === 'fully_paid';

  // 2. Stage 2: Accommodation Confirmed
  const hasSpecificRoom = Boolean(
    booking.allocatedRoomNumber &&
      booking.allocatedRoomNumber.trim().length > 0 &&
      !booking.allocatedRoomNumber.toLowerCase().includes('assignment in progress') &&
      !booking.allocatedRoomNumber.toLowerCase().includes('in progress')
  );

  const isAccomConfirmed =
    hasSpecificRoom ||
    booking.bookingStatus === 'allocated' ||
    booking.bookingStatus === 'checked_in' ||
    booking.bookingStatus === 'completed';

  // 3. Stage 3: Transport Assigned
  const isSelfDrive = !booking.transportOption;
  const hasVehicleReg = Boolean(
    booking.transportOption?.vehicleReg &&
      !booking.transportOption.vehicleReg.toLowerCase().includes('pending')
  );
  const hasDriver = Boolean(
    booking.transportOption?.assignedDriver &&
      !booking.transportOption.assignedDriver.toLowerCase().includes('prior to travel')
  );

  const isTransportAssigned =
    isSelfDrive ||
    hasVehicleReg ||
    hasDriver ||
    booking.bookingStatus === 'allocated' ||
    booking.bookingStatus === 'checked_in' ||
    booking.bookingStatus === 'completed';

  // 4. Stage 4: Trip Ready
  const isTripReady = isDepositPaid && isAccomConfirmed && isTransportAssigned;

  // Determine sequential status: 'completed' | 'current' | 'upcoming'
  const getStatus = (
    isDone: boolean,
    prevDone: boolean,
    nextDone: boolean
  ): 'completed' | 'current' | 'upcoming' => {
    if (isDone) return 'completed';
    if (prevDone && !nextDone) return 'current';
    return 'upcoming';
  };

  const stage1Status: 'completed' | 'current' | 'upcoming' = isDepositPaid
    ? 'completed'
    : 'current';

  const stage2Status: 'completed' | 'current' | 'upcoming' = isAccomConfirmed
    ? 'completed'
    : stage1Status === 'completed'
    ? 'current'
    : 'upcoming';

  const stage3Status: 'completed' | 'current' | 'upcoming' = isTransportAssigned
    ? 'completed'
    : stage2Status === 'completed'
    ? 'current'
    : 'upcoming';

  const stage4Status: 'completed' | 'current' | 'upcoming' = isTripReady
    ? 'completed'
    : stage3Status === 'completed'
    ? 'current'
    : 'upcoming';

  const stages: ProgressStage[] = [
    {
      id: 'deposit',
      label: 'Deposit Paid',
      status: stage1Status,
      icon: <Smartphone className="w-4 h-4" />,
      detail: isDepositPaid
        ? `KSh ${booking.amountPaid.toLocaleString()} paid via M-Pesa`
        : 'Awaiting M-Pesa STK push',
      subtext: isDepositPaid ? 'Safaricom Daraja Verified' : '30% Deposit Pending',
      badge: isDepositPaid ? 'Deposit Secured' : 'Pending',
    },
    {
      id: 'accommodation',
      label: 'Accommodation Confirmed',
      status: stage2Status,
      icon: <Home className="w-4 h-4" />,
      detail: hasSpecificRoom
        ? booking.allocatedRoomNumber!
        : isAccomConfirmed
        ? 'Room unit allocated'
        : 'PoaStay coordinator assigning unit',
      subtext: isAccomConfirmed ? 'Unit Locked' : 'Inventory Reserved',
      badge: isAccomConfirmed ? 'Unit Confirmed' : 'In Progress',
    },
    {
      id: 'transport',
      label: 'Transport Assigned',
      status: stage3Status,
      icon: isSelfDrive ? (
        <Car className="w-4 h-4" />
      ) : booking.transportOption?.mode === 'air' ? (
        <Plane className="w-4 h-4" />
      ) : booking.transportOption?.mode === 'train' ? (
        <Train className="w-4 h-4" />
      ) : (
        <Car className="w-4 h-4" />
      ),
      detail: isSelfDrive
        ? 'Self-Drive (Reserved parking space)'
        : booking.transportOption?.assignedDriver && hasDriver
        ? `${booking.transportOption.assignedDriver} • ${
            booking.transportOption.vehicleReg || 'Fleet Unit'
          }`
        : isTransportAssigned
        ? booking.transportOption?.name || 'Transport confirmed'
        : 'Fleet & driver dispatch in progress',
      subtext: isSelfDrive
        ? 'On-premise parking verified'
        : booking.transportOption?.schedule || 'Travel logistics coordinated',
      badge: isTransportAssigned ? (isSelfDrive ? 'Self-Drive' : 'Driver Assigned') : 'Pending',
    },
    {
      id: 'trip_ready',
      label: 'Trip Ready',
      status: stage4Status,
      icon: <Sparkles className="w-4 h-4" />,
      detail: isTripReady
        ? `Check-in ready on ${booking.checkInDate} (${booking.checkInTime})`
        : 'Finalizing arrival check-in pass',
      subtext: isTripReady ? 'Digital Pass Active' : 'Awaiting check-in window',
      badge: isTripReady ? 'Pass Ready' : 'Finalizing',
    },
  ];

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  return (
    <div
      className={`bg-stone-50/90 rounded-2xl border border-stone-200 p-4 transition-all shadow-2xs ${className}`}
    >
      {/* Header bar with tracker title, stages count and status pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
              Booking Progress Tracker
            </h4>
            <p className="text-[11px] text-stone-500">
              Stage {completedCount} of 4 Completed ({progressPercent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              isTripReady
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {isTripReady ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trip Ready</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>Fulfillment Active</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Visual Step-by-Step Connector Track (Deposit Paid -> Accommodation Confirmed -> Transport Assigned -> Trip Ready) */}
      <div className="relative pt-4 pb-1">
        {/* Connecting Line between steps (Desktop / Tablet) */}
        <div className="hidden lg:block absolute top-[34px] left-[10%] right-[10%] h-1 bg-stone-200 -z-0 rounded-full">
          <div
            className="h-full bg-emerald-600 transition-all duration-700 ease-in-out rounded-full"
            style={{
              width:
                completedCount === 4
                  ? '100%'
                  : completedCount === 3
                  ? '75%'
                  : completedCount === 2
                  ? '50%'
                  : completedCount === 1
                  ? '25%'
                  : '0%',
            }}
          />
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isUpcoming = stage.status === 'upcoming';

            return (
              <div
                key={stage.id}
                className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/80 border-emerald-300/80 shadow-2xs'
                    : isCurrent
                    ? 'bg-white border-amber-400 ring-2 ring-amber-400/40 shadow-xs'
                    : 'bg-white/80 border-stone-200 opacity-75'
                }`}
              >
                {/* Step indicator node and label */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 transition-transform ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs scale-100'
                          : isCurrent
                          ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-black truncate leading-tight ${
                        isCompleted
                          ? 'text-emerald-950'
                          : isCurrent
                          ? 'text-amber-950'
                          : 'text-stone-600'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-200/90 text-emerald-900'
                        : isCurrent
                        ? 'bg-amber-200 text-amber-950 font-bold'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {stage.badge}
                  </span>
                </div>

                {/* Subtext and details */}
                {showDetails && (
                  <div className="space-y-0.5 pl-9 text-[11px] leading-tight">
                    <p className="font-semibold text-stone-800 line-clamp-1">{stage.detail}</p>
                    <p className="text-stone-500 text-[10px] line-clamp-1">{stage.subtext}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookingProgress;
