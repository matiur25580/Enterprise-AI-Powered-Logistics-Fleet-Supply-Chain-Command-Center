const { buildDocumentExpiryUpdate } = require('../utils/documentPolicy');

describe('vehicle document expiry update policy', () => {
  test('accepts only supported expiry fields and converts values to dates', () => {
    const result = buildDocumentExpiryUpdate({
      insuranceExpiry: '2027-04-30',
      fitnessExpiry: '2027-05-30',
      status: 'Maintenance',
      driver: '65f000000000000000000001',
    });
    expect(result.error).toBeUndefined();
    expect(result.update.insuranceExpiry).toBeInstanceOf(Date);
    expect(result.update.fitnessExpiry).toBeInstanceOf(Date);
    expect(result.update.status).toBeUndefined();
    expect(result.update.driver).toBeUndefined();
  });

  test('allows explicitly clearing an expiry date', () => {
    expect(buildDocumentExpiryUpdate({ permitExpiry: null }).update).toEqual({ permitExpiry: null });
  });

  test('rejects invalid date values and object injection', () => {
    expect(buildDocumentExpiryUpdate({ insuranceExpiry: 'not-a-date' }).error).toMatch(/valid date/);
    expect(buildDocumentExpiryUpdate({ pollutionExpiry: { $ne: null } }).error).toMatch(/valid date/);
  });

  test('rejects requests without supported expiry fields', () => {
    expect(buildDocumentExpiryUpdate({ status: 'Active' }).error).toMatch(/No supported/);
  });
});
