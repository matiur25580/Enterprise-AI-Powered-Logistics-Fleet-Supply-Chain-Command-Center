const { isStrongPassword } = require('../utils/passwordPolicy');
test('accepts valid strong password', () => {
  expect(isStrongPassword('Abcdef12')).toBe(true);
});
test('rejects too short', () => {
  expect(isStrongPassword('Ab1')).toBe(false);
});
test('rejects missing uppercase', () => {
  expect(isStrongPassword('abcdef12')).toBe(false);
});
test('rejects missing lowercase', () => {
  expect(isStrongPassword('ABCDEF12')).toBe(false);
});
test('rejects missing number', () => {
  expect(isStrongPassword('Abcdefgh')).toBe(false);
});
test('rejects non-string input', () => {
  expect(isStrongPassword(undefined)).toBe(false);
  expect(isStrongPassword(null)).toBe(false);
  expect(isStrongPassword(12345678)).toBe(false);
});
