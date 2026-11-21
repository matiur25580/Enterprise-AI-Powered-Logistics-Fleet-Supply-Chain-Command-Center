const { isPublicRegistrationRole } = require('../utils/publicRegistration');

test('public registration only permits client accounts', () => {
  expect(isPublicRegistrationRole('Client')).toBe(true);
  expect(isPublicRegistrationRole('Admin')).toBe(false);
  expect(isPublicRegistrationRole('FleetManager')).toBe(false);
  expect(isPublicRegistrationRole('WarehouseManager')).toBe(false);
  expect(isPublicRegistrationRole('Driver')).toBe(false);
  expect(isPublicRegistrationRole('Accountant')).toBe(false);
  expect(isPublicRegistrationRole(undefined)).toBe(false);
});
