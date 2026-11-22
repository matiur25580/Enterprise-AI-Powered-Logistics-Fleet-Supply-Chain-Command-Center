const { canViewFleetLocation } = require('../utils/fleetLocationPolicy');

describe('fleet live-location visibility', () => {
  test('allows only fleet operations roles to receive driver locations', () => {
    expect(canViewFleetLocation('Admin')).toBe(true);
    expect(canViewFleetLocation('FleetManager')).toBe(true);
  });

  test.each(['Driver', 'Client', 'Accountant', 'WarehouseManager', 'Unknown', undefined])(
    'denies live fleet location access to %s',
    (role) => {
      expect(canViewFleetLocation(role)).toBe(false);
    }
  );
});
