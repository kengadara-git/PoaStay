import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking, Accommodation } from '../types';

export interface AccountingReportFilters {
  dateRange: string;
  propertyId: string;
  paymentStatus: string;
  searchQuery: string;
}

// Format currency
export const formatKsh = (amount: number): string => {
  return `KSh ${amount.toLocaleString()}`;
};

// Filter bookings for reports
export const filterBookingsForReport = (
  bookings: Booking[],
  filters: AccountingReportFilters
): Booking[] => {
  return bookings.filter((b) => {
    // Property match
    if (filters.propertyId !== 'all' && b.accommodationId !== filters.propertyId) {
      return false;
    }

    // Payment status match
    if (filters.paymentStatus !== 'all' && b.paymentStatus !== filters.paymentStatus) {
      return false;
    }

    // Search query match (ref, customer name, phone)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        b.bookingRef.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.accommodationTitle.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const checkIn = new Date(b.checkInDate).getTime();
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (filters.dateRange === 'upcoming') {
        if (checkIn < now - oneDay) return false;
      } else if (filters.dateRange === 'past') {
        if (checkIn >= now - oneDay) return false;
      } else if (filters.dateRange === 'this_month') {
        const d = new Date(b.checkInDate);
        const curDate = new Date();
        if (d.getMonth() !== curDate.getMonth() || d.getFullYear() !== curDate.getFullYear()) {
          return false;
        }
      }
    }

    return true;
  });
};

/**
 * Generate and download CSV report for Bookings and Revenue
 */
export const downloadBookingsCSV = (
  bookings: Booking[],
  reportTitle = 'PoaStay_Booking_Revenue_Ledger'
) => {
  const headers = [
    'Booking Reference',
    'Date Created',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Accommodation Title',
    'Location',
    'Check-in Date',
    'Check-out Date',
    'Nights',
    'Units Booked',
    'Gross Invoiced (KSh)',
    'Amount Paid (KSh)',
    'Balance Due (KSh)',
    'Payment Status',
    'Booking Status',
    'Allocated Room',
    'Assigned Coordinator',
    'Group Code',
    'M-Pesa Receipts',
  ];

  let totalGross = 0;
  let totalPaid = 0;
  let totalBalance = 0;

  const rows = bookings.map((b) => {
    totalGross += b.totalAmount || 0;
    totalPaid += b.amountPaid || 0;
    totalBalance += b.balanceDue || 0;

    const receipts = (b.mpesaTransactions || [])
      .map((tx) => `${tx.receiptNumber} (${tx.amount})`)
      .join('; ');

    return [
      `"${b.bookingRef}"`,
      `"${b.createdAt || ''}"`,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.customerPhone}"`,
      `"${b.customerEmail || ''}"`,
      `"${b.accommodationTitle.replace(/"/g, '""')}"`,
      `"${b.accommodationLocation.replace(/"/g, '""')}"`,
      `"${b.checkInDate}"`,
      `"${b.checkOutDate}"`,
      b.nights || 1,
      b.unitsBooked || 1,
      b.totalAmount,
      b.amountPaid,
      b.balanceDue,
      `"${b.paymentStatus}"`,
      `"${b.bookingStatus}"`,
      `"${b.allocatedRoomNumber || 'Pending'}"`,
      `"${b.assignedStaffName || 'Unassigned'}"`,
      `"${b.groupTripCode || 'N/A'}"`,
      `"${receipts}"`,
    ].join(',');
  });

  // Append Total Row
  const totalRow = [
    '"SUMMARY TOTALS"',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
    totalGross,
    totalPaid,
    totalBalance,
    '""',
    '""',
    '""',
    '""',
    '""',
    '""',
  ].join(',');

  const csvContent = '\uFEFF' + [headers.join(','), ...rows, totalRow].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${reportTitle}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate and download CSV report for M-Pesa Cash Flow Ledger
 */
