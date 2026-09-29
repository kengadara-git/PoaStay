import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  AreaChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Booking, Accommodation } from '../../types';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Building,
  DollarSign,
  Smartphone,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ManagerChartsSectionProps {
  bookings: Booking[];
  accommodations: Accommodation[];
  onNavigateToReports?: () => void;
}

type TimeframeScope = 'all' | '2026' | 'last6' | 'h1' | 'h2';
type ActiveChartView = 'combined' | 'volume' | 'property' | 'collection_rate';

// Kenyan safari & coastal brand colors
const BRAND_COLORS = [
  '#059669', // Emerald
  '#d97706', // Amber
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#ea580c', // Orange
];

export const ManagerChartsSection: React.FC<ManagerChartsSectionProps> = ({
  bookings,
  accommodations,
  onNavigateToReports,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeScope>('2026');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [activeView, setActiveView] = useState<ActiveChartView>('combined');

  // Interactive series visibility toggles
  const [showGross, setShowGross] = useState(true);
  const [showCollected, setShowCollected] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  // Month labels helper
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Process and aggregate bookings by month
  const monthlyData = useMemo(() => {
    // Initialize standard 12 months for 2026
    const monthsMap: Record<
      string,
      {
        monthKey: string;
        monthLabel: string;
        monthIndex: number;
        grossRevenue: number;
        collectedRevenue: number;
        balanceDue: number;
        bookingCount: number;
        nightsCount: number;
        guestsCount: number;
        avgBookingValue: number;
        collectionRate: number;
      }
    > = {};

    for (let i = 0; i < 12; i++) {
      const key = `2026-${String(i + 1).padStart(2, '0')}`;
      monthsMap[key] = {
        monthKey: key,
        monthLabel: monthNames[i],
        monthIndex: i,
        grossRevenue: 0,
        collectedRevenue: 0,
        balanceDue: 0,
        bookingCount: 0,
        nightsCount: 0,
        guestsCount: 0,
        avgBookingValue: 0,
        collectionRate: 100,
      };
    }

    // Filter by property if selected
    const filteredByProperty =
      selectedPropertyId === 'all'
        ? bookings
        : bookings.filter((b) => b.accommodationId === selectedPropertyId);

    // Aggregate bookings
    filteredByProperty.forEach((b) => {
      const dateStr = b.checkInDate || b.createdAt;
      if (!dateStr) return;
      const [year, month] = dateStr.split('-');
      const key = `${year}-${month}`;

      if (!monthsMap[key]) {
        const mIdx = parseInt(month, 10) - 1;
        monthsMap[key] = {
          monthKey: key,
          monthLabel: monthNames[mIdx] ? `${monthNames[mIdx]} '${year.slice(2)}` : key,
          monthIndex: mIdx,
          grossRevenue: 0,
          collectedRevenue: 0,
          balanceDue: 0,
          bookingCount: 0,
          nightsCount: 0,
          guestsCount: 0,
          avgBookingValue: 0,
          collectionRate: 100,
        };
      }

      const gross = b.totalAmount || 0;
      const paid = b.amountPaid || 0;
      const due = b.balanceDue || 0;
      const nights = b.nights || 1;
      const guests = b.guests || 1;

      monthsMap[key].grossRevenue += gross;
      monthsMap[key].collectedRevenue += paid;
      monthsMap[key].balanceDue += due;
      monthsMap[key].bookingCount += 1;
      monthsMap[key].nightsCount += nights;
      monthsMap[key].guestsCount += guests;
    });

    // Calculate rates and averages
    Object.values(monthsMap).forEach((m) => {
      m.avgBookingValue =
        m.bookingCount > 0 ? Math.round(m.grossRevenue / m.bookingCount) : 0;
      m.collectionRate =
        m.grossRevenue > 0
          ? Math.round((m.collectedRevenue / m.grossRevenue) * 100)
          : 100;
    });

    // Convert to sorted array
    const sorted = Object.values(monthsMap).sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey)
    );

    // Filter by timeframe
    if (timeframe === '2026') {
      return sorted.filter((d) => d.monthKey.startsWith('2026'));
    }
    if (timeframe === 'last6') {
      // Return July to December 2026 or last 6 months
      return sorted.slice(sorted.length - 6);
    }
    if (timeframe === 'h1') {
      return sorted.filter((d) => {
        const m = parseInt(d.monthKey.split('-')[1], 10);
        return m >= 1 && m <= 6;
      });
    }
    if (timeframe === 'h2') {
      return sorted.filter((d) => {
        const m = parseInt(d.monthKey.split('-')[1], 10);
        return m >= 7 && m <= 12;
      });
    }

    return sorted;
  }, [bookings, selectedPropertyId, timeframe]);

  // Aggregate property breakdown for Donut chart
  const propertyShareData = useMemo(() => {
    const propMap: Record<
      string,
      { id: string; name: string; location: string; revenue: number; bookings: number }
    > = {};

    accommodations.forEach((acc) => {
      propMap[acc.id] = {
        id: acc.id,
        name: acc.title,
        location: acc.location,
        revenue: 0,
        bookings: 0,
      };
    });

    bookings.forEach((b) => {
      const gross = b.totalAmount || 0;
      if (propMap[b.accommodationId]) {
        propMap[b.accommodationId].revenue += gross;
        propMap[b.accommodationId].bookings += 1;
      } else {
        propMap[b.accommodationId] = {
          id: b.accommodationId,
          name: b.accommodationTitle,
          location: b.accommodationLocation || 'Kenya',
          revenue: gross,
          bookings: 1,
        };
      }
    });

    return Object.values(propMap)
      .filter((p) => p.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [bookings, accommodations]);

  // Executive high-level calculations
  const totalRevenue = useMemo(
    () => monthlyData.reduce((sum, d) => sum + d.grossRevenue, 0),
    [monthlyData]
  );
  const totalCollections = useMemo(
    () => monthlyData.reduce((sum, d) => sum + d.collectedRevenue, 0),
    [monthlyData]
  );
  const totalBookingsCount = useMemo(
    () => monthlyData.reduce((sum, d) => sum + d.bookingCount, 0),
    [monthlyData]
  );
  const totalNightsCount = useMemo(
    () => monthlyData.reduce((sum, d) => sum + d.nightsCount, 0),
    [monthlyData]
  );
  const overallAvgBooking = useMemo(
    () => (totalBookingsCount > 0 ? Math.round(totalRevenue / totalBookingsCount) : 0),
    [totalRevenue, totalBookingsCount]
  );

  // Peak month identifier
  const peakMonth = useMemo(() => {
    if (monthlyData.length === 0) return null;
    return [...monthlyData].sort((a, b) => b.grossRevenue - a.grossRevenue)[0];
  }, [monthlyData]);

  // Custom Tooltip Formatter
  const CustomCombinedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white p-3.5 rounded-2xl shadow-xl border border-stone-700 text-xs min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <span className="font-extrabold text-amber-400 text-sm">
              {dataPoint.monthLabel} 2026
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              {dataPoint.bookingCount} reservation{dataPoint.bookingCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-stone-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                Gross Invoiced:
              </span>
              <strong className="text-white font-mono">
                KSh {dataPoint.grossRevenue.toLocaleString()}
              </strong>
            </div>

            <div className="flex justify-between items-center text-stone-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                M-Pesa Received:
              </span>
              <strong className="text-emerald-400 font-mono">
                KSh {dataPoint.collectedRevenue.toLocaleString()}
              </strong>
            </div>

            {dataPoint.balanceDue > 0 && (
              <div className="flex justify-between items-center text-stone-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                  Receivable Balance:
                </span>
                <strong className="text-rose-300 font-mono">
                  KSh {dataPoint.balanceDue.toLocaleString()}
                </strong>
              </div>
            )}
          </div>

          <div className="pt-1.5 border-t border-stone-800 flex justify-between items-center text-[11px] text-stone-400">
            <span>Room Nights: {dataPoint.nightsCount}</span>
            <span className="font-bold text-emerald-400">
              {dataPoint.collectionRate}% collected
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Charts Section Header & Controls */}
      <div className="bg-stone-900/80 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
              <BarChart3 className="w-3 h-3 text-amber-400" />
              Dynamic Performance Insights
            </span>
            <span className="text-xs text-stone-400 font-medium">Visualizing 2026 Trends</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            Monthly Revenue & Booking Volume Analytics
          </h2>
          <p className="text-xs text-stone-300 max-w-xl">
            Interactive multi-month graphical trends replacing static table reports. Compare gross billing, Safaricom M-Pesa receipts, and customer booking velocity.
          </p>
        </div>

        {/* View Switcher & Timeframe controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Buttons */}
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl flex items-center gap-0.5 border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveView('combined')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeView === 'combined'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Revenue & Volume
            </button>
            <button
              onClick={() => setActiveView('volume')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeView === 'volume'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Booking Volume
            </button>
            <button
              onClick={() => setActiveView('property')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeView === 'property'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              By Property
            </button>
            <button
              onClick={() => setActiveView('collection_rate')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeView === 'collection_rate'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Cashflow Rate
            </button>
          </div>

          {/* Timeframe Scope Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as TimeframeScope)}
            className="px-3 py-2 bg-stone-950/80 border border-white/15 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
          >
            <option value="2026">Full Year 2026 (Jan - Dec)</option>
            <option value="last6">Recent 6 Months</option>
            <option value="h1">Q1 & Q2 (Jan - Jun)</option>
            <option value="h2">Q3 & Q4 (Jul - Dec)</option>
            <option value="all">All Available Records</option>
          </select>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Invoiced */}
        <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl space-y-1 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Total Invoiced Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            KSh {totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across selected period</span>
          </div>
        </div>

        {/* Total Realized Collections */}
        <div className="bg-emerald-950/40 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-emerald-500/30 shadow-xl space-y-1 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              M-Pesa Realized Cash
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
            KSh {totalCollections.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {totalRevenue > 0
              ? `${((totalCollections / totalRevenue) * 100).toFixed(1)}% realization rate`
              : '100%'}
          </div>
        </div>

        {/* Total Reservations & Nights */}
        <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl space-y-1 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Booking Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-stone-300 flex items-center justify-center border border-white/10">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {totalBookingsCount}{' '}
            <span className="text-xs font-semibold text-stone-400">reservations</span>
          </div>
          <div className="text-[11px] text-stone-400 font-medium">
            {totalNightsCount} occupied guest nights
          </div>
        </div>

        {/* Peak Performance Indicator */}
        <div className="bg-stone-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl space-y-1 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Peak Revenue Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-stone-300 flex items-center justify-center border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {peakMonth ? `${peakMonth.monthLabel} 2026` : '—'}
          </div>
          <div className="text-[11px] text-amber-400 font-mono">
            {peakMonth ? `KSh ${peakMonth.grossRevenue.toLocaleString()}` : '—'}
          </div>
        </div>
      </div>

      {/* Interactive Property Filter & Series Toggles Bar */}
      <div className="bg-stone-900/80 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs text-white">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-300 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Filter Property Scope:
          </span>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="px-3 py-1.5 bg-stone-950/80 border border-white/15 rounded-xl font-medium text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Properties ({accommodations.length})</option>
            {accommodations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.location})
              </option>
            ))}
          </select>
        </div>

        {/* Toggles for series */}
        {activeView === 'combined' && (
          <div className="flex items-center gap-3">
            <span className="text-stone-400 font-semibold text-[11px]">Series:</span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showGross}
                onChange={(e) => setShowGross(e.target.checked)}
                className="rounded border-white/30 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 bg-stone-800"
              />
              <span className="font-medium text-stone-200">Gross Invoiced</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCollected}
                onChange={(e) => setShowCollected(e.target.checked)}
                className="rounded border-white/30 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 bg-stone-800"
              />
              <span className="font-medium text-stone-200">M-Pesa Received</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="rounded border-white/30 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 bg-stone-800"
              />
              <span className="font-medium text-stone-200">Booking Volume Line</span>
            </label>
          </div>
        )}
      </div>

      {/* MAIN CHART CONTAINER */}
      <div className="bg-stone-900/85 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4 text-white">
        {/* CHART 1: COMBINED REVENUE & VOLUME (Dual Axis) */}
        {activeView === 'combined' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Monthly Revenue (KSh) & Reservation Volume Trend
                </h3>
                <p className="text-xs text-stone-300">
                  Bars represent financial cashflow (left axis in KSh); line depicts reservation count (right axis).
                </p>
              </div>
              <div className="text-[11px] text-stone-400 font-mono">
                Avg Booking Value: KSh {overallAvgBooking.toLocaleString()}
              </div>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    dy={10}
                  />
                  {/* Left Axis: Currency KSh */}
                  <YAxis
                    yAxisId="left"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}k`
                        : `${val}`
                    }
                  />
                  {/* Right Axis: Reservation Count */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#60a5fa"
                    fontSize={10}
                    tickLine={false}
                    allowDecimals={false}
                    tickFormatter={(val) => `${val} bks`}
                  />
                  <Tooltip content={<CustomCombinedTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px', color: '#cbd5e1' }}
                  />

                  {/* Gross Invoiced Bar */}
                  {showGross && (
                    <Bar
                      yAxisId="left"
                      dataKey="grossRevenue"
                      name="Gross Invoiced (KSh)"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  )}

                  {/* Realized M-Pesa Bar */}
                  {showCollected && (
                    <Bar
                      yAxisId="left"
                      dataKey="collectedRevenue"
                      name="M-Pesa Received (KSh)"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  )}

                  {/* Volume Trend Line */}
                  {showVolume && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bookingCount"
                      name="Booking Volume"
                      stroke="#60a5fa"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#60a5fa', strokeWidth: 1, stroke: '#ffffff' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: BOOKING VOLUME & GUEST NIGHTS */}
        {activeView === 'volume' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Monthly Booking Frequency & Occupied Room Nights
                </h3>
                <p className="text-xs text-stone-300">
                  Monitor seasonality peaks (Easter April, Great Migration July-August, Jamhuri & New Year December).
                </p>
              </div>
              <div className="text-[11px] text-stone-400 font-mono">
                Total: {totalBookingsCount} bookings / {totalNightsCount} nights
              </div>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      value,
                      name === 'bookingCount' ? 'Bookings' : 'Guest Nights',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0c0a09',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '11px',
                      border: '1px solid #334155',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                  />
                  <Bar
                    dataKey="bookingCount"
                    name="Reservations"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="nightsCount"
                    name="Guest Nights"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: PROPERTY REVENUE SHARE (Donut & Breakdown) */}
        {activeView === 'property' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Revenue Share by Destination & Property
                </h3>
                <p className="text-xs text-stone-300">
                  Breakdown of gross revenue generated across coastal villas, safari camps, and Rift Valley cottages.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart */}
              <div className="lg:col-span-5 h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyShareData}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {propertyShareData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BRAND_COLORS[index % BRAND_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        `KSh ${Number(val).toLocaleString()}`,
                        'Revenue',
                      ]}
                      contentStyle={{
                        backgroundColor: '#0c0a09',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '11px',
                        border: '1px solid #334155',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Property Details Ledger Table */}
              <div className="lg:col-span-7 space-y-2">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Destination Revenue Ranking
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {propertyShareData.map((prop, idx) => {
                    const percent =
                      totalRevenue > 0
                        ? ((prop.revenue / totalRevenue) * 100).toFixed(1)
                        : '0';
                    const color = BRAND_COLORS[idx % BRAND_COLORS.length];

                    return (
                      <div
                        key={prop.id}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between gap-3 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="truncate">
                            <h4 className="font-bold text-white truncate">
                              {prop.name}
                            </h4>
                            <span className="text-[10px] text-stone-400">
                              {prop.location} • {prop.bookings} booking{prop.bookings !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-black text-amber-400 font-mono">
                            KSh {prop.revenue.toLocaleString()}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/30">
                            {percent}% of total
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHART 4: CASHFLOW COLLECTION RATE (Area Chart) */}
        {activeView === 'collection_rate' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  M-Pesa Installment Realization Rate (%)
                </h3>
                <p className="text-xs text-stone-300">
                  Percentage of invoiced billing successfully cleared into PoaStay's Safaricom Paybill (882100).
                </p>
              </div>
              <div className="text-[11px] text-emerald-300 font-bold bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-400/30">
                Target: &gt;85% collection efficiency
              </div>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
                >
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'Collection Realization']}
                    contentStyle={{
                      backgroundColor: '#0c0a09',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '11px',
                      border: '1px solid #334155',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="collectionRate"
                    name="Collection Realization"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Link to Full Accounting Report */}
      {onNavigateToReports && (
        <div className="p-4 bg-stone-900 text-white rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Need official audit statements or KRA tax compliant ledgers?
            </span>
          </div>
          <button
            onClick={onNavigateToReports}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            View Official Accounting Ledgers & Export CSV/PDF
          </button>
        </div>
      )}
    </div>
  );
};
