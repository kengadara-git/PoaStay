import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Accommodation,
  Booking,
  CartItem,
  ManagerMember,
  MealArrangement,
  MpesaTransaction,
  NotificationMessage,
  PortalRole,
  PropertyReview,
  StaffDuty,
  StaffMember,
  TransportOption,
  UserAccount,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_ACCOMMODATIONS,
  INITIAL_BOOKINGS,
  INITIAL_MANAGERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROPERTY_REVIEWS,
  INITIAL_STAFF,
  INITIAL_STAFF_DUTIES,
  KENYAN_TRANSPORT_OPTIONS,
} from '../data/mockData';

interface PoaStayContextType {
  // Active Portal & Auth
  currentRole: PortalRole;
  setCurrentRole: (role: PortalRole) => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  usersList: UserAccount[];
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  registerCustomer: (name: string, email: string, phone: string, pass: string) => boolean;

  // Accommodations & Inventory (Channel Manager)
  accommodations: Accommodation[];
  updateAccommodation: (acc: Accommodation) => void;
  addAccommodation: (acc: Omit<Accommodation, 'id' | 'slug' | 'rating' | 'reviewsCount' | 'bookedDateRanges'>) => void;
  deleteAccommodation: (id: string) => void;
  checkDateAvailability: (accId: string, checkIn: string, checkOut: string, unitsToBook: number) => { available: boolean; remainingUnits: number; reason?: string };

  // Transport
  transportOptions: Record<string, TransportOption[]>;
  addTransportOption: (destination: string, option: TransportOption) => void;

