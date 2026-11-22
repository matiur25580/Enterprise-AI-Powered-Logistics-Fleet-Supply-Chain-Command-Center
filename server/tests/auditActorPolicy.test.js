const { getAuthenticatedAuditActor } = require('../utils/auditActorPolicy');

describe('audit actor attribution', () => {
  test('uses the authenticated database user identity', () => {
    expect(getAuthenticatedAuditActor({ email: 'verified@example.com', role: 'Driver' })).toEqual({ actor: 'verified@example.com', role: 'Driver' });
  });
  test('does not infer identity from request-controlled data when no user exists', () => {
    expect(getAuthenticatedAuditActor(undefined)).toEqual({ actor: 'system', role: '-' });
  });
});
