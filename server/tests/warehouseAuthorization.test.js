const { managerScope } = require('../routes/warehouse');

describe('warehouse manager data scope', () => {
  test('limits warehouse managers to warehouses assigned to their account', () => {
    const userId = '65f000000000000000000001';
    expect(managerScope({ role: 'WarehouseManager', _id: userId })).toEqual({ manager: userId });
  });

  test('allows administrators to manage warehouses across managers', () => {
    expect(managerScope({ role: 'Admin', _id: '65f000000000000000000002' })).toEqual({});
  });
});