  // Cart & Checkout
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // Bookings & Double Booking Prevention
  bookings: Booking[];
  createBookingFromCart: (
    cartItem: CartItem,
    depositAmount: number,
    mpesaPhone: string,
    groupCode?: string
  ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  updateBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  payInstallment: (bookingId: string, amount: number, phone: string) => Promise<{ success: boolean; transaction?: MpesaTransaction; error?: string }>;

  // Staff & Manager Operations
  staffList: StaffMember[];
  addStaff: (staff: Omit<StaffMember, 'id' | 'assignedTripsCount' | 'rating'>) => void;
  updateStaff: (staff: StaffMember) => void;
  managersList: ManagerMember[];

  // Staff Duties
  duties: StaffDuty[];
  addDuty: (duty: Omit<StaffDuty, 'id' | 'createdAt'>) => void;
  updateDutyStatus: (dutyId: string, status: 'pending' | 'in_progress' | 'completed') => void;

  // Staff Allocation & Trip Coordination
  allocateBooking: (
    bookingId: string,
    staffId: string,
    roomNumber: string,
    transportOption?: TransportOption,
    mealArrangement?: MealArrangement
  ) => void;

  // Notifications (WhatsApp & SMS)
  notifications: NotificationMessage[];
  sendNotification: (
    channel: 'whatsapp' | 'sms',
    recipientName: string,
    recipientPhone: string,
    message: string
  ) => void;

  // Property Ratings & Reviews
  reviews: PropertyReview[];
  addPropertyReview: (
    review: Omit<PropertyReview, 'id' | 'createdAt'>
  ) => { success: boolean; newRating: number; review: PropertyReview };
  getAccommodationReviews: (accId: string) => PropertyReview[];

  // Git Ledger & System Metadata
  gitCommitRef: string;
}

const PoaStayContext = createContext<PoaStayContextType | undefined>(undefined);

export const PoaStayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const [currentRole, setCurrentRole] = useState<PortalRole>(() => {
    const saved = localStorage.getItem('poastay_role');
    return (saved as PortalRole) || 'customer';
  });

  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('poastay_users');
    return saved ? JSON.parse(saved) : DEMO_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('poastay_current_user');
    if (saved) return JSON.parse(saved);
    // default customer
    return DEMO_USERS.find((u) => u.role === 'customer') || null;
  });

  const [accommodations, setAccommodations] = useState<Accommodation[]>(() => {
    const saved = localStorage.getItem('poastay_accommodations');
    return saved ? JSON.parse(saved) : INITIAL_ACCOMMODATIONS;
  });

  const [transportOptions, setTransportOptions] = useState<Record<string, TransportOption[]>>(() => {
    const saved = localStorage.getItem('poastay_transport');
    return saved ? JSON.parse(saved) : KENYAN_TRANSPORT_OPTIONS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('poastay_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('poastay_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('poastay_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [managersList] = useState<ManagerMember[]>(INITIAL_MANAGERS);

  const [duties, setDuties] = useState<StaffDuty[]>(() => {
    const saved = localStorage.getItem('poastay_duties');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_DUTIES;
  });

  const [notifications, setNotifications] = useState<NotificationMessage[]>(() => {
    const saved = localStorage.getItem('poastay_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [reviews, setReviews] = useState<PropertyReview[]>(() => {
    const saved = localStorage.getItem('poastay_reviews');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTY_REVIEWS;
  });

  const [gitCommitRef] = useState<string>('kengadara-git:rev-2026.09-ke-sync-prod');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('poastay_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('poastay_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('poastay_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('poastay_accommodations', JSON.stringify(accommodations));
  }, [accommodations]);

  useEffect(() => {
    localStorage.setItem('poastay_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('poastay_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('poastay_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('poastay_duties', JSON.stringify(duties));
  }, [duties]);

  useEffect(() => {
    localStorage.setItem('poastay_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('poastay_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Auth methods
  const login = (email: string, _pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    // Fallback: create on the fly as customer
    const newUser: UserAccount = {
      id: 'cust-' + Date.now(),
      name: email.split('@')[0],
      email: cleanEmail,
      phone: '+254 700 000 000',
      role: 'customer',
      county: 'Kenya',
    };
    setUsersList((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerCustomer = (name: string, email: string, phone: string, _pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      return true;
    }
    const newUser: UserAccount = {
      id: 'cust-' + Date.now(),
      name,
      email: cleanEmail,
      phone,
      role: 'customer',
      county: 'Nairobi',
    };
    setUsersList((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  // Accommodation Inventory & Anti-Double-Booking Check
  const checkDateAvailability = (
    accId: string,
    checkIn: string,
    checkOut: string,
    unitsToBook: number = 1
  ): { available: boolean; remainingUnits: number; reason?: string } => {
    const acc = accommodations.find((a) => a.id === accId);
    if (!acc) return { available: false, remainingUnits: 0, reason: 'Property not found' };

    const totalCapacity = acc.totalUnits;
    if (totalCapacity <= 0) return { available: false, remainingUnits: 0, reason: 'Property has 0 units' };

    // Check date overlaps with existing active bookings
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();

    // Count units booked on any overlapping day
    let maxBookedOnOverlappingRange = 0;

    const activeBookings = bookings.filter(
      (b) => b.accommodationId === accId && b.bookingStatus !== 'cancelled'
    );

    // Build day-by-day map
    const dayMs = 24 * 60 * 60 * 1000;
    for (let t = checkInTime; t < checkOutTime; t += dayMs) {
      let bookedForThisDay = 0;
      for (const b of activeBookings) {
        const bIn = new Date(b.checkInDate).getTime();
        const bOut = new Date(b.checkOutDate).getTime();
        if (t >= bIn && t < bOut) {
          bookedForThisDay += b.unitsBooked || 1;
        }
      }
      if (bookedForThisDay > maxBookedOnOverlappingRange) {
        maxBookedOnOverlappingRange = bookedForThisDay;
      }
    }

    const remaining = totalCapacity - maxBookedOnOverlappingRange;
    if (remaining < unitsToBook) {
      return {
        available: false,
        remainingUnits: Math.max(0, remaining),
        reason: `Only ${Math.max(0, remaining)} unit(s) left on these dates.`,
      };
    }

    return { available: true, remainingUnits: remaining };
  };

  const updateAccommodation = (updated: Accommodation) => {
    setAccommodations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const addAccommodation = (
    newAcc: Omit<Accommodation, 'id' | 'slug' | 'rating' | 'reviewsCount' | 'bookedDateRanges'>
  ) => {
    const id = 'acc-' + Date.now();
    const slug = newAcc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const accItem: Accommodation = {
      ...newAcc,
      id,
      slug,
      rating: 5.0,
      reviewsCount: 1,
      bookedDateRanges: [],
    };
    setAccommodations((prev) => [accItem, ...prev]);
  };

  const deleteAccommodation = (id: string) => {
    setAccommodations((prev) => prev.filter((a) => a.id !== id));
  };

  const addTransportOption = (destination: string, option: TransportOption) => {
    setTransportOptions((prev) => {
      const existing = prev[destination] || [];
      return { ...prev, [destination]: [...existing, option] };
    });
  };

  // Cart Management
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: 'cart-' + Date.now(),
    };
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Send Notification Helper
  const sendNotification = (
    channel: 'whatsapp' | 'sms',
    recipientName: string,
    recipientPhone: string,
    message: string
  ) => {
    const notif: NotificationMessage = {
      id: 'notif-' + Date.now(),
      channel,
      recipientName,
      recipientPhone,
      message,
      timestamp: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Daraja M-Pesa Booking Creation
  const createBookingFromCart = async (
    cartItem: CartItem,
    depositAmount: number,
    mpesaPhone: string,
    groupCode?: string
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    // 1. Double Booking Check
    const check = checkDateAvailability(cartItem.accommodation.id, cartItem.checkIn, cartItem.checkOut, 1);
    if (!check.available) {
      return {
        success: false,
        error: `Booking conflict: ${check.reason || 'Property is not available for requested dates.'}`,
      };
    }

    // 2. Generate M-Pesa Receipt Code (Simulated Daraja Response)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codePart = '';
    for (let i = 0; i < 7; i++) {
      codePart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const receiptNumber = 'QK' + codePart;

    const bookingRef = 'POA-' + Math.floor(1000 + Math.random() * 9000);
    const balanceDue = Math.max(0, cartItem.totalPrice - depositAmount);
    const paymentStatus = balanceDue === 0 ? 'fully_paid' : 'deposit_paid';

    const transaction: MpesaTransaction = {
      id: 'tx-' + Date.now(),
      receiptNumber,
      phoneNumber: mpesaPhone,
      amount: depositAmount,
      type: balanceDue === 0 ? 'full_payment' : 'deposit',
      status: 'success',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      merchantRequestId: 'MR-' + Math.floor(10000 + Math.random() * 90000) + '-POA',
      checkoutRequestId: 'ws_CO_' + Date.now(),
      notes: `${balanceDue === 0 ? 'Full' : 'Deposit'} payment via Lipa Na M-Pesa Online Daraja API`,
    };

    // Customer info
    const customer = currentUser || {
      id: 'cust-guest',
      name: 'Guest Traveler',
      email: 'guest@poastay.co.ke',
      phone: mpesaPhone,
      role: 'customer' as PortalRole,
    };

    // Initial meal plan
    const mealArrangement: MealArrangement = {
      breakfast: cartItem.mealPlan === 'breakfast' || cartItem.mealPlan === 'full_board' || cartItem.mealPlan === 'half_board',
      lunch: cartItem.mealPlan === 'full_board',
      dinner: cartItem.mealPlan === 'half_board' || cartItem.mealPlan === 'full_board',
      notes: cartItem.mealPlan !== 'none' ? `Requested ${cartItem.mealPlan.replace('_', ' ')} package.` : 'Self-catering / Nearby restaurants',
      dietaryPreference: 'Standard Nyama',
    };

    // Auto-assign default coordinator staff based on destination
    let assignedStaff = staffList[0];
    if (cartItem.accommodation.county.includes('Kwale') || cartItem.accommodation.county.includes('Kilifi')) {
      assignedStaff = staffList.find((s) => s.id === 'staff-2') || staffList[0];
    } else if (cartItem.accommodation.county.includes('Narok') || cartItem.accommodation.county.includes('Nakuru')) {
      assignedStaff = staffList.find((s) => s.id === 'staff-4') || staffList[0];
    }

    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      bookingRef,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: mpesaPhone || customer.phone,
      accommodationId: cartItem.accommodation.id,
      accommodationTitle: cartItem.accommodation.title,
      accommodationLocation: cartItem.accommodation.location,
      accommodationImage: cartItem.accommodation.images[0],
      checkInDate: cartItem.checkIn,
      checkOutDate: cartItem.checkOut,
      nights: cartItem.nights,
      guests: cartItem.guests,
      unitsBooked: 1,
      totalAmount: cartItem.totalPrice,
      depositRequired: depositAmount,
      amountPaid: depositAmount,
      balanceDue,
      paymentStatus,
      bookingStatus: 'confirmed',
      transportOption: cartItem.transport,
      assignedStaffId: assignedStaff.id,
      assignedStaffName: assignedStaff.name,
      allocatedRoomNumber: 'Room allocation in progress by ' + assignedStaff.name,
      checkInTime: cartItem.accommodation.checkInTime || '14:00',
      checkOutTime: cartItem.accommodation.checkOutTime || '10:30',
      mealArrangement,
      mpesaTransactions: [transaction],
      groupTripCode: groupCode || undefined,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // 3. Update bookings state
    setBookings((prev) => [newBooking, ...prev]);

    // 4. Update Accommodation Stock & Booked Dates
    setAccommodations((prev) =>
      prev.map((acc) => {
        if (acc.id === cartItem.accommodation.id) {
          const newBookedUnits = Math.min(acc.totalUnits, (acc.bookedUnits || 0) + 1);
          return {
            ...acc,
            bookedUnits: newBookedUnits,
            bookedDateRanges: [
              ...acc.bookedDateRanges,
              { from: cartItem.checkIn, to: cartItem.checkOut, bookingRef, units: 1 },
            ],
          };
        }
        return acc;
      })
    );

    // 5. Create Staff Duty automatically for manager / staff
    const newDuty: StaffDuty = {
      id: 'duty-' + Date.now(),
      title: `Arrival Coordination for ${customer.name} (${bookingRef})`,
      description: `Verify room readiness at ${cartItem.accommodation.title}. Coordinate ${
        cartItem.transport ? cartItem.transport.name : 'client self-drive'
      } and confirm key handover.`,
      assignedToStaffId: assignedStaff.id,
      assignedToStaffName: assignedStaff.name,
      assignedByManagerName: 'Victor Omondi',
      bookingRef,
      priority: 'high',
      status: 'pending',
      category: 'checkin',
      dueDate: cartItem.checkIn + ' 12:00',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setDuties((prev) => [newDuty, ...prev]);

    // 6. Automated WhatsApp & SMS Notification triggers
    const whatsappMsg = `Habari ${customer.name}! ✨ Your PoaStay booking at ${cartItem.accommodation.title} is CONFIRMED (Ref: ${bookingRef}). M-Pesa Receipt ${receiptNumber} for KSh ${depositAmount.toLocaleString()} received. ${
      balanceDue > 0 ? `Remaining balance: KSh ${balanceDue.toLocaleString()} (payable in installments). ` : 'Payment complete! '
    }Your coordinator ${assignedStaff.name} (${assignedStaff.phone}) will assist your stay. Karibu sana!`;

    sendNotification('whatsapp', customer.name, mpesaPhone, whatsappMsg);

    const smsMsg = `POASTAY-KE: Booking ${bookingRef} Confirmed! Received KSh ${depositAmount.toLocaleString()} via M-Pesa ${receiptNumber}. Dates: ${cartItem.checkIn} to ${cartItem.checkOut}. View passes on poastay.co.ke`;
    sendNotification('sms', customer.name, mpesaPhone, smsMsg);

    return { success: true, booking: newBooking };
  };

  // Pay subsequent installment via M-Pesa
  const payInstallment = async (
    bookingId: string,
    amount: number,
    phone: string
  ): Promise<{ success: boolean; transaction?: MpesaTransaction; error?: string }> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codePart = '';
    for (let i = 0; i < 7; i++) {
      codePart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const receiptNumber = 'QK' + codePart;

    const newAmountPaid = booking.amountPaid + amount;
    const newBalanceDue = Math.max(0, booking.totalAmount - newAmountPaid);
    const paymentStatus = newBalanceDue === 0 ? 'fully_paid' : 'deposit_paid';

    const transaction: MpesaTransaction = {
      id: 'tx-' + Date.now(),
      receiptNumber,
      phoneNumber: phone,
      amount,
      type: newBalanceDue === 0 ? 'final_payment' : 'installment_2',
      status: 'success',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      merchantRequestId: 'MR-' + Math.floor(10000 + Math.random() * 90000) + '-POA',
      checkoutRequestId: 'ws_CO_' + Date.now(),
      notes: `Installment payment via Safaricom Lipa Na M-Pesa Online Daraja API. Balance: KSh ${newBalanceDue.toLocaleString()}`,
    };

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            paymentStatus,
            mpesaTransactions: [...b.mpesaTransactions, transaction],
          };
        }
        return b;
      })
    );

    // Send confirmation SMS & WhatsApp
    const msg = `POASTAY-KE: Installment of KSh ${amount.toLocaleString()} received via M-Pesa ${receiptNumber} for Booking ${booking.bookingRef}. Balance Due: KSh ${newBalanceDue.toLocaleString()}. Asante sana!`;
    sendNotification('sms', booking.customerName, phone, msg);

    return { success: true, transaction };
  };

  const updateBooking = (updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b))
    );

    // Release stock in accommodation
    setAccommodations((prev) =>
      prev.map((acc) => {
        if (acc.id === booking.accommodationId) {
          const releasedBookedUnits = Math.max(0, (acc.bookedUnits || 1) - (booking.unitsBooked || 1));
          return {
            ...acc,
            bookedUnits: releasedBookedUnits,
            bookedDateRanges: acc.bookedDateRanges.filter((r) => r.bookingRef !== booking.bookingRef),
          };
        }
        return acc;
      })
    );

    sendNotification(
      'sms',
      booking.customerName,
      booking.customerPhone,
      `POASTAY-KE: Booking ${booking.bookingRef} has been cancelled. Refund processing is underway via M-Pesa.`
    );
  };

  // Staff management
  const addStaff = (staff: Omit<StaffMember, 'id' | 'assignedTripsCount' | 'rating'>) => {
    const newStaff: StaffMember = {
      ...staff,
      id: 'staff-' + Date.now(),
      assignedTripsCount: 0,
      rating: 5.0,
    };
    setStaffList((prev) => [...prev, newStaff]);
  };

  const updateStaff = (updated: StaffMember) => {
    setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Staff duties
  const addDuty = (duty: Omit<StaffDuty, 'id' | 'createdAt'>) => {
    const newDuty: StaffDuty = {
      ...duty,
      id: 'duty-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setDuties((prev) => [newDuty, ...prev]);

    // Send WhatsApp alert to the assigned staff member!
    const staff = staffList.find((s) => s.id === duty.assignedToStaffId);
    if (staff) {
      sendNotification(
        'whatsapp',
        staff.name,
        staff.phone,
        `Habari ${staff.name}! 📋 New PoaStay Operational Duty assigned by ${duty.assignedByManagerName}: "${duty.title}" (Priority: ${duty.priority.toUpperCase()}). Due: ${duty.dueDate}. Log into staff portal to update status.`
      );
    }
  };

  const updateDutyStatus = (dutyId: string, status: 'pending' | 'in_progress' | 'completed') => {
    setDuties((prev) => prev.map((d) => (d.id === dutyId ? { ...d, status } : d)));
  };

  // Staff allocation
  const allocateBooking = (
    bookingId: string,
    staffId: string,
    roomNumber: string,
    transportOption?: TransportOption,
    mealArrangement?: MealArrangement
  ) => {
    const staff = staffList.find((s) => s.id === staffId);
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            bookingStatus: 'allocated',
            assignedStaffId: staffId,
            assignedStaffName: staff?.name || b.assignedStaffName,
            allocatedRoomNumber: roomNumber,
            transportOption: transportOption || b.transportOption,
            mealArrangement: mealArrangement || b.mealArrangement,
          };
        }
        return b;
      })
    );

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      sendNotification(
        'whatsapp',
        booking.customerName,
        booking.customerPhone,
        `Habari ${booking.customerName}! 🔑 Your room has been allocated: ${roomNumber} at ${booking.accommodationTitle}. Your coordinator ${staff?.name || 'Faith'} has prepared everything for your arrival on ${booking.checkInDate}. Karibu!`
      );
    }
  };

  // Property Ratings & Reviews
  const addPropertyReview = (
    reviewData: Omit<PropertyReview, 'id' | 'createdAt'>
  ) => {
    const newReview: PropertyReview = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      verifiedStay: true,
    };

    // Calculate updated rating and review count for accommodation
    const targetAcc = accommodations.find((a) => a.id === reviewData.accommodationId);
    let updatedRating = reviewData.rating;
    let updatedCount = 1;

    if (targetAcc) {
      const existingReviewsForAcc = reviews.filter((r) => r.accommodationId === reviewData.accommodationId);
      updatedCount = (targetAcc.reviewsCount || 0) + 1;
      
      // Calculate weighted aggregate rating
      const previousTotalScore = (targetAcc.rating || 5.0) * (targetAcc.reviewsCount || 1);
      updatedRating = Number(((previousTotalScore + reviewData.rating) / updatedCount).toFixed(2));

      const updatedAcc: Accommodation = {
        ...targetAcc,
        rating: updatedRating,
        reviewsCount: updatedCount,
      };

      setAccommodations((prev) =>
        prev.map((a) => (a.id === targetAcc.id ? updatedAcc : a))
      );
    }

    setReviews((prev) => [newReview, ...prev]);

    // Send SMS notification confirmation to reviewer
    if (reviewData.customerPhone) {
      sendNotification(
        'sms',
        reviewData.customerName,
        reviewData.customerPhone,
        `Asante sana ${reviewData.customerName}! Your ${reviewData.rating}-star review for "${reviewData.accommodationTitle}" has been verified and published on PoaStay.`
      );
    }

    return { success: true, newRating: updatedRating, review: newReview };
  };

  const getAccommodationReviews = (accId: string) => {
    return reviews.filter((r) => r.accommodationId === accId);
  };

  return (
    <PoaStayContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        usersList,
        login,
        logout,
        registerCustomer,
        accommodations,
        updateAccommodation,
        addAccommodation,
        deleteAccommodation,
        checkDateAvailability,
        transportOptions,
        addTransportOption,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        bookings,
        createBookingFromCart,
        updateBooking,
        cancelBooking,
        payInstallment,
        staffList,
        addStaff,
        updateStaff,
        managersList,
        duties,
        addDuty,
        updateDutyStatus,
        allocateBooking,
        notifications,
        sendNotification,
        reviews,
        addPropertyReview,
        getAccommodationReviews,
        gitCommitRef,
      }}
    >
      {children}
    </PoaStayContext.Provider>
  );
};

export const usePoaStay = () => {
  const context = useContext(PoaStayContext);
  if (!context) {
    throw new Error('usePoaStay must be used within a PoaStayProvider');
  }
  return context;
};
