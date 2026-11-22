const { buildTripCreatePayload } = require('../utils/tripCreatePolicy');

describe('trip creation policy', () => {
  test('sets initial status on the server and ignores privileged client fields', () => {
    expect(buildTripCreatePayload({ vehicle: 'v1', driver: 'd1', status: 'Delivered', podUrl: 'https://evil.invalid/pod', createdAt: '2000-01-01' })).toEqual({ vehicle: 'v1', driver: 'd1', status: 'Scheduled' });
  });
  test('copies only supported trip fields', () => {
    expect(buildTripCreatePayload({ from: 'A', to: 'B', arbitrary: true })).toEqual({ from: 'A', to: 'B', status: 'Scheduled' });
  });
});
