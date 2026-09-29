export type PortalRole = 'admin' | 'manager' | 'staff' | 'customer';

export type AccommodationType = 'airbnb' | 'bnb' | 'staycation' | 'safari_camp' | 'villa' | 'hotel';

export interface RestaurantDish {
  name: string;
  priceKsh: number;
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  distance: string;
  priceRange: string;
  rating: number;
  image: string;
  phone: string;
  signatureDishes: RestaurantDish[];
}

export interface Accommodation {
  id: string;
  title: string;
  slug: string;
  type: AccommodationType;
  location: string;
  county: string;
  pricePerNight: number;
  totalUnits: number;
  bookedUnits: number; // Stock is totalUnits - bookedUnits
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  hostName: string;
  hostPhone: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  travelEstimate: {
    from: string;
    duration: string;
    distance: string;
    routeHighlights: string;
  };
  nearbyRestaurants: Restaurant[];
  bookedDateRanges: { from: string; to: string; bookingRef: string; units: number }[];
  featured?: boolean;
}

export interface PropertyReview {
  id: string;
  accommodationId: string;
  accommodationTitle: string;
  bookingRef?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 to 5
  title?: string;
  reviewText: string;
  visitedDate?: string;
  createdAt: string;
  recommend?: boolean;
  cleanlinessRating?: number;
  hospitalityRating?: number;
  locationRating?: number;
  verifiedStay?: boolean;
}

export type TransportMode = 'road' | 'train' | 'air';

export interface TransportOption {
  id: string;
  destination: string;
  mode: TransportMode;
  name: string;
  operator: string;
  departurePoint: string;
  arrivalPoint: string;
  duration: string;
  pricePerPerson: number;
  schedule: string;
  features: string[];
  vehicleReg?: string;
  assignedDriver?: string;
  driverPhone?: string;
}

export interface CartItem {
  id: string;
  accommodation: Accommodation;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  transport?: TransportOption;
  mealPlan: 'none' | 'breakfast' | 'half_board' | 'full_board';
  mealPriceTotal: number;
  totalPrice: number;
}

export interface MpesaTransaction {
  id: string;
  receiptNumber: string; // e.g. QKJ84920KL
  phoneNumber: string;
  amount: number;
  type: 'deposit' | 'installment_2' | 'final_payment' | 'full_payment';
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  notes?: string;
}

export interface MealArrangement {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  notes: string;
  catererOrChef?: string;
  dietaryPreference?: 'Halal' | 'Vegetarian' | 'Swahili Special' | 'Standard Nyama';
}

export interface Booking {
  id: string;
  bookingRef: string; // e.g. "POA-8821"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  accommodationId: string;
  accommodationTitle: string;
  accommodationLocation: string;
  accommodationImage: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  unitsBooked: number;
  totalAmount: number;
  depositRequired: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'deposit_paid' | 'fully_paid' | 'pending' | 'overdue';
  bookingStatus: 'confirmed' | 'allocated' | 'checked_in' | 'completed' | 'cancelled';
  transportOption?: TransportOption;
  assignedStaffId?: string;
  assignedStaffName?: string;
  allocatedRoomNumber?: string;
  checkInTime: string;
  checkOutTime: string;
  mealArrangement: MealArrangement;
  mpesaTransactions: MpesaTransaction[];
  groupTripCode?: string;
  createdAt: string;
}

export interface StaffDuty {
  id: string;
  title: string;
  description: string;
  assignedToStaffId: string;
  assignedToStaffName: string;
  assignedByManagerName: string;
  bookingRef?: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'completed';
  category: 'checkin' | 'transport' | 'meals' | 'inspection' | 'payment_followup';
  dueDate: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  roleTitle: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'active' | 'on_field' | 'off_duty';
  assignedTripsCount: number;
  rating: number;
}

export interface ManagerMember {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  activeStaffSupervised: number;
  lastActive: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: PortalRole;
  avatar?: string;
  county?: string;
}

export interface NotificationMessage {
  id: string;
  channel: 'whatsapp' | 'sms';
  recipientName: string;
  recipientPhone: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered';
  actionUrl?: string;
}
