const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { generateOtp, hashOtp, consumeOtp, MAX_OTP_ATTEMPTS } = require('../utils/otpSecurity');

test('OTP generation produces six numeric digits', () => {
  for (let i = 0; i < 25; i++) assert.match(generateOtp(), /^\d{6}$/);
});

test('OTP hashes do not expose the original code and can be verified', async () => {
  const code = '012345';
  const hash = await hashOtp(code);
  assert.notEqual(hash, code);
  assert.equal(await bcrypt.compare(code, hash), true);
  assert.equal(await bcrypt.compare('543210', hash), false);
});

test('OTP verification atomically increments attempts and consumes a correct code once', async () => {
  const code = '123456';
  const challenge = { _id: 'otp-1', attempts: 1, otpHash: await hashOtp(code) };
  let deleted = false;
  const Otp = {
    findOneAndUpdate: () => ({ select: async () => challenge }),
    deleteOne: async filter => {
      assert.deepEqual(filter, { _id: 'otp-1', attempts: 1 });
      if (deleted) return { deletedCount: 0 };
      deleted = true;
      return { deletedCount: 1 };
    }
  };
  assert.equal(await consumeOtp(Otp, { email: 'a@example.test', role: 'Client', code }), true);
  assert.equal(deleted, true);
});

test('invalid OTP does not consume the challenge', async () => {
  const challenge = { _id: 'otp-2', attempts: 1, otpHash: await hashOtp('123456') };
  let deleteCalled = false;
  const Otp = {
    findOneAndUpdate: () => ({ select: async () => challenge }),
    deleteOne: async () => { deleteCalled = true; return { deletedCount: 1 }; }
  };
  assert.equal(await consumeOtp(Otp, { email: 'a@example.test', role: 'Client', code: '000000' }), false);
  assert.equal(deleteCalled, false);
});

test('OTP attempts are capped at five', () => {
  assert.equal(MAX_OTP_ATTEMPTS, 5);
});
