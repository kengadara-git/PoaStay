import { Booking } from '../types';

export type WhatsAppAlertTriggerType = 'booking_confirmation' | 'payment_reminder';

export interface WhatsAppTriggerResult {
  success: boolean;
  messageId: string;
  triggerType: WhatsAppAlertTriggerType;
  recipientName: string;
  recipientPhone: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered';
  directWhatsAppUrl: string;
}

/**
 * Builds the authentic Kenyan WhatsApp message text for booking confirmations and payment reminders.
 */
export const buildWhatsAppMessage = (
  type: WhatsAppAlertTriggerType,
  booking: Booking,
  coordinatorName = 'Faith Chepkemoi',
  coordinatorPhone = '+254 712 345 601'
): string => {
  const staffName = booking.assignedStaffName || coordinatorName;
  const cleanPhone = booking.customerPhone.replace(/[^0-9]/g, '');

  if (type === 'booking_confirmation') {
    const transportDesc = booking.transportOption
      ? `${booking.transportOption.name}${
          booking.transportOption.vehicleReg ? ` (${booking.transportOption.vehicleReg})` : ''
        }`
      : 'Self-Drive (Secured parking reserved)';

    const roomDesc =
      booking.allocatedRoomNumber && !booking.allocatedRoomNumber.toLowerCase().includes('in progress')
        ? booking.allocatedRoomNumber
        : 'Unit allocation in progress by coordinator';

    const latestReceipt = booking.mpesaTransactions && booking.mpesaTransactions.length > 0
      ? booking.mpesaTransactions[booking.mpesaTransactions.length - 1].receiptNumber
      : 'QKJ89420KL';

    return (
      `Habari ${booking.customerName}! ✨\n\n` +
      `Your PoaStay reservation for *${booking.accommodationTitle}* is CONFIRMED.\n\n` +
      `📋 *Booking Reference:* ${booking.bookingRef}\n` +
      `📅 *Stay Dates:* ${booking.checkInDate} to ${booking.checkOutDate} (${booking.nights} Nights, ${booking.guests} Guests)\n` +
      `🔑 *Allocated Unit:* ${roomDesc}\n` +
      `🚗 *Transport Logistics:* ${transportDesc}\n` +
      `💳 *Deposit Paid via M-Pesa:* KSh ${booking.amountPaid.toLocaleString()} (Receipt: ${latestReceipt})\n` +
      `${
        booking.balanceDue > 0
          ? `💰 *Pending Installment Balance:* KSh ${booking.balanceDue.toLocaleString()} (Clearing before check-in)\n`
          : `✅ *Payment:* Fully cleared in full!\n`
      }\n` +
      `Your dedicated on-site coordinator is *${staffName}* (${coordinatorPhone}).\n\n` +
      `Karibu sana PoaStay Kenya! 🇰🇪`
    );
  }

  // Payment Reminder template
  const checkInDateObj = new Date(booking.checkInDate);
  const today = new Date();
  const diffDays = Math.max(
    1,
    Math.ceil((checkInDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    `Habari ${booking.customerName}! 🌴\n\n` +
    `Friendly payment reminder from PoaStay Kenya regarding your upcoming stay at *${booking.accommodationTitle}*.\n\n` +
    `📋 *Booking Reference:* ${booking.bookingRef}\n` +
    `📅 *Check-in Date:* ${booking.checkInDate} (in ${diffDays} days)\n` +
    `💵 *Remaining Balance Due:* *KSh ${booking.balanceDue.toLocaleString()}*\n` +
    `📊 *Total Amount:* KSh ${booking.totalAmount.toLocaleString()} | *Paid to Date:* KSh ${booking.amountPaid.toLocaleString()}\n\n` +
    `To clear your remaining balance via Lipa Na M-Pesa Online STK Push, log into your traveler portal or reply to this message for assistance.\n\n` +
    `Concierge Support: ${staffName} (${coordinatorPhone}). Asante sana!`
  );
};

/**
 * Simulates an automated WhatsApp Business API trigger.
 * Generates an official WhatsApp Message ID (wamid), creates the timestamp,
 * and formats the direct WhatsApp click-to-chat URL.
 */
export const simulateWhatsAppApiTrigger = (
  type: WhatsAppAlertTriggerType,
  booking: Booking,
  coordinatorName = 'Faith Chepkemoi',
  coordinatorPhone = '+254 712 345 601'
): WhatsAppTriggerResult => {
  const message = buildWhatsAppMessage(type, booking, coordinatorName, coordinatorPhone);
  const cleanPhone = booking.customerPhone.replace(/[^0-9]/g, '');

  const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();
  const messageId = `wamid.HBgLMjU0Nz${randomHash}==`;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

  const directWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return {
    success: true,
    messageId,
    triggerType: type,
    recipientName: booking.customerName,
    recipientPhone: booking.customerPhone,
    message,
    timestamp: `${dateStr} ${timeStr}`,
    status: 'delivered',
    directWhatsAppUrl,
  };
};
