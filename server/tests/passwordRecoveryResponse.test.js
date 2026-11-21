const { passwordRecoveryResponse } = require('../utils/passwordRecoveryResponse');

describe('password recovery public response', () => {
  test('returns the same generic response for existing and unknown accounts', () => {
    const existingAccountResponse = passwordRecoveryResponse();
    const unknownAccountResponse = passwordRecoveryResponse();

    expect(existingAccountResponse).toEqual(unknownAccountResponse);
    expect(existingAccountResponse).toEqual({
      message: 'If an account matches these details, a password reset code will be sent.',
      success: true,
    });
    expect(existingAccountResponse.message).not.toMatch(/exist|registered|found/i);
  });

  test('returns a fresh object so callers cannot mutate the shared response', () => {
    const first = passwordRecoveryResponse();
    first.success = false;

    expect(passwordRecoveryResponse().success).toBe(true);
  });
});
