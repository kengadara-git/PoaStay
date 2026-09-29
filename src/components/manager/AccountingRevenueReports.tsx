import React, { useState } from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { Booking, Accommodation } from '../../types';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Filter,
  Search,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  ArrowDownToLine,
  ShieldCheck,
  Smartphone,
  Eye,
  X,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { ManagerChartsSection } from './ManagerChartsSection';
import {
  filterBookingsForReport,
  downloadBookingsCSV,
  downloadMpesaCashflowCSV,
  downloadBookingsPDF,
  AccountingReportFilters,
} from '../../utils/reportExport';

export const AccountingRevenueReports: React.FC = () => {
  const { bookings, accommodations } = usePoaStay();

  // Filters State
  const [filters, setFilters] = useState<AccountingReportFilters>({
    dateRange: 'all',
    propertyId: 'all',
    paymentStatus: 'all',
    searchQuery: '',
  });

  // Graphical Trends Charts visibility
  const [showCharts, setShowCharts] = useState(false);

  // Print Statement Modal
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filtered bookings
  const filteredBookings = filterBookingsForReport(bookings, filters);

  // Calculate aggregates
  const totalGross = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalCollected = filteredBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalReceivables = filteredBookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const totalNights = filteredBookings.reduce((sum, b) => sum + (b.nights || 1), 0);
  const collectionRate = totalGross > 0 ? ((totalCollected / totalGross) * 100).toFixed(1) : '100.0';

  // Gather all M-Pesa transactions
  const allMpesaTransactions = filteredBookings.flatMap((b) =>
    (b.mpesaTransactions || []).map((tx) => ({
      ...tx,
      bookingRef: b.bookingRef,
      customerName: b.customerName,
      customerPhone: tx.phoneNumber || b.customerPhone,
      accommodationTitle: b.accommodationTitle,
    }))
  );

  const showNotification = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => {
      setExportNotice(null);
    }, 3500);
  };

  const handleDownloadCSV = () => {
    downloadBookingsCSV(filteredBookings);
    showNotification('CSV Booking & Revenue Report downloaded successfully.');
  };

  const handleDownloadMpesaCSV = () => {
    downloadMpesaCashflowCSV(filteredBookings);
    showNotification('M-Pesa Cashflow Audit CSV downloaded successfully.');
  };

  const handleDownloadPDF = () => {
    downloadBookingsPDF(filteredBookings, accommodations);
    showNotification('PDF Financial & Revenue Statement downloaded successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-5 right-5 z-70 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Header & Export Actions Bar */}
      <div className="bg-stone-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/15 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
              Financial Audits & Accounting
            </span>
            <span className="text-xs text-stone-300 font-mono">KRA PIN: P051928374Z</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white mt-1">
            Booking & Revenue Accounting Reports
          </h2>
          <p className="text-xs text-stone-300 max-w-xl">
            Export verified financial ledgers, M-Pesa collection audits, and property performance metrics in CSV or PDF formats for accounting and tax records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <div className="relative group">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs rounded-xl shadow-lg border border-emerald-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* M-Pesa CSV */}
          <button
            onClick={handleDownloadMpesaCSV}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs rounded-xl border border-white/15 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download M-Pesa Daraja Cash Flow Audit CSV"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">M-Pesa CSV</span>
          </button>

          {/* PDF Export */}
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 fill-stone-950 text-stone-950" />
            <span>Download PDF</span>
          </button>

          {/* Print Preview Statement */}
          <button
            onClick={() => setPrintModalOpen(true)}
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl border border-white/15 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-300" />
            <span>Print Preview</span>
          </button>

          {/* Graphical Trends Toggle */}
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`px-3.5 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
              showCharts
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>{showCharts ? 'Hide Graphical Trends' : 'Interactive Trends (Charts)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Revenue */}
        <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 shadow-xl space-y-1 text-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Gross Invoiced
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/10 text-stone-300 flex items-center justify-center border border-white/10">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            KSh {totalGross.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400">
            Across {filteredBookings.length} bookings ({totalNights} nights)
          </p>
        </div>

        {/* Realized M-Pesa Collections */}
        <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-emerald-400/30 shadow-xl space-y-1 text-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              M-Pesa Received
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            KSh {totalCollected.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-300 font-medium">
            {collectionRate}% realized cash flow
          </p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-amber-400/30 shadow-xl space-y-1 text-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Pending Receivables
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            KSh {totalReceivables.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-300 font-medium">
            Installment balances to collect
          </p>
        </div>

        {/* Verified Receipts Count */}
        <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 shadow-xl space-y-1 text-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Daraja Receipts
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/10 text-stone-300 flex items-center justify-center border border-white/10">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {allMpesaTransactions.length}
          </div>
          <p className="text-[11px] text-stone-400">
            Verified Safaricom STK transfers
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/15 shadow-xl space-y-3 text-stone-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Filter Accounting Scope
          </span>
          {(filters.dateRange !== 'all' ||
            filters.propertyId !== 'all' ||
            filters.paymentStatus !== 'all' ||
            filters.searchQuery !== '') && (
            <button
              onClick={() =>
                setFilters({
                  dateRange: 'all',
                  propertyId: 'all',
                  paymentStatus: 'all',
                  searchQuery: '',
                })
              }
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search Ref, Guest, Property..."
              className="w-full pl-8 pr-3 py-2 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Property Select */}
          <div>
            <select
              value={filters.propertyId}
              onChange={(e) => setFilters({ ...filters, propertyId: e.target.value })}
              className="w-full px-3 py-2 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Properties ({accommodations.length})</option>
              {accommodations.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-stone-900 text-white">
                  {acc.title} ({acc.location})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Select */}
          <div>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="w-full px-3 py-2 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="fully_paid" className="bg-stone-900 text-white">Fully Paid (Cleared)</option>
              <option value="deposit_paid" className="bg-stone-900 text-white">Deposit Paid (Installment Plan)</option>
              <option value="pending" className="bg-stone-900 text-white">Pending Initial Deposit</option>
              <option value="overdue" className="bg-stone-900 text-white">Overdue Balance</option>
            </select>
          </div>

          {/* Date Scope */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 bg-stone-950/70 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Stay Dates</option>
              <option value="this_month" className="bg-stone-900 text-white">Current Month (September 2026)</option>
              <option value="upcoming" className="bg-stone-900 text-white">Upcoming Check-ins</option>
              <option value="past" className="bg-stone-900 text-white">Completed / Past Stays</option>
            </select>
          </div>
        </div>
      </div>

      {/* Graphical Insights Chart Section */}
      {showCharts && (
        <ManagerChartsSection
          bookings={bookings}
          accommodations={accommodations}
        />
      )}

      {/* Property Revenue Breakdown Section */}
      <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden text-stone-100">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-400" />
              Property Performance & Channel Revenue Distribution
            </h3>
            <p className="text-xs text-stone-300">
              Breakdown of invoiced gross, collected deposits, and active units per unit.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-xl self-start sm:self-auto">
            {accommodations.length} Properties Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/60 text-stone-400 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
              <tr>
                <th className="p-3.5">Property</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Nightly Rate</th>
                <th className="p-3.5">Bookings</th>
                <th className="p-3.5 text-right">Invoiced Gross</th>
                <th className="p-3.5 text-right">M-Pesa Received</th>
                <th className="p-3.5 text-right">Receivables</th>
                <th className="p-3.5 text-center">Collection %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-medium text-stone-200">
              {accommodations.map((acc) => {
                const accBookings = bookings.filter((b) => b.accommodationId === acc.id);
                const accGross = accBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                const accPaid = accBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
                const accBalance = accBookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
                const accRate = accGross > 0 ? ((accPaid / accGross) * 100).toFixed(0) : '100';

                return (
                  <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold text-white">
                      <div className="truncate max-w-[200px]">{acc.title}</div>
                      <span className="text-[10px] text-stone-400 uppercase font-mono">
                        {acc.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-300">{acc.location}</td>
                    <td className="p-3.5 font-mono text-emerald-400">KSh {acc.pricePerNight.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className="bg-white/10 text-stone-200 border border-white/10 font-bold px-2 py-0.5 rounded-md">
                        {accBookings.length}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-white font-mono">
                      KSh {accGross.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400 font-mono">
                      KSh {accPaid.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-medium text-amber-400 font-mono">
                      {accBalance > 0 ? `KSh ${accBalance.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          Number(accRate) >= 90
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                            : Number(accRate) >= 50
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                            : 'bg-white/10 text-stone-300 border-white/10'
                        }`}
                      >
                        {accRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Booking & Revenue Accounting Ledger */}
      <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden text-stone-100">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Itemized Booking & Revenue Ledger
            </h3>
            <p className="text-xs text-stone-300">
              Showing {filteredBookings.length} filtered records ready for CSV/PDF audit export.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs rounded-xl border border-white/15 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/60 text-stone-400 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
              <tr>
                <th className="p-3.5">Ref</th>
                <th className="p-3.5">Guest Contact</th>
                <th className="p-3.5">Accommodation</th>
                <th className="p-3.5">Stay Dates</th>
                <th className="p-3.5 text-right">Gross (KSh)</th>
                <th className="p-3.5 text-right">Paid (KSh)</th>
                <th className="p-3.5 text-right">Balance (KSh)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">M-Pesa Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-medium text-stone-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-400">
                    No bookings found matching the selected accounting filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {b.bookingRef}
                      {b.groupTripCode && (
                        <span className="block text-[9px] text-amber-300 font-sans">
                          Group: {b.groupTripCode}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{b.customerName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{b.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-stone-100 truncate max-w-[170px]">
                        {b.accommodationTitle}
                      </div>
                      <div className="text-[10px] text-emerald-400">{b.accommodationLocation}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-medium text-stone-200">
                        {b.checkInDate} to {b.checkOutDate}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {b.nights || 1} nights • Room {b.allocatedRoomNumber || 'Pending'}
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-black text-white font-mono">
                      KSh {b.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400 font-mono">
                      KSh {b.amountPaid.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono">
                      {b.balanceDue > 0 ? (
                        <span className="font-bold text-amber-400">
                          KSh {b.balanceDue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                          Cleared
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                          b.paymentStatus === 'fully_paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                            : b.paymentStatus === 'deposit_paid'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                            : 'bg-white/10 text-stone-300 border-white/10'
                        }`}
                      >
                        {b.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {b.mpesaTransactions && b.mpesaTransactions.length > 0 ? (
                        <div className="space-y-0.5 font-mono text-[10px]">
                          {b.mpesaTransactions.map((tx) => (
                            <span
                              key={tx.id}
                              className="inline-block bg-stone-950 border border-white/10 text-emerald-400 px-1.5 py-0.5 rounded mr-1"
                              title={`${tx.receiptNumber} - KSh ${tx.amount} on ${tx.timestamp}`}
                            >
                              {tx.receiptNumber}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-stone-500 text-[10px]">No receipts logged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredBookings.length > 0 && (
              <tfoot className="bg-stone-950/80 font-bold border-t border-white/15 text-stone-200">
                <tr>
                  <td className="p-3.5" colSpan={4}>
                    TOTALS ({filteredBookings.length} Bookings)
                  </td>
                  <td className="p-3.5 text-right font-black font-mono text-white">
                    KSh {totalGross.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-black text-emerald-400 font-mono">
                    KSh {totalCollected.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-black text-amber-400 font-mono">
                    KSh {totalReceivables.toLocaleString()}
                  </td>
                  <td className="p-3.5" colSpan={2}>
                    <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                      {collectionRate}% Realized
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* M-Pesa Daraja Cash Flow Audit Stream */}
      <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden text-stone-100">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Safaricom Daraja M-Pesa Collection Audit Stream
            </h3>
            <p className="text-xs text-stone-300">
              Verified STK Push receipts tied to customer booking installments.
            </p>
          </div>
          <button
            onClick={handleDownloadMpesaCSV}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-400/30 transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export M-Pesa Audit (CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/60 text-stone-400 font-bold uppercase tracking-wider border-b border-white/10 text-[10px]">
              <tr>
                <th className="p-3.5">M-Pesa Receipt</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Booking Ref</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Property</th>
                <th className="p-3.5 text-right">Amount (KSh)</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-medium text-stone-200 font-mono">
              {allMpesaTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-400 font-sans text-xs">
                    No M-Pesa transactions found for current filter.
                  </td>
                </tr>
              ) : (
                allMpesaTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold text-emerald-400">{tx.receiptNumber}</td>
                    <td className="p-3.5 text-stone-400 text-[11px]">{tx.timestamp}</td>
                    <td className="p-3.5 font-bold text-white">{tx.bookingRef}</td>
                    <td className="p-3.5 font-sans">
                      <div className="font-bold text-white">{tx.customerName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{tx.phoneNumber}</div>
                    </td>
                    <td className="p-3.5 font-sans text-stone-300 truncate max-w-[180px]">
                      {tx.accommodationTitle}
                    </td>
                    <td className="p-3.5 text-right font-black text-white font-mono">
                      KSh {tx.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-sans">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Verified (Code 0)
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT PREVIEW / PDF STATEMENT MODAL */}
      {printModalOpen && (
        <div className="fixed inset-0 z-70 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:fixed">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Modal Control Bar (Hidden when printing) */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black">Official Financial & Revenue Statement</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPrintModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Document Content */}
            <div className="p-8 sm:p-12 overflow-y-auto flex-1 space-y-6 text-stone-800 font-sans print:p-4">
              {/* Document Header */}
              <div className="border-b-2 border-emerald-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-700"></span>
                    <h1 className="text-xl font-black text-stone-950 tracking-tight">
                      POASTAY KENYA LIMITED
                    </h1>
                  </div>
                  <p className="text-xs text-stone-600">
                    Hospitality Channel Manager & Vacation Rental Ledger
                  </p>
                  <p className="text-xs text-stone-500">
                    P.O. Box 48291-00100 Nairobi, Kenya • The Mirage, Chiromo Road, Westlands
                  </p>
                  <p className="text-xs text-stone-500 font-mono">
                    KRA PIN: P051928374Z • Tel: +254 712 345 601
                  </p>
                </div>

                <div className="text-right sm:text-right space-y-1">
                  <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    Official Accounting Statement
                  </span>
                  <p className="text-xs font-mono font-bold text-stone-800">
                    Paybill: 882100 (Daraja Lipa Na M-Pesa)
                  </p>
                  <p className="text-xs text-stone-500">
                    Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-stone-500">
                    Audited by: Victor Omondi (Operations Manager)
                  </p>
                </div>
              </div>

              {/* Statement KPI Summary Box */}
              <div className="grid grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Gross Invoiced
                  </span>
                  <span className="text-base sm:text-lg font-black text-stone-900 font-mono mt-0.5 block">
                    KSh {totalGross.toLocaleString()}
                  </span>
                </div>
                <div className="border-x border-stone-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    M-Pesa Realized
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-900 font-mono mt-0.5 block">
                    KSh {totalCollected.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    Balance Receivables
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-900 font-mono mt-0.5 block">
                    KSh {totalReceivables.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Table of bookings */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  Audited Revenue Schedule ({filteredBookings.length} Bookings)
                </h4>
                <table className="w-full text-left text-xs border border-stone-200 border-collapse">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300 text-[10px]">
                    <tr>
                      <th className="p-2 border-r border-stone-200">Ref</th>
                      <th className="p-2 border-r border-stone-200">Customer</th>
                      <th className="p-2 border-r border-stone-200">Accommodation</th>
                      <th className="p-2 border-r border-stone-200">Dates</th>
                      <th className="p-2 border-r border-stone-200 text-right">Gross (KSh)</th>
                      <th className="p-2 border-r border-stone-200 text-right">Paid (KSh)</th>
                      <th className="p-2 text-right">Balance (KSh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="p-2 border-r border-stone-200 font-mono font-bold">
                          {b.bookingRef}
                        </td>
                        <td className="p-2 border-r border-stone-200">
                          {b.customerName}
                          <span className="block text-[10px] text-stone-500 font-mono">
                            {b.customerPhone}
                          </span>
                        </td>
                        <td className="p-2 border-r border-stone-200 truncate max-w-[150px]">
                          {b.accommodationTitle}
                        </td>
                        <td className="p-2 border-r border-stone-200 text-[11px] whitespace-nowrap">
                          {b.checkInDate} to {b.checkOutDate}
                        </td>
                        <td className="p-2 border-r border-stone-200 text-right font-mono font-bold">
                          {b.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-2 border-r border-stone-200 text-right font-mono text-emerald-800 font-bold">
                          {b.amountPaid.toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {b.balanceDue > 0 ? b.balanceDue.toLocaleString() : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-100 font-bold border-t-2 border-stone-300">
                    <tr>
                      <td colSpan={4} className="p-2 border-r border-stone-200">
                        TOTAL REVENUE INVOICED
                      </td>
                      <td className="p-2 border-r border-stone-200 text-right font-mono font-black">
                        KSh {totalGross.toLocaleString()}
                      </td>
                      <td className="p-2 border-r border-stone-200 text-right font-mono text-emerald-900 font-black">
                        KSh {totalCollected.toLocaleString()}
                      </td>
                      <td className="p-2 text-right font-mono text-amber-900 font-black">
                        KSh {totalReceivables.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures & Declaration */}
              <div className="pt-8 border-t border-stone-200 grid grid-cols-2 gap-8 text-xs text-stone-600">
                <div className="space-y-6">
                  <p className="text-[11px] italic">
                    "I hereby certify that the above bookings, room allotments, and M-Pesa collections represent true transactions processed through the PoaStay platform."
                  </p>
                  <div>
                    <div className="w-48 border-b border-stone-400 mb-1"></div>
                    <p className="font-bold text-stone-900">Victor Omondi</p>
                    <p className="text-[10px]">Operations & Finance Manager, PoaStay Kenya</p>
                  </div>
                </div>

                <div className="space-y-6 text-right">
                  <p className="text-[11px] text-stone-400 font-mono">
                    Digital Audit Stamp: {Date.now().toString(36).toUpperCase()}-KE-REV
                  </p>
                  <div>
                    <div className="w-48 border-b border-stone-400 mb-1 ml-auto"></div>
                    <p className="font-bold text-stone-900">Auditor & Finance Sign-Off</p>
                    <p className="text-[10px]">Certified for Kenya Revenue Authority Filings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
