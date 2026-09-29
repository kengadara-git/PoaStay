import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { Accommodation, AccommodationType, Booking, StaffDuty, TransportOption } from '../../types';
import {
  Briefcase,
  Package,
  CheckCircle2,
  Clock,
  Car,
  Plane,
  Train,
  Utensils,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Edit3,
  Phone,
  MessageSquare,
  AlertCircle,
  Plus,
  Key,
  ShieldCheck,
  Sparkles,
  Save,
  Trash2,
  RefreshCw,
  ExternalLink,
  Check,
  Send,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Star,
  X,
  Tag,
  BarChart3,
} from 'lucide-react';
import {
  simulateWhatsAppApiTrigger,
  buildWhatsAppMessage,
  WhatsAppAlertTriggerType,
} from '../../utils/whatsappHelper';
import { StaffAnalytics } from './StaffAnalytics';

export const StaffPortal: React.FC = () => {
  const {
    accommodations,
    updateAccommodation,
    addAccommodation,
    bookings,
    allocateBooking,
    duties,
    updateDutyStatus,
    staffList,
    sendNotification,
  } = usePoaStay();

  const [activeTab, setActiveTab] = useState<'allocations' | 'duties' | 'inventory' | 'analytics'>('allocations');

  // WhatsApp Alert Simulation & Resend State
  const [alertTypeByBooking, setAlertTypeByBooking] = useState<Record<string, WhatsAppAlertTriggerType>>({});
  const [resendingAlertBookingId, setResendingAlertBookingId] = useState<string | null>(null);
  const [alertFeedbackByBooking, setAlertFeedbackByBooking] = useState<
    Record<string, { messageId: string; type: WhatsAppAlertTriggerType; timestamp: string }>
  >({});
  const [expandedPreviewBookingId, setExpandedPreviewBookingId] = useState<string | null>(null);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState<boolean>(true);

  // Allocation modal state
  const [selectedBookingForAllocation, setSelectedBookingForAllocation] = useState<Booking | null>(null);
  const [allocatedRoom, setAllocatedRoom] = useState('');
  const [assignedDriverName, setAssignedDriverName] = useState('');
  const [assignedVehicleReg, setAssignedVehicleReg] = useState('');
  const [checkInTimeEdit, setCheckInTimeEdit] = useState('14:00');
  const [checkOutTimeEdit, setCheckOutTimeEdit] = useState('10:30');
  const [breakfastCheck, setBreakfastCheck] = useState(true);
  const [lunchCheck, setLunchCheck] = useState(false);
  const [dinnerCheck, setDinnerCheck] = useState(true);
  const [mealNotes, setMealNotes] = useState('');
  const [catererName, setCatererName] = useState('');

  // Inventory price & stock edit modal state
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editTotalUnits, setEditTotalUnits] = useState<number>(0);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editPhotoUrlInput, setEditPhotoUrlInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Add New Unit Modal state
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitType, setNewUnitType] = useState<AccommodationType>('villa');
  const [newUnitLocation, setNewUnitLocation] = useState('Diani Beachfront');
  const [newUnitCounty, setNewUnitCounty] = useState('Kwale County');
  const [newUnitPrice, setNewUnitPrice] = useState<number>(22500);
  const [newUnitTotalUnits, setNewUnitTotalUnits] = useState<number>(2);
  const [newUnitDescription, setNewUnitDescription] = useState('');
  const [newUnitHostName, setNewUnitHostName] = useState('Amina Mwangi');
  const [newUnitHostPhone, setNewUnitHostPhone] = useState('+254 711 234 567');
  const [newUnitPhotos, setNewUnitPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [addUnitSuccessMsg, setAddUnitSuccessMsg] = useState('');

  const KENYAN_PHOTO_PRESETS = [
    { label: 'Diani Beach Villa Pool', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Swahili Oceanfront Veranda', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Maasai Mara Safari Tent', url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Naivasha Rift Valley Chalet', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Lamu Courtyard Suite', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Watamu Coral Beach House', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Nairobi Skyline Penthouse', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Mount Kenya Highland Cabin', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80' },
  ];

  const handlePhotoFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'newUnit' | 'editUnit'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          if (target === 'newUnit') {
            setNewUnitPhotos((prev) => [...prev, dataUrl]);
          } else {
            setEditImages((prev) => [...prev, dataUrl]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddPhotoUrl = (target: 'newUnit' | 'editUnit') => {
    if (target === 'newUnit') {
      if (!newPhotoUrlInput.trim()) return;
      setNewUnitPhotos((prev) => [...prev, newPhotoUrlInput.trim()]);
      setNewPhotoUrlInput('');
    } else {
      if (!editPhotoUrlInput.trim()) return;
      setEditImages((prev) => [...prev, editPhotoUrlInput.trim()]);
      setEditPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = (index: number, target: 'newUnit' | 'editUnit') => {
    if (target === 'newUnit') {
      setNewUnitPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSetCoverPhoto = (index: number, target: 'newUnit' | 'editUnit') => {
    if (target === 'newUnit') {
      setNewUnitPhotos((prev) => {
        const item = prev[index];
        const rest = prev.filter((_, i) => i !== index);
        return [item, ...rest];
      });
    } else {
      setEditImages((prev) => {
        const item = prev[index];
        const rest = prev.filter((_, i) => i !== index);
        return [item, ...rest];
      });
    }
  };

  // Active bookings requiring staff action
  const activeBookings = bookings.filter((b) => b.bookingStatus !== 'cancelled');

  const handleOpenAllocationModal = (b: Booking) => {
    setSelectedBookingForAllocation(b);
    setAllocatedRoom(b.allocatedRoomNumber || 'Suite / Unit ');
    setAssignedDriverName(b.transportOption?.assignedDriver || 'Driver Omar Charo');
    setAssignedVehicleReg(b.transportOption?.vehicleReg || 'KDG 482B');
    setCheckInTimeEdit(b.checkInTime || '14:00');
    setCheckOutTimeEdit(b.checkOutTime || '10:30');
    setBreakfastCheck(b.mealArrangement.breakfast);
    setLunchCheck(b.mealArrangement.lunch);
    setDinnerCheck(b.mealArrangement.dinner);
    setMealNotes(b.mealArrangement.notes || '');
    setCatererName(b.mealArrangement.catererOrChef || '');
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForAllocation) return;

    let updatedTransport = selectedBookingForAllocation.transportOption;
    if (updatedTransport) {
      updatedTransport = {
        ...updatedTransport,
        assignedDriver: assignedDriverName,
        vehicleReg: assignedVehicleReg,
      };
    }

    const updatedMeals = {
      ...selectedBookingForAllocation.mealArrangement,
      breakfast: breakfastCheck,
      lunch: lunchCheck,
      dinner: dinnerCheck,
      notes: mealNotes,
      catererOrChef: catererName,
    };

    allocateBooking(
      selectedBookingForAllocation.id,
      selectedBookingForAllocation.assignedStaffId || 'staff-1',
      allocatedRoom,
      updatedTransport,
      updatedMeals
    );

    // Send WhatsApp notification directly to customer!
    const whatsappMsg = `Habari ${selectedBookingForAllocation.customerName}! 🔑 PoaStay Coordinator Update: Your room at ${selectedBookingForAllocation.accommodationTitle} has been allocated: ${allocatedRoom}. Check-in: ${checkInTimeEdit}, Check-out: ${checkOutTimeEdit}. Transport: ${
      assignedDriverName ? `${assignedDriverName} (${assignedVehicleReg})` : 'Self-Drive'
    }. Meals coordinated: ${[breakfastCheck && 'Breakfast', lunchCheck && 'Lunch', dinnerCheck && 'Dinner'].filter(Boolean).join(', ')}. Karibu sana!`;

    sendNotification(
      'whatsapp',
      selectedBookingForAllocation.customerName,
      selectedBookingForAllocation.customerPhone,
      whatsappMsg
    );

    setSelectedBookingForAllocation(null);
  };

  const handleTriggerWhatsAppAlert = (booking: Booking, overrideType?: WhatsAppAlertTriggerType) => {
    const chosenType: WhatsAppAlertTriggerType =
      overrideType ||
      alertTypeByBooking[booking.id] ||
      (booking.balanceDue > 0 ? 'payment_reminder' : 'booking_confirmation');

    setResendingAlertBookingId(booking.id);

    setTimeout(() => {
      const coordinator = staffList.find((s) => s.id === booking.assignedStaffId);
      const result = simulateWhatsAppApiTrigger(
        chosenType,
        booking,
        coordinator?.name || booking.assignedStaffName || 'Faith Chepkemoi',
        coordinator?.phone || '+254 712 345 601'
      );

      // Record in context notifications feed so it appears immediately in the notifications drawer
      sendNotification('whatsapp', result.recipientName, result.recipientPhone, result.message);

      setAlertFeedbackByBooking((prev) => ({
        ...prev,
        [booking.id]: {
          messageId: result.messageId,
          type: chosenType,
          timestamp: result.timestamp,
        },
      }));

      setResendingAlertBookingId(null);
    }, 600);
  };

  const handleOpenInventoryEdit = (acc: Accommodation) => {
    setEditingAccommodation(acc);
    setEditPrice(acc.pricePerNight);
    setEditTotalUnits(acc.totalUnits);
    setEditTitle(acc.title);
    setEditDescription(acc.description);
    setEditImages(acc.images && acc.images.length > 0 ? [...acc.images] : [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    ]);
    setEditPhotoUrlInput('');
    setSaveSuccessMsg('');
  };

  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccommodation) return;

    const validImages = editImages.filter((img) => img.trim().length > 0);
    const finalImages = validImages.length > 0
      ? validImages
      : ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'];

    const updated: Accommodation = {
      ...editingAccommodation,
      title: editTitle,
      description: editDescription,
      pricePerNight: Number(editPrice),
      totalUnits: Number(editTotalUnits),
      images: finalImages,
    };

    updateAccommodation(updated);
    setSaveSuccessMsg('Accommodation price & photos updated successfully!');
    setTimeout(() => {
      setEditingAccommodation(null);
      setSaveSuccessMsg('');
    }, 900);
  };

  const handleCreateNewUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;

    const validPhotos = newUnitPhotos.filter((img) => img.trim().length > 0);
    const finalImages = validPhotos.length > 0
      ? validPhotos
      : [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        ];

    addAccommodation({
      title: newUnitTitle,
      type: newUnitType,
      location: newUnitLocation,
      county: newUnitCounty,
      pricePerNight: Number(newUnitPrice),
      totalUnits: Number(newUnitTotalUnits),
      bookedUnits: 0,
      images: finalImages,
      description:
        newUnitDescription ||
        `${newUnitTitle} offers scenic Kenyan coastal or savannah relaxation with modern comforts, verified security, and dedicated host support.`,
      hostName: newUnitHostName || 'Amina Mwangi',
      hostPhone: newUnitHostPhone || '+254 711 234 567',
      amenities: [
        'High-Speed Wi-Fi',
        'Swimming Pool',
        'Private Chef on Request',
        'Solar Power Backup',
        'Air Conditioning',
        '24/7 Security & CCTV',
      ],
      checkInTime: '14:00',
      checkOutTime: '10:30',
      travelEstimate: {
        from: 'Nairobi Westlands',
        duration: '4h 30m',
        distance: '450 km',
        routeHighlights: 'Scenic Highway & Wildlife Corridor',
      },
      nearbyRestaurants: [
        {
          id: 'rest-' + Date.now(),
          name: 'Swahili Coast Flavours',
          location: newUnitLocation,
          cuisine: 'Swahili & Seafood',
          distance: '0.8 km',
          priceRange: 'KSh 1,200 - 3,500',
          rating: 4.8,
          image:
            'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          phone: '+254 722 000 111',
          signatureDishes: [
            {
              name: 'Coconut Fish Curry & Yellow Rice',
              priceKsh: 1800,
              description: 'Fresh catch cooked in thick Swahili coconut cream and turmeric',
            },
          ],
        },
      ],
      featured: true,
    });

    setAddUnitSuccessMsg(`Unit "${newUnitTitle}" added successfully with ${finalImages.length} photos!`);
    setTimeout(() => {
      setIsAddUnitModalOpen(false);
      setAddUnitSuccessMsg('');
      // Reset form
      setNewUnitTitle('');
      setNewUnitDescription('');
      setNewUnitPrice(22500);
      setNewUnitTotalUnits(2);
      setNewUnitPhotos([
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      ]);
    }, 900);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Staff Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Staff Field Operations
            </span>
            <span className="text-xs text-stone-400">Kenya Local Channel Coordination</span>
          </div>
          <h1 className="text-2xl font-black">Staff Accommodation & Trip Management Portal</h1>
          <p className="text-xs text-stone-300 max-w-xl mt-1">
            Allocate rooms to paying customers, assign transport drivers, manage check-in schedules, coordinate private Swahili/Kenyan meal plans, and adjust property prices and stock.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white/10 p-1 rounded-2xl border border-white/10 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('allocations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'allocations' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            Guest Allocations ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('duties')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'duties' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            My Duties ({duties.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory Management ({accommodations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GUEST ALLOCATIONS (ROOM, TRANSPORT, MEALS) */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 shadow-xl text-stone-100">
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Customer Allocations & Scheduled Trips
              </h2>
              <p className="text-xs text-stone-300">
                Assign room numbers, transport vehicles, and meal arrangements to customers who made M-Pesa payments.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setAutoDispatchEnabled((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  autoDispatchEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-white/10 text-stone-300 border-white/10'
                }`}
                title="Toggle automated WhatsApp API dispatch triggers"
              >
                {autoDispatchEnabled ? (
                  <ToggleRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-stone-400" />
                )}
                <span>Auto-Dispatch WhatsApp API: {autoDispatchEnabled ? 'Active' : 'Paused'}</span>
              </button>

              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30">
                {activeBookings.length} Active Bookings
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {activeBookings.map((b) => {
              const isPaid = b.paymentStatus === 'fully_paid' || b.paymentStatus === 'deposit_paid';
              const currentAlertChoice: WhatsAppAlertTriggerType =
                alertTypeByBooking[b.id] ||
                (b.balanceDue > 0 ? 'payment_reminder' : 'booking_confirmation');
              const isResending = resendingAlertBookingId === b.id;
              const feedback = alertFeedbackByBooking[b.id];
              const isExpanded = expandedPreviewBookingId === b.id;

              return (
                <div
                  key={b.id}
                  className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 p-5 sm:p-6 shadow-xl hover:border-emerald-400/40 transition-all space-y-4 text-stone-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-white/10 text-white px-2.5 py-1 rounded-lg border border-white/10">
                        {b.bookingRef}
                      </span>
                      <h3 className="text-sm font-black text-white truncate">
                        {b.customerName} ({b.customerPhone})
                      </h3>
                      <span className="text-xs text-stone-400">• {b.customerEmail}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          b.paymentStatus === 'fully_paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        }`}
                      >
                        M-Pesa: {b.paymentStatus.replace('_', ' ').toUpperCase()} (Paid KSh{' '}
                        {b.amountPaid.toLocaleString()})
                      </span>
                      <button
                        onClick={() => handleOpenAllocationModal(b)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-md border border-emerald-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Allocate Room & Transport</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    {/* Accommodation info */}
                    <div className="p-3 bg-stone-950/60 rounded-2xl border border-white/10 space-y-1">
                      <p className="font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {b.accommodationTitle}
                      </p>
                      <p className="text-stone-300">{b.accommodationLocation}</p>
                      <p className="text-emerald-400 font-bold">
                        Allocated Room: {b.allocatedRoomNumber || '⚠️ Needs allocation'}
                      </p>
                      <p className="text-stone-400 text-[11px]">
                        Check-in: {b.checkInDate} ({b.checkInTime}) | Out: {b.checkOutDate} ({b.checkOutTime})
                      </p>
                    </div>

                    {/* Transport arrangement */}
                    <div className="p-3 bg-stone-950/60 rounded-2xl border border-white/10 space-y-1">
                      <p className="font-bold text-white flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        Transport: {b.transportOption ? b.transportOption.name : 'Client Self-Drive'}
                      </p>
                      {b.transportOption && (
                        <>
                          <p className="text-stone-300">
                            Driver: <strong className="text-white">{b.transportOption.assignedDriver || 'Pending'}</strong>
                          </p>
                          <p className="text-stone-300">
                            Vehicle Reg: <strong className="text-white">{b.transportOption.vehicleReg || 'Pending'}</strong>
                          </p>
                          <p className="text-stone-400 text-[11px]">
                            Route: {b.transportOption.departurePoint}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Meal coordination */}
                    <div className="p-3 bg-stone-950/60 rounded-2xl border border-white/10 space-y-1">
                      <p className="font-bold text-white flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-stone-300" />
                        Meal Arrangement
                      </p>
                      <p className="text-stone-300">
                        Meals:{' '}
                        {[
                          b.mealArrangement.breakfast && 'Breakfast',
                          b.mealArrangement.lunch && 'Lunch',
                          b.mealArrangement.dinner && 'Dinner',
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Self-catering'}
                      </p>
                      <p className="text-stone-400 text-[11px] truncate">
                        Chef/Caterer: {b.mealArrangement.catererOrChef || 'Onsite Chef'}
                      </p>
                      <p className="text-stone-400 text-[11px] truncate">
                        Diet: {b.mealArrangement.notes || 'None noted'}
                      </p>
                    </div>
                  </div>

                  {/* Automated WhatsApp API Alert Trigger & Manual Resend Control */}
                  <div className="pt-3 border-t border-white/10 space-y-2.5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-stone-950/60 p-3.5 rounded-2xl border border-white/10">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            WhatsApp API Alert System
                          </span>
                          {feedback && (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-400/30">
                              <Check className="w-3 h-3 text-emerald-400" />
                              Dispatched {feedback.type === 'booking_confirmation' ? 'Confirmation' : 'Payment Reminder'} ({feedback.messageId.substring(0, 15)}...)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400">
                          Guest: <span className="font-semibold text-stone-200">{b.customerName}</span> ({b.customerPhone}) • Coordinator: {b.assignedStaffName || 'Faith Chepkemoi'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Toggle Alert Type: Booking Confirmation vs Payment Reminder */}
                        <div className="inline-flex bg-stone-900 p-0.5 rounded-xl border border-white/15 text-[11px] font-bold shadow-2xs">
                          <button
                            type="button"
                            onClick={() =>
                              setAlertTypeByBooking((prev) => ({
                                ...prev,
                                [b.id]: 'booking_confirmation',
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              currentAlertChoice === 'booking_confirmation'
                                ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                                : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            Booking Confirmation
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAlertTypeByBooking((prev) => ({
                                ...prev,
                                [b.id]: 'payment_reminder',
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                              currentAlertChoice === 'payment_reminder'
                                ? 'bg-amber-600 text-white shadow-2xs font-extrabold'
                                : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            <span>Payment Reminder</span>
                            {b.balanceDue > 0 && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  currentAlertChoice === 'payment_reminder'
                                    ? 'bg-white'
                                    : 'bg-amber-400 animate-ping'
                                }`}
                              />
                            )}
                          </button>
                        </div>

                        {/* Manual Resend Trigger Button */}
                        <button
                          type="button"
                          onClick={() => handleTriggerWhatsAppAlert(b, currentAlertChoice)}
                          disabled={isResending}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs border border-white/15 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 text-emerald-400 ${isResending ? 'animate-spin' : ''}`}
                          />
                          <span>{isResending ? 'Triggering API...' : 'Resend Alert'}</span>
                        </button>

                        {/* Open directly in WhatsApp Web / App */}
                        <a
                          href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            buildWhatsAppMessage(currentAlertChoice, b, b.assignedStaffName)
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open formatted alert directly in WhatsApp"
                          className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-400/30 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>WhatsApp Web</span>
                        </a>

                        {/* View Template Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPreviewBookingId(isExpanded ? null : b.id)
                          }
                          className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title={isExpanded ? 'Hide message preview' : 'View formatted message template'}
                        >
                          {isExpanded ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable WhatsApp Message Preview */}
                    {isExpanded && (
                      <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-white/15 text-stone-200 text-xs font-sans space-y-1.5 animate-in fade-in-50 duration-150">
                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                          <span>
                            Simulated WhatsApp Business API Payload (
                            {currentAlertChoice === 'booking_confirmation'
                              ? 'Booking Confirmation'
                              : 'Payment Reminder'}
                            )
                          </span>
                          <span>Format: Text / Kenyan Format</span>
                        </div>
                        <div className="bg-stone-900 p-3 rounded-xl shadow-xs border border-white/10 whitespace-pre-wrap leading-relaxed text-stone-100 font-sans">
                          {buildWhatsAppMessage(currentAlertChoice, b, b.assignedStaffName)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF DUTIES & RESPONSIBILITIES */}
      {activeTab === 'duties' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 flex justify-between items-center text-stone-100 shadow-xl">
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Operational Duties Allocated to Field Staff
              </h2>
              <p className="text-xs text-stone-300">
                Duties assigned by Managers for airport pick-up, room inspections, and guest coordination.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30">
              {duties.length} Total Duties
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {duties.map((duty) => (
              <div
                key={duty.id}
                className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-3 text-stone-100 hover:border-emerald-400/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        duty.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          : duty.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                          : 'bg-white/10 text-stone-300 border-white/10'
                      }`}
                    >
                      {duty.priority} priority
                    </span>
                    <h3 className="text-sm font-black text-white mt-1">{duty.title}</h3>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl capitalize border ${
                      duty.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : duty.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        : 'bg-white/10 text-stone-300 border-white/10'
                    }`}
                  >
                    {duty.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">{duty.description}</p>

                <div className="text-[11px] text-stone-400 space-y-0.5 pt-2 border-t border-white/10">
                  <p>
                    <strong className="text-stone-200">Assigned To:</strong> {duty.assignedToStaffName}
                  </p>
                  <p>
                    <strong className="text-stone-200">Assigned By Manager:</strong> {duty.assignedByManagerName}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {duty.dueDate}
                  </p>
                  {duty.bookingRef && (
                    <p>
                      <strong>Booking Ref:</strong> {duty.bookingRef}
                    </p>
                  )}
                </div>

                {/* Duty Action Status Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => updateDutyStatus(duty.id, 'in_progress')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                      duty.status === 'in_progress'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                        : 'bg-white/10 text-stone-300 border-white/15 hover:bg-white/20'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateDutyStatus(duty.id, 'completed')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                      duty.status === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-white/10 text-stone-300 border-white/15 hover:bg-white/20'
                    }`}
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY, PRICE & STOCK EDITOR */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-stone-100 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-400/30">
                  Channel Manager
                </span>
                <span className="text-stone-400 text-xs">•</span>
                <span className="text-xs font-semibold text-stone-300">
                  {accommodations.length} Units Active
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white">
                Inventory Management
              </h2>
              <p className="text-xs text-stone-300">
                Upload new unit images, edit pricing in Kenyan Shillings (KSh), and update stock counts for accommodations in real time.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsAddUnitModalOpen(true);
                  setAddUnitSuccessMsg('');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Accommodation Unit</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accommodations.map((acc) => {
              const remaining = Math.max(0, acc.totalUnits - (acc.bookedUnits || 0));
              const isOut = remaining <= 0;
              const photoCount = acc.images?.length || 0;

              return (
                <div
                  key={acc.id}
                  className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 overflow-hidden shadow-xl space-y-3 p-4 flex flex-col justify-between hover:border-emerald-400/40 transition-all text-stone-100"
                >
                  <div className="space-y-2">
                    <div className="relative h-40 rounded-2xl overflow-hidden group">
                      <img
                        src={acc.images[0] || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
                        alt={acc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        {isOut ? (
                          <span className="bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-red-500/30">
                            SOLD OUT
                          </span>
                        ) : (
                          <span className="bg-stone-950/80 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-emerald-400/30">
                            In Stock: {remaining} left
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 right-2 bg-stone-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10">
                        <ImageIcon className="w-3 h-3 text-emerald-400" />
                        <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}</span>
                      </div>
                    </div>

                    {/* Mini photo thumbnails strip */}
                    {acc.images && acc.images.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {acc.images.slice(0, 4).map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                        ))}
                        {acc.images.length > 4 && (
                          <span className="text-[10px] text-stone-300 font-bold px-1.5 py-1 bg-white/10 rounded-lg border border-white/10">
                            +{acc.images.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                          {acc.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                          {acc.county}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white line-clamp-1">{acc.title}</h4>
                      <p className="text-[11px] text-stone-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{acc.location}</span>
                      </p>
                    </div>

                    <div className="p-3 bg-stone-950/60 rounded-2xl text-xs space-y-1.5 border border-white/10">
                      {/* Nightly Price & Quick Adjustment */}
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400 font-medium">Nightly Rate:</span>
                        <span className="font-black text-emerald-400 text-sm font-mono">
                          KSh {acc.pricePerNight.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                        <span className="text-stone-400">Edit Price:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newP = Math.max(1000, acc.pricePerNight - 1000);
                              updateAccommodation({ ...acc, pricePerNight: newP });
                            }}
                            className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded font-bold text-stone-200 cursor-pointer"
                            title="Decrease rate by KSh 1,000"
                          >
                            -1k
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newP = acc.pricePerNight + 1000;
                              updateAccommodation({ ...acc, pricePerNight: newP });
                            }}
                            className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded font-bold text-stone-200 cursor-pointer"
                            title="Increase rate by KSh 1,000"
                          >
                            +1k
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newP = acc.pricePerNight + 5000;
                              updateAccommodation({ ...acc, pricePerNight: newP });
                            }}
                            className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded font-bold text-stone-200 cursor-pointer"
                            title="Increase rate by KSh 5,000"
                          >
                            +5k
                          </button>
                        </div>
                      </div>

                      {/* Stock Counts with Stepper */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <span className="text-stone-400">Stock Units:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const newStock = Math.max(acc.bookedUnits || 0, acc.totalUnits - 1);
                              updateAccommodation({ ...acc, totalUnits: newStock });
                            }}
                            disabled={acc.totalUnits <= (acc.bookedUnits || 0)}
                            className="w-5 h-5 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded font-bold text-stone-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Decrease total stock"
                          >
                            -
                          </button>
                          <span className="font-bold text-white min-w-[20px] text-center">
                            {acc.totalUnits}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateAccommodation({ ...acc, totalUnits: acc.totalUnits + 1 });
                            }}
                            className="w-5 h-5 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded font-bold text-stone-200 cursor-pointer"
                            title="Increase total stock"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between font-bold pt-1 border-t border-white/10">
                        <span className="text-stone-300">Available Stock:</span>
                        <span className={isOut ? 'text-red-400 font-extrabold' : 'text-emerald-400'}>
                          {remaining} {remaining === 1 ? 'Unit' : 'Units'} (Booked: {acc.bookedUnits || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenInventoryEdit(acc)}
                      className="py-2 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-emerald-400" />
                      <span>Photos ({photoCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenInventoryEdit(acc)}
                      className="py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md border border-emerald-400/30"
                    >
                      <Edit3 className="w-3 h-3 text-white" />
                      <span>Edit All</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS (OCCUPANCY, STAY DURATION & REVENUE) */}
      {activeTab === 'analytics' && (
        <StaffAnalytics
          accommodations={accommodations}
          bookings={bookings}
          onNavigateToInventory={(accId) => {
            setActiveTab('inventory');
            if (accId) {
              const target = accommodations.find((a) => a.id === accId);
              if (target) {
                handleOpenInventoryEdit(target);
              }
            }
          }}
        />
      )}

      {/* ALLOCATION MODAL (ROOM, TRANSPORT, MEALS) */}
      {selectedBookingForAllocation && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 to-stone-900 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-black">Staff Allocation Center</h3>
                <p className="text-xs text-stone-300">
                  Ref: {selectedBookingForAllocation.bookingRef} • {selectedBookingForAllocation.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedBookingForAllocation(null)}
                className="p-1 text-white/70 hover:text-white rounded-full bg-black/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAllocation} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Room Assignment */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Assigned Room / Cottage / Suite Number
                </label>
                <input
                  type="text"
                  value={allocatedRoom}
                  onChange={(e) => setAllocatedRoom(e.target.value)}
                  placeholder="e.g. Master Palm Suite 01, Beach Cottage 04"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              {/* Transportation Assignment */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-600" />
                  <span>Transportation & Driver Logistics</span>
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Assigned Driver / Guide Name
                    </label>
                    <input
                      type="text"
                      value={assignedDriverName}
                      onChange={(e) => setAssignedDriverName(e.target.value)}
                      placeholder="e.g. Driver Omar Charo"
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Vehicle Registration Number
                    </label>
                    <input
                      type="text"
                      value={assignedVehicleReg}
                      onChange={(e) => setAssignedVehicleReg(e.target.value)}
                      placeholder="e.g. KDG 482B or 5Y-SLB"
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Check-in and Check-out Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Scheduled Check-in Time
                  </label>
                  <input
                    type="time"
                    value={checkInTimeEdit}
                    onChange={(e) => setCheckInTimeEdit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Scheduled Check-out Time
                  </label>
                  <input
                    type="time"
                    value={checkOutTimeEdit}
                    onChange={(e) => setCheckOutTimeEdit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* Meal Arrangements */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  <span>Meal Coordination & Private Chef</span>
                </h4>
                <div className="flex gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breakfastCheck}
                      onChange={(e) => setBreakfastCheck(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span>Breakfast</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lunchCheck}
                      onChange={(e) => setLunchCheck(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span>Lunch</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dinnerCheck}
                      onChange={(e) => setDinnerCheck(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span>Dinner / Supper</span>
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Assigned Caterer / Private Chef
                    </label>
                    <input
                      type="text"
                      value={catererName}
                      onChange={(e) => setCatererName(e.target.value)}
                      placeholder="e.g. Chef Hamisi Bakari"
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Special Dietary / Halal / Seafood Notes
                    </label>
                    <input
                      type="text"
                      value={mealNotes}
                      onChange={(e) => setMealNotes(e.target.value)}
                      placeholder="e.g. Fresh Swahili crab curry, Halal"
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Allocation & Trigger WhatsApp Update to Guest</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW UNIT MODAL */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 to-stone-900 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-400/30">
                    Channel Inventory
                  </span>
                </div>
                <h3 className="text-base font-black">Add New Accommodation Unit</h3>
                <p className="text-xs text-stone-300">
                  List a new Airbnb, BnB, Safari Camp, or Villa with photos and pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUnitModalOpen(false)}
                className="p-1 text-white/70 hover:text-white rounded-full bg-black/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUnit} className="p-5 overflow-y-auto space-y-4 flex-1">
              {addUnitSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{addUnitSuccessMsg}</span>
                </div>
              )}

              {/* Title & Type */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Property Unit Title *
                  </label>
                  <input
                    type="text"
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    placeholder="e.g. Watamu Coral Beach Villa"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={newUnitType}
                    onChange={(e) => setNewUnitType(e.target.value as AccommodationType)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="villa">Luxury Villa</option>
                    <option value="airbnb">Airbnb Apartment</option>
                    <option value="bnb">Bed & Breakfast (BnB)</option>
                    <option value="safari_camp">Safari Camp</option>
                    <option value="staycation">Staycation Cottage</option>
                    <option value="hotel">Boutique Hotel</option>
                  </select>
                </div>
              </div>

              {/* Location & County */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Location / Landmark *
                  </label>
                  <input
                    type="text"
                    value={newUnitLocation}
                    onChange={(e) => setNewUnitLocation(e.target.value)}
                    placeholder="e.g. Diani Beachfront, South Coast"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Kenyan County *
                  </label>
                  <input
                    type="text"
                    value={newUnitCounty}
                    onChange={(e) => setNewUnitCounty(e.target.value)}
                    placeholder="e.g. Kwale County, Kilifi County, Narok County"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Pricing & Stock Units */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                    Pricing & Channel Stock
                  </span>
                  <span className="text-[11px] text-emerald-800 font-semibold">
                    Instant M-Pesa Sync
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Price Per Night (KSh) *
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      value={newUnitPrice}
                      onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-black text-emerald-800 bg-white"
                      required
                    />
                    <div className="flex items-center gap-1 mt-1.5">
                      {[15000, 22500, 35000, 50000].map((presetPrice) => (
                        <button
                          key={presetPrice}
                          type="button"
                          onClick={() => setNewUnitPrice(presetPrice)}
                          className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[10px] font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          {presetPrice / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Total Units Available *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newUnitTotalUnits}
                      onChange={(e) => setNewUnitTotalUnits(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bold bg-white"
                      required
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Number of identical cottages/villas in stock
                    </span>
                  </div>
                </div>
              </div>

              {/* Host Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Host / Manager Name
                  </label>
                  <input
                    type="text"
                    value={newUnitHostName}
                    onChange={(e) => setNewUnitHostName(e.target.value)}
                    placeholder="e.g. Amina Mwangi"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Host Phone (Kenyan)
                  </label>
                  <input
                    type="text"
                    value={newUnitHostPhone}
                    onChange={(e) => setNewUnitHostPhone(e.target.value)}
                    placeholder="e.g. +254 711 234 567"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              {/* PHOTO STUDIO: MULTI-PHOTO UPLOAD & MANAGEMENT */}
              <div className="space-y-2.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-black text-stone-900">
                      Unit Photo Gallery ({newUnitPhotos.length} Added)
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    First photo is the primary listing cover
                  </span>
                </div>

                {/* Upload from device & Add URL controls */}
                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-emerald-400 rounded-xl hover:bg-emerald-50/50 cursor-pointer transition-colors text-xs font-bold text-emerald-900">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Upload Photos from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoFileUpload(e, 'newUnit')}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={newPhotoUrlInput}
                      onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                      placeholder="Paste Image URL..."
                      className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPhotoUrl('newUnit')}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Kenyan Presets */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Quick Add Authentic Kenyan Presets:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {KENYAN_PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setNewUnitPhotos((prev) => [...prev, preset.url])}
                        className="px-2 py-0.5 bg-white hover:bg-stone-200 border border-stone-200 rounded-md text-[10px] font-semibold text-stone-700 cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Photo Thumbnails */}
                {newUnitPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 border-t border-stone-200/70">
                    {newUnitPhotos.map((photoUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-stone-200 bg-white aspect-4/3"
                      >
                        <img
                          src={photoUrl}
                          alt={`Unit photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cover
                          </span>
                        )}

                        <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(idx, 'newUnit')}
                              className="px-1.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer"
                              title="Set as Cover Photo"
                            >
                              Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx, 'newUnit')}
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Unit Description
                </label>
                <textarea
                  rows={3}
                  value={newUnitDescription}
                  onChange={(e) => setNewUnitDescription(e.target.value)}
                  placeholder="Describe the unit highlights, proximity to the beach/savannah, amenities, and guest experience..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Unit to PoaStay Live Catalog</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ENHANCED INVENTORY PRICE, STOCK & PHOTOS EDIT MODAL */}
      {editingAccommodation && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 to-stone-900 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-400/30">
                  Rate & Media Studio
                </span>
                <h3 className="text-base font-black">Edit Price, Photos & Stock</h3>
                <p className="text-xs text-stone-300 truncate max-w-sm">
                  {editingAccommodation.title} ({editingAccommodation.location})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccommodation(null)}
                className="p-1 text-white/70 hover:text-white rounded-full bg-black/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="p-5 overflow-y-auto space-y-4 flex-1">
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Accommodation Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bold"
                  required
                />
              </div>

              {/* Price & Stock */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Price Per Night (KSh) *
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-black text-emerald-800 bg-white"
                      required
                    />
                    <div className="flex items-center gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setEditPrice((prev) => Math.max(1000, prev - 1000))}
                        className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[10px] font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        -1,000
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditPrice((prev) => prev + 1000)}
                        className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[10px] font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        +1,000
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditPrice((prev) => prev + 5000)}
                        className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[10px] font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        +5,000
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Total Units in Stock *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editTotalUnits}
                      onChange={(e) => setEditTotalUnits(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bold bg-white"
                      required
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Currently Booked: {editingAccommodation.bookedUnits || 0} | Remaining:{' '}
                      <strong className="text-emerald-800">
                        {Math.max(0, editTotalUnits - (editingAccommodation.bookedUnits || 0))}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* PHOTO STUDIO: ADD & EDIT PHOTOS */}
              <div className="space-y-2.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-black text-stone-900">
                      Unit Photos ({editImages.length} Photos)
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Add new photos, set cover photo, or remove
                  </span>
                </div>

                {/* Device Upload & URL inputs */}
                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-emerald-400 rounded-xl hover:bg-emerald-50/50 cursor-pointer transition-colors text-xs font-bold text-emerald-900">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Upload Photos from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoFileUpload(e, 'editUnit')}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={editPhotoUrlInput}
                      onChange={(e) => setEditPhotoUrlInput(e.target.value)}
                      placeholder="Paste Image URL..."
                      className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPhotoUrl('editUnit')}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Quick Add Authentic Kenyan Presets:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {KENYAN_PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setEditImages((prev) => [...prev, preset.url])}
                        className="px-2 py-0.5 bg-white hover:bg-stone-200 border border-stone-200 rounded-md text-[10px] font-semibold text-stone-700 cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnails */}
                {editImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 border-t border-stone-200/70">
                    {editImages.map((photoUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-stone-200 bg-white aspect-4/3"
                      >
                        <img
                          src={photoUrl}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cover
                          </span>
                        )}

                        <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(idx, 'editUnit')}
                              className="px-1.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer"
                              title="Set as Cover Photo"
                            >
                              Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx, 'editUnit')}
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Property Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes & Sync Channel Stock</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
