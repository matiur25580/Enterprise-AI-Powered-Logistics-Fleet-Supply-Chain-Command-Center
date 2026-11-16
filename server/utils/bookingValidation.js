const BOOKING_STATUSES = ['Pending', 'Approved', 'Rejected', 'Confirmed', 'OnGoing', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid'];

function optionalText(value, maxLength) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length <= maxLength ? normalized : null;
}

function normalizeBookingInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const clientName = optionalText(input.clientName, 120);
  const email = optionalText(input.email, 254);
  const from = optionalText(input.from, 160);
  const to = optionalText(input.to, 160);
  const goods = optionalText(input.goods, 300);
  const weight = optionalText(input.weight, 80);
  if (!clientName || !from || !to || email === null || goods === null || weight === null) return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { clientName, email, from, to, goods, weight };
}

function isBookingStatus(value) { return BOOKING_STATUSES.includes(value); }
function isPaymentStatus(value) { return PAYMENT_STATUSES.includes(value); }

function parseNonNegativeAmount(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
  })[character]);
}

module.exports = { normalizeBookingInput, isBookingStatus, isPaymentStatus, parseNonNegativeAmount, escapeHtml };