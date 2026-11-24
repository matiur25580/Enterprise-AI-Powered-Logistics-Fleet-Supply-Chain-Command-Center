// Explicit state machine: trips can move only through these allowed delivery lifecycle transitions.
const transitions = {
  Scheduled: new Set(['OnGoing', 'Cancelled']),
  OnGoing: new Set(['Delivered', 'Cancelled']),
  Delivered: new Set(),
  Cancelled: new Set(),
};

function canTransitionTripStatus(currentStatus, nextStatus) {
  return Boolean(transitions[currentStatus]?.has(nextStatus));
}

module.exports = { canTransitionTripStatus };
