const { normalizeBookingInput, isBookingStatus, isPaymentStatus, parseNonNegativeAmount, escapeHtml } = require('../utils/bookingValidation');

test('booking input keeps only validated, bounded fields', () => {
  expect(normalizeBookingInput({ clientName: ' Ada ', email: 'ada@example.com', from: ' London ', to: 'Paris', goods: 'Books', weight: '10kg', status: 'Delivered', amount: 999 })).toEqual({
    clientName: 'Ada', email: 'ada@example.com', from: 'London', to: 'Paris', goods: 'Books', weight: '10kg'
  });
  expect(normalizeBookingInput({ clientName: '', from: 'A', to: 'B' })).toBeNull();
  expect(normalizeBookingInput({ clientName: 'Ada', email: 'not-an-email', from: 'A', to: 'B' })).toBeNull();
  expect(normalizeBookingInput({ clientName: 'x'.repeat(121), from: 'A', to: 'B' })).toBeNull();
});

test('booking and payment status values must be from the supported sets', () => {
  expect(isBookingStatus('Delivered')).toBe(true);
  expect(isBookingStatus('RootAccess')).toBe(false);
  expect(isPaymentStatus('Partial')).toBe(true);
  expect(isPaymentStatus('Refunded')).toBe(false);
});

test('billing amounts reject negative, non-finite, and non-numeric values', () => {
  expect(parseNonNegativeAmount('125.50')).toBe(125.5);
  expect(parseNonNegativeAmount(0)).toBe(0);
  expect(parseNonNegativeAmount(-1)).toBeNull();
  expect(parseNonNegativeAmount('Infinity')).toBeNull();
  expect(parseNonNegativeAmount('abc')).toBeNull();
});

test('email HTML escaping prevents user-supplied markup from being interpreted', () => {
  expect(escapeHtml('<script a="b">Tom & \'Ada\'</script>')).toBe('&lt;script a=&quot;b&quot;&gt;Tom &amp; &#39;Ada&#39;&lt;/script&gt;');
});