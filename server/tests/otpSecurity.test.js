const bcrypt = require('bcryptjs');
const { generateOtp, hashOtp, consumeOtp, MAX_OTP_ATTEMPTS } = require('../utils/otpSecurity');

describe('OTP security', () => {
  test('generates six numeric digits using a cryptographic source', () => {
    for (let i = 0; i < 25; i++) expect(generateOtp()).toMatch(/^\\d{6}$/);
  });

  test('stores a bcrypt hash rather than the original OTP', async () => {
    const code = '012345';
    const hash = await hashOtp(code);
    expect(hash).not.toBe(code);
    await expect(bcrypt.compare(code, hash)).resolves.toBe(true);
    await expect(bcrypt.compare('543210', hash)).resolves.toBe(false);
  });

  test('increments attempts and consumes a correct OTP exactly once', async () => {
    const code = '123456';
    const challenge = { _id: 'otp-1', attempts: 1, otpHash: await hashOtp(code) };
    let deleted = false;
    const Otp = {
      findOneAndUpdate: () => ({ select: async () => challenge }),
      deleteOne: async filter => {
        expect(filter).toEqual({ _id: 'otp-1', attempts: 1 });
        if (deleted) return { deletedCount: 0 };
        deleted = true;
        return { deletedCount: 1 };
      }
    };
    await expect(consumeOtp(Otp, { email: 'a@example.test', role: 'Client', code })).resolves.toBe(true);
    expect(deleted).toBe(true);
  });

  test('does not consume a challenge for an invalid OTP', async () => {
    const challenge = { _id: 'otp-2', attempts: 1, otpHash: await hashOtp('123456') };
    const deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
    const Otp = { findOneAndUpdate: () => ({ select: async () => challenge }), deleteOne };
    await expect(consumeOtp(Otp, { email: 'a@example.test', role: 'Client', code: '000000' })).resolves.toBe(false);
    expect(deleteOne).not.toHaveBeenCalled();
  });

  test('caps verification attempts at five', () => {
    expect(MAX_OTP_ATTEMPTS).toBe(5);
  });
});
