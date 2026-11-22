function getAuthenticatedAuditActor(user) {
  return {
    actor: user && typeof user.email === 'string' && user.email ? user.email : 'system',
    role: user && typeof user.role === 'string' && user.role ? user.role : '-'
  };
}
module.exports = { getAuthenticatedAuditActor };
