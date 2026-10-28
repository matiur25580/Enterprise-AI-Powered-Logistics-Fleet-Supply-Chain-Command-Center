const { forecast } = require('../utils/forecast');
test('returns 7 numbers by default', () => {
  const r = forecast([3,5,4,6,8]);
  expect(r).toHaveLength(7);
  r.forEach(v => expect(typeof v).toBe('number'));
});
test('empty input gives all zeros', () => {
  expect(forecast([])).toEqual([0,0,0,0,0,0,0]);
});
test('rising trend forecasts rising values', () => {
  const r = forecast([1,2,3,4,5,6,7]);
  expect(r[6]).toBeGreaterThanOrEqual(r[0]);
});
test('never forecasts negative demand', () => {
  const r = forecast([0,0,0,0,1]);
  r.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
});
test('custom daysAhead respected', () => {
  expect(forecast([5,5,5], 14)).toHaveLength(14);
});
