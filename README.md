# PoaStay – Smart Kenyan Accommodation, Travel & Group Trip Coordination System

> **Git Repository Reference:** `kengadara-git`  
> **Target Market:** Kenya (Nairobi, Mombasa/Diani, Maasai Mara, Naivasha, Watamu, Nanyuki, Lamu)  
> **Payment Infrastructure:** Safaricom Lipa Na M-Pesa Online (Daraja API STK Push & C2B)  

---

## 1. Executive Overview

**PoaStay** is a production-grade accommodation, local channel manager, and travel logistics platform engineered specifically for the Kenyan hospitality ecosystem. It bridges the gap between independent Kenyan Airbnb/BnB hosts, safari camps, boutique beach villas, local travel agencies, and travelers.

The platform eliminates double-booking risks through real-time calendar synchronization, provides automated multi-tier installment plans via Safaricom M-Pesa, coordinates destination-specific transport (Madaraka Express SGR, Safarilink/AirKenya flights, and 4x4 safari land cruisers), coordinates private Kenyan culinary experiences, and provides four synchronized operational portals.

---

## 2. Core Architecture & Key Modules

### A. Lipa Na M-Pesa Installment Engine (Daraja API)
- **Down Deposit Locking (30% / 50% / 100%):** Customers can secure accommodations and staycation dates immediately with a 30% initial deposit.
- **STK Push Simulation & Production Webhooks:** Prompts user handset directly with SIM Toolkit dialog for 4-digit PIN verification.
- **Automated Balance Tracking:** Visual progress bars track cleared vs. pending balances with instant follow-up payment triggers.
- **Safaricom Receipt Generation:** Instant receipt number generation (e.g. `QKJ89420KL`) logged into the administrative ledger.

### B. Anti-Double-Booking Calendar & Real-Time Stock Engine
- **Calendar Range Interlocking:** Verifies date overlap on every inquiry. If an accommodation has limited units (e.g., 2 villas in stock), concurrent bookings for intersecting check-in/check-out dates decrement stock automatically.
- **Availability Enforcement:** Cart and checkout mechanisms reject bookings that exceed real-time inventory.
- **Central Channel Synchronization:** When staff, manager, or admin updates room status or allocations, the customer storefront updates instantly.

### C. Kenyan Transport Logistics Matrix
Dynamic routing engine that pairs accommodations with available transport based on destination geography:
- **Coastal Kenya (Diani / Watamu / Lamu):** Kenya Railways SGR Madaraka Express (First & Economy Class from Syokimau / Nairobi Terminus to Mombasa Terminus) with coastal chauffeur transfers; Skyward Express / Jambojet airstrip flights.
- **Savanna & Bush (Maasai Mara / Amboseli):** Customized 4x4 pop-up roof Safari Land Cruisers with licensed KPSGA guides; Wilson Airport light aircraft flights to Keekorok / Musiara airstrips.
- **Rift Valley & Highlands (Naivasha / Nanyuki):** Executive Tour Vans, self-drive secure parking arrangements, and chauffeur highway transfers.

### D. Kenyan Dining & Culinary Coordination
- Integrated recommendations for authentic Kenyan eateries near each staycation property (e.g., Ali Barbour's Cave Restaurant in Diani, The Moorings in Mtwapa, Ranch House Bistro in Naivasha).
- Meal coordination options: Self-catering, Farmhouse Breakfast, Half Board, and Full Board with private Swahili chefs.

### E. Group Trip Coordinator & Chama Split
- Unique Group Codes (e.g., `DIANI-SQUAD-2026`, `MARA-SAFARI-09`) allow organizers to share a single reservation link.
- Per-person contribution split breakdown allows each member to pay their share independently via M-Pesa.

### F. Automated WhatsApp & SMS Notifications
- Check-in instructions, room allocation passes, driver contact cards, and gate access codes are dispatched directly to travelers via WhatsApp and SMS gateways.

---

## 3. Four Specialized Portals

| Portal | Primary Audience | Key Functionalities |
| :--- | :--- | :--- |
| **Customer / Traveler** | Domestic & International Guests | Browse Kenyan stays, check date stock, select transport & meal plans, complete M-Pesa installments, view passes, split group costs. |
| **Staff Field Operations** | On-site Coordinators & Field Agents | Allocate confirmed rooms/units, assign vehicle registrations and drivers, set check-in/out times, manage meal arrangements, edit prices & stock. |
| **Manager Portal** | Operations & Logistics Managers | Assign duties with priority levels to staff, monitor duty completion, supervise staff directory, oversee travel schedules, update inventory rates. |
| **Admin Portal** | Agency Owners & System Executives | 360° KPI dashboard, M-Pesa financial audit ledger, anti-double-booking calendar conflict analyzer, user/staff/manager governance. |

---

## 4. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite 8
- **State Management & Persistence:** Centralized React Context with LocalStorage persistence layer
- **Icons & Motion:** Lucide React, Framer Motion, Canvas Confetti
- **Payments:** Safaricom Daraja API (Lipa Na M-Pesa Online STK Push simulation & receipting)
- **Repository Reference:** `kengadara-git`

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup Commands
```bash
# Clone the repository
git clone https://github.com/kengadara/poastay.git
cd poastay

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application runs locally on `http://localhost:3000`.

### Building for Production
```bash
npm run build
```

---

## 6. Security & Kenyan Compliance

- Strict role-based authorization ensuring customers must log in prior to cart checkout and payment authorization.
- In-flight M-Pesa callback validation and error handling for expired STK prompts.
- All transactional receipts recorded with unique cryptographic hashes synchronized with `kengadara-git`.
