const { canTransitionTripStatus } = require('../utils/tripPolicy');

describe('trip status transitions', () => {
  test('allows only forward operational transitions and cancellation', () => {
    expect(canTransitionTripStatus('Scheduled', 'OnGoing')).toBe(true);
    expect(canTransitionTripStatus('Scheduled', 'Cancelled')).toBe(true);
    expect(canTransitionTripStatus('OnGoing', 'Delivered')).toBe(true);
    expect(canTransitionTripStatus('OnGoing', 'Cancelled')).toBe(true);
  });

  test('rejects regressions, no-op transitions, and changes to terminal trips', () => {
    expect(canTransitionTripStatus('Delivered', 'Scheduled')).toBe(false);
    expect(canTransitionTripStatus('Cancelled', 'OnGoing')).toBe(false);
    expect(canTransitionTripStatus('OnGoing', 'Scheduled')).toBe(false);
    expect(canTransitionTripStatus('Scheduled', 'Scheduled')).toBe(false);
    expect(canTransitionTripStatus('Unknown', 'Delivered')).toBe(false);
  });
});