export const downloadMpesaCashflowCSV = (bookings: Booking[]) => {
  const headers = [
    'M-Pesa Receipt No',
    'Timestamp',
    'Booking Reference',
    'Customer Name',
    'Customer Phone',
    'Accommodation',
    'Amount Collected (KSh)',
    'Payment Channel',
    'Daraja Status',
  ];

  let totalCollected = 0;
  const rows: string[] = [];

  bookings.forEach((b) => {
    (b.mpesaTransactions || []).forEach((tx) => {
      totalCollected += tx.amount || 0;
      rows.push(
        [
          `"${tx.receiptNumber}"`,
          `"${tx.timestamp}"`,
          `"${b.bookingRef}"`,
          `"${b.customerName.replace(/"/g, '""')}"`,
          `"${tx.phoneNumber || b.customerPhone}"`,
          `"${b.accommodationTitle.replace(/"/g, '""')}"`,
          tx.amount,
          '"Safaricom Lipa Na M-Pesa Online (Daraja STK)"',
          '"COMPLETED (ResultCode 0)"',
        ].join(',')
      );
    });
  });

  const totalRow = [
    '"TOTAL M-PESA COLLECTIONS"',
    '""',
    '""',
    '""',
    '""',
    '""',
    totalCollected,
    '""',
    '""',
  ].join(',');

  const csvContent = '\uFEFF' + [headers.join(','), ...rows, totalRow].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `PoaStay_Mpesa_Cashflow_Audit_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate and download PDF Accounting & Revenue Statement using jsPDF and AutoTable
 */
export const downloadBookingsPDF = (
  bookings: Booking[],
  accommodations: Accommodation[],
  reportTitle = 'PoaStay Kenya Financial & Revenue Accounting Statement'
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate totals
  const totalGross = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalBalance = bookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const collectionRate = totalGross > 0 ? ((totalPaid / totalGross) * 100).toFixed(1) : '100.0';

  // --- BRAND HEADER ---
  // Emerald top brand stripe
  doc.setFillColor(6, 78, 59); // emerald-900
  doc.rect(0, 0, 842, 60, 'F');

  // Gold accent line
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 60, 842, 4, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('POASTAY KENYA — ACCOMMODATION CHANNEL MANAGER', 36, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(209, 250, 229);
  doc.text('OFFICIAL OPERATIONS & ACCOUNTING AUDIT STATEMENT', 36, 44);

  // Top Right Info
  doc.setFontSize(8);
  doc.setTextColor(245, 158, 11);
  doc.text('LIPA NA M-PESA DARAJA PAYBILL: 882100', 600, 24);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, 600, 38);
  doc.text('Audited for: Management & KRA Tax Filings', 600, 50);

  // --- REPORT TITLE & METADATA ---
  doc.setTextColor(28, 25, 23); // stone-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(reportTitle.toUpperCase(), 36, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(87, 83, 78); // stone-600
  doc.text(
    `Entity: PoaStay Hospitality Tech Kenya Ltd • P.O. Box 48291-00100 Nairobi • KRA PIN: P051928374Z`,
    36,
    98
  );

  // --- EXECUTIVE SUMMARY KPI BOXES ---
  // Box 1: Gross Invoiced
  doc.setFillColor(245, 245, 244); // stone-100
  doc.roundedRect(36, 110, 175, 48, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108);
  doc.text('GROSS INVOICED BOOKINGS', 46, 124);
  doc.setFontSize(13);
  doc.setTextColor(28, 25, 23);
  doc.text(`KSh ${totalGross.toLocaleString()}`, 46, 144);

  // Box 2: Total Collected
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.roundedRect(226, 110, 175, 48, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('M-PESA COLLECTIONS RECEIVED', 236, 124);
  doc.setFontSize(13);
  doc.setTextColor(6, 78, 59);
  doc.text(`KSh ${totalPaid.toLocaleString()}`, 236, 144);

  // Box 3: Receivables Due
  doc.setFillColor(254, 243, 199); // amber-50
  doc.roundedRect(416, 110, 175, 48, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('OUTSTANDING INSTALLMENT RECEIVABLES', 426, 124);
  doc.setFontSize(13);
  doc.setTextColor(146, 64, 14);
  doc.text(`KSh ${totalBalance.toLocaleString()}`, 426, 144);

  // Box 4: Collection Rate & Counts
  doc.setFillColor(245, 245, 244);
  doc.roundedRect(606, 110, 200, 48, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108);
  doc.text('COLLECTION RATE & VOLUME', 616, 124);
  doc.setFontSize(13);
  doc.setTextColor(28, 25, 23);
  doc.text(`${collectionRate}% (${bookings.length} Bookings)`, 616, 144);

  // --- BOOKING SCHEDULE TABLE ---
  const tableData = bookings.map((b) => [
    b.bookingRef,
    b.customerName,
    b.customerPhone,
    b.accommodationTitle,
    `${b.checkInDate} to ${b.checkOutDate}`,
    b.allocatedRoomNumber || 'Pending',
    `KSh ${b.totalAmount.toLocaleString()}`,
    `KSh ${b.amountPaid.toLocaleString()}`,
    `KSh ${b.balanceDue.toLocaleString()}`,
    b.paymentStatus.toUpperCase().replace('_', ' '),
  ]);

  autoTable(doc, {
    startY: 172,
    head: [
      [
        'Ref',
        'Customer',
        'Phone',
        'Accommodation',
        'Stay Dates',
        'Unit/Room',
        'Total',
        'Collected',
        'Balance Due',
        'Payment Status',
      ],
    ],
    body: tableData,
    foot: [
      [
        'TOTALS',
        `${bookings.length} Bookings`,
        '-',
        '-',
        '-',
        '-',
        `KSh ${totalGross.toLocaleString()}`,
        `KSh ${totalPaid.toLocaleString()}`,
        `KSh ${totalBalance.toLocaleString()}`,
        `${collectionRate}% Paid`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // stone-800
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 80 },
      2: { cellWidth: 70 },
      3: { cellWidth: 120 },
      4: { cellWidth: 85 },
      5: { cellWidth: 60 },
      6: { halign: 'right', fontStyle: 'bold', cellWidth: 75 },
      7: { halign: 'right', cellWidth: 75 },
      8: { halign: 'right', cellWidth: 75 },
      9: { cellWidth: 70 },
    },
    margin: { left: 36, right: 36 },
  });

  // --- FOOTER & SIGN-OFF ---
  const finalY = (doc as any).lastAutoTable?.finalY || 450;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (finalY + 70 < pageHeight) {
    // Add signature block
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);

    doc.line(36, finalY + 45, 200, finalY + 45);
    doc.text('Victor Omondi — Operations Manager', 36, finalY + 55);
    doc.text('Authorized Finance Signatory', 36, finalY + 65);

    doc.line(550, finalY + 45, 750, finalY + 45);
    doc.text('Internal Auditor / Chief Accountant', 550, finalY + 55);
    doc.text('Certified for Kenya Revenue Authority (KRA)', 550, finalY + 65);
  }

  // Save the PDF
  const filename = `PoaStay_Accounting_Report_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
