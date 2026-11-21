const PASSWORD_RECOVERY_RESPONSE = Object.freeze({
  message: 'If an account matches these details, a password reset code will be sent.',
  success: true,
});

function passwordRecoveryResponse() {
  return { ...PASSWORD_RECOVERY_RESPONSE };
}

module.exports = { passwordRecoveryResponse };
