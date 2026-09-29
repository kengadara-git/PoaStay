import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { Accommodation, Booking, StaffDuty, StaffMember } from '../../types';
import {
  ClipboardList,
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  Car,
  Utensils,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  MessageSquare,
  Plus,
  Edit3,
  ShieldCheck,
  Briefcase,
  Layers,
  Save,
  Trash2,
  FileSpreadsheet,
  FileText,
  Download,
  BarChart3,
  Table,
} from 'lucide-react';
import { AccountingRevenueReports } from './AccountingRevenueReports';
import { ManagerChartsSection } from './ManagerChartsSection';
import { downloadBookingsCSV, downloadBookingsPDF } from '../../utils/reportExport';

export const ManagerPortal: React.FC = () => {
  const {
    staffList,
    addStaff,
    updateStaff,
    duties,
    addDuty,
    updateDutyStatus,
    bookings,
    accommodations,
    updateAccommodation,
    sendNotification,
  } = usePoaStay();

  const [activeTab, setActiveTab] = useState<
    'revenue-trends' | 'duties' | 'staff-team' | 'trips-overview' | 'pricing-inventory' | 'accounting-reports'
  >('revenue-trends');

  // Trips overview view mode (interactive charts vs table vs combined)
  const [tripsViewMode, setTripsViewMode] = useState<'charts' | 'table' | 'combined'>('charts');

  // Duty assignment modal
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [dutyTitle, setDutyTitle] = useState('');
  const [dutyDescription, setDutyDescription] = useState('');
  const [dutyStaffId, setDutyStaffId] = useState(staffList[0]?.id || '');
  const [dutyPriority, setDutyPriority] = useState<'urgent' | 'high' | 'normal'>('high');
  const [dutyCategory, setDutyCategory] = useState<'checkin' | 'transport' | 'meals' | 'inspection' | 'payment_followup'>('checkin');
  const [dutyBookingRef, setDutyBookingRef] = useState('');
  const [dutyDueDate, setDutyDueDate] = useState('2026-10-01 12:00');

  // New staff modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Field Guest Coordinator');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('+254 7');
  const [newStaffAvatar, setNewStaffAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );

  // Price & stock edit modal
  const [editingAcc, setEditingAcc] = useState<Accommodation | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editUnits, setEditUnits] = useState(0);

  const handleCreateDuty = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedStaff = staffList.find((s) => s.id === dutyStaffId) || staffList[0];

    addDuty({
      title: dutyTitle,
      description: dutyDescription,
      assignedToStaffId: assignedStaff.id,
      assignedToStaffName: assignedStaff.name,
      assignedByManagerName: 'Victor Omondi (Operations Manager)',
      bookingRef: dutyBookingRef || undefined,
      priority: dutyPriority,
      status: 'pending',
      category: dutyCategory,
      dueDate: dutyDueDate,
    });

    setDutyModalOpen(false);
    setDutyTitle('');
    setDutyDescription('');
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    addStaff({
      name: newStaffName,
      roleTitle: newStaffRole,
      email: newStaffEmail,
      phone: newStaffPhone,
      avatar: newStaffAvatar,
      status: 'active',
    });

    setStaffModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc) return;
    updateAccommodation({
      ...editingAcc,
      pricePerNight: editPrice,
      totalUnits: editUnits,
    });
    setEditingAcc(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Operations & Management
            </span>
            <span className="text-xs text-stone-400">Kenya Local Channel Hub</span>
          </div>
          <h1 className="text-2xl font-black">Manager Coordination & Operations Portal</h1>
          <p className="text-xs text-stone-300 max-w-xl mt-1">
            Delegate operational duties to staff, supervise bookings, track M-Pesa collections, and manage inventory availability across all Kenyan properties.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap bg-white/10 p-1 rounded-2xl border border-white/10 self-start sm:self-center gap-0.5">
          <button
            onClick={() => setActiveTab('revenue-trends')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'revenue-trends' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
            <span>Revenue & Trends (Charts)</span>
          </button>
          <button
            onClick={() => setActiveTab('duties')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'duties' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            Duty Allocations ({duties.length})
          </button>
          <button
            onClick={() => setActiveTab('staff-team')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'staff-team' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            Staff Team ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('trips-overview')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trips-overview' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            Bookings & Transport ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('pricing-inventory')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pricing-inventory' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            Price & Units Manager ({accommodations.length})
          </button>
          <button
            onClick={() => setActiveTab('accounting-reports')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'accounting-reports' ? 'bg-emerald-600 text-white shadow-sm' : 'text-amber-300 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Accounting Reports</span>
          </button>
        </div>
      </div>

      {/* TAB 0: REVENUE & BOOKING VOLUME CHARTS */}
      {activeTab === 'revenue-trends' && (
        <ManagerChartsSection
          bookings={bookings}
          accommodations={accommodations}
          onNavigateToReports={() => setActiveTab('accounting-reports')}
        />
      )}

      {/* TAB 1: DUTY ALLOCATION TO STAFF */}
      {activeTab === 'duties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 shadow-xl text-stone-100">
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Staff Responsibilities & Duty Tracker
              </h2>
              <p className="text-xs text-stone-300">
                Managers assign high-priority tasks (SGR pickup, room checks, seafood procurement).
              </p>
            </div>
            <button
              onClick={() => setDutyModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Duty to Staff</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {duties.map((duty) => (
              <div
                key={duty.id}
                className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-3 flex flex-col justify-between text-stone-100 hover:border-emerald-400/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        duty.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          : duty.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                          : 'bg-white/10 text-stone-300 border-white/10'
                      }`}
                    >
                      {duty.priority}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize border ${
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

                  <h3 className="text-sm font-black text-white leading-snug">{duty.title}</h3>
                  <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                    {duty.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/10 text-[11px] text-stone-400">
                  <p>
                    <strong className="text-stone-200">Assigned Staff:</strong> {duty.assignedToStaffName}
                  </p>
                  <p>
                    <strong className="text-stone-200">Due:</strong> {duty.dueDate}
                  </p>
                  {duty.bookingRef && (
                    <p>
                      <strong className="text-stone-200">Booking Ref:</strong> {duty.bookingRef}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF TEAM MANAGEMENT */}
      {activeTab === 'staff-team' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 shadow-xl text-stone-100">
            <div>
              <h2 className="text-sm font-extrabold text-white">PoaStay Kenya Staff Directory</h2>
              <p className="text-xs text-stone-300">
                Supervise field agents, guest relations officers, and drivers across Kenya.
              </p>
            </div>
            <button
              onClick={() => setStaffModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Staff Member</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl text-center space-y-3 text-stone-100 hover:border-emerald-400/40 transition-all"
              >
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-white/10"
                />
                <div>
                  <h3 className="text-sm font-black text-white">{staff.name}</h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">{staff.roleTitle}</p>
                </div>

                <div className="p-2.5 bg-stone-950/60 border border-white/10 rounded-2xl text-xs space-y-1 text-stone-300 text-left">
                  <p className="truncate">
                    <strong className="text-stone-200">Email:</strong> {staff.email}
                  </p>
                  <p className="truncate">
                    <strong className="text-stone-200">M-Pesa:</strong> {staff.phone}
                  </p>
                  <div className="flex justify-between pt-1 border-t border-white/10 text-[11px]">
                    <span className="text-stone-400">Assigned Trips:</span>
                    <strong className="text-white">{staff.assignedTripsCount}</strong>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${staff.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Habari ${staff.name}! Operations Manager update: please review your assigned duties on the PoaStay staff portal.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRIPS & BOOKING OVERVIEW */}
      {activeTab === 'trips-overview' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-100 shadow-xl">
            <div>
              <h2 className="text-sm font-extrabold text-white">
                All Active Customer Bookings & Operations
              </h2>
              <p className="text-xs text-stone-300">
                Track M-Pesa collections, pending balances, and coordinator allocations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Toggle: Graphical Charts vs Table vs Combined */}
              <div className="bg-stone-950/70 p-1 rounded-xl flex items-center border border-white/15 text-xs font-bold shadow-inner">
                <button
                  type="button"
                  onClick={() => setTripsViewMode('charts')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    tripsViewMode === 'charts'
                      ? 'bg-amber-600 text-white shadow-xs font-black'
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title="Interactive graphical revenue and booking charts"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Graphical Insights</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTripsViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    tripsViewMode === 'table'
                      ? 'bg-amber-600 text-white shadow-xs font-black'
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title="Detailed booking ledger table"
                >
                  <Table className="w-3.5 h-3.5 text-amber-300" />
                  <span>Data Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTripsViewMode('combined')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                    tripsViewMode === 'combined'
                      ? 'bg-amber-600 text-white shadow-xs font-black'
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title="Show both interactive charts and data table"
                >
                  <span>Combined</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => downloadBookingsCSV(bookings)}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-400/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="Download complete bookings and revenue ledger in CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => downloadBookingsPDF(bookings, accommodations)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="Download official PDF accounting statement"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Export PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('accounting-reports')}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/15 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Accounting Hub</span>
              </button>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30">
                {bookings.length} Bookings
              </span>
            </div>
          </div>

          {/* Interactive Graphical Insights (Replacing static view) */}
          {(tripsViewMode === 'charts' || tripsViewMode === 'combined') && (
            <ManagerChartsSection
              bookings={bookings}
              accommodations={accommodations}
              onNavigateToReports={() => setActiveTab('accounting-reports')}
            />
          )}

          {/* Tabular Data View */}
          {(tripsViewMode === 'table' || tripsViewMode === 'combined') && (
            <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl text-stone-100">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Itemized Reservations Ledger
                </span>
                <span className="text-xs text-stone-400">
                  {bookings.length} reservations recorded
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/60 text-stone-400 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
                    <tr>
                      <th className="p-3.5">Ref</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Accommodation</th>
                      <th className="p-3.5">Dates</th>
                      <th className="p-3.5">Total (KSh)</th>
                      <th className="p-3.5">Paid / Balance</th>
                      <th className="p-3.5">Assigned Staff</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-medium text-stone-200">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-emerald-400">{b.bookingRef}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{b.customerName}</div>
                          <div className="text-[11px] text-stone-400">{b.customerPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-stone-100 truncate max-w-[180px]">
                            {b.accommodationTitle}
                          </div>
                          <div className="text-[10px] text-emerald-400">{b.accommodationLocation}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-stone-300">
                          {b.checkInDate} to {b.checkOutDate}
                        </td>
                        <td className="p-3.5 font-bold text-white font-mono">
                          KSh {b.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <div className="text-emerald-400 font-bold font-mono">
                            Paid: KSh {b.amountPaid.toLocaleString()}
                          </div>
                          {b.balanceDue > 0 ? (
                            <div className="text-amber-400 text-[10px] font-mono">
                              Due: KSh {b.balanceDue.toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-emerald-300 text-[10px] font-bold">Cleared</div>
                          )}
                        </td>
                        <td className="p-3.5 text-stone-300">
                          {b.assignedStaffName || 'Unassigned'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              b.paymentStatus === 'fully_paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                            }`}
                          >
                            {b.paymentStatus.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRICING & INVENTORY CHANNEL MANAGER */}
      {activeTab === 'pricing-inventory' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-100 shadow-xl">
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Property Pricing & Real-Time Stock Units
              </h2>
              <p className="text-xs text-stone-300">
                Managers can update nightly rates and units in stock. System automatically shows remaining availability and prevents double bookings.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Local Channel Manager Active
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accommodations.map((acc) => {
              const remaining = Math.max(0, acc.totalUnits - (acc.bookedUnits || 0));
              const isOut = remaining <= 0;

              return (
                <div
                  key={acc.id}
                  className="bg-stone-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-xl space-y-3 text-stone-100 hover:border-emerald-400/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <img
                        src={acc.images[0]}
                        alt={acc.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{acc.title}</h4>
                        <p className="text-[11px] text-stone-300 truncate">{acc.location}</p>
                        <div className="mt-1">
                          {isOut ? (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
                              SOLD OUT
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
                              {remaining} of {acc.totalUnits} Units Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-950/60 rounded-2xl text-xs space-y-1.5 border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400">Price Per Night:</span>
                        <strong className="text-emerald-400 font-mono text-sm">
                          KSh {acc.pricePerNight.toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-stone-400">Total Units:</span>
                        <strong className="text-white">{acc.totalUnits} Units</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-stone-400">Booked Units:</span>
                        <strong className="text-amber-300">{acc.bookedUnits || 0} Units</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingAcc(acc);
                      setEditPrice(acc.pricePerNight);
                      setEditUnits(acc.totalUnits);
                    }}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quick Edit Price & Stock</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNTING & REVENUE REPORTS */}
      {activeTab === 'accounting-reports' && <AccountingRevenueReports />}

      {/* CREATE DUTY MODAL */}
      {dutyModalOpen && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-amber-700 to-stone-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-black">Assign Duty to Field Staff</h3>
                <p className="text-xs text-stone-300">
                  Automated WhatsApp notification will be sent to the assigned staff member.
                </p>
              </div>
              <button
                onClick={() => setDutyModalOpen(false)}
                className="p-1 text-white/70 hover:text-white rounded-full bg-black/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDuty} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Duty Title</label>
                <input
                  type="text"
                  value={dutyTitle}
                  onChange={(e) => setDutyTitle(e.target.value)}
                  placeholder="e.g. SGR Pickup at Syokimau / Lobster Sourcing"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Assign to Staff Member
                </label>
                <select
                  value={dutyStaffId}
                  onChange={(e) => setDutyStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Priority</label>
                  <select
                    value={dutyPriority}
                    onChange={(e) => setDutyPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟡 High</option>
                    <option value="normal">🟢 Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Due Date/Time</label>
                  <input
                    type="text"
                    value={dutyDueDate}
                    onChange={(e) => setDutyDueDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Booking Reference (Optional)
                </label>
                <input
                  type="text"
                  value={dutyBookingRef}
                  onChange={(e) => setDutyBookingRef(e.target.value)}
                  placeholder="e.g. POA-8821"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Duty Description & Instructions
                </label>
                <textarea
                  rows={3}
                  value={dutyDescription}
                  onChange={(e) => setDutyDescription(e.target.value)}
                  placeholder="Specific instructions for room preparation, transport coordination, or special guest requests..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Assign Duty & Send WhatsApp Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-emerald-800 to-stone-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-black">Add New Staff Member</h3>
                <p className="text-xs text-stone-300">Onboard field staff or logistics coordinator</p>
              </div>
              <button
                onClick={() => setStaffModalOpen(false)}
                className="p-1 text-white/70 hover:text-white rounded-full bg-black/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Salim Mwenda"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Role Title</label>
                <input
                  type="text"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  placeholder="e.g. Rift Valley Field Coordinator"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="salim.m@poastay.co.ke"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">M-Pesa Mobile Number</label>
                <input
                  type="tel"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save & Add to Active Staff List
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PRICE & STOCK EDIT MODAL */}
      {editingAcc && (
        <div className="fixed inset-0 z-60 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-stone-900">Update Rates & Inventory</h3>
              <button
                onClick={() => setEditingAcc(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-500">{editingAcc.title}</p>

            <form onSubmit={handleSavePrice} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nightly Rate (KSh)
                </label>
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
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Total Units (Capacity)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editUnits}
                  onChange={(e) => setEditUnits(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Update Channel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
