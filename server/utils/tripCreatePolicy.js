const TRIP_CREATE_FIELDS = ['bookingId','vehicle','driver','from','to','startDate','endDate'];
function buildTripCreatePayload(body = {}) {
  const payload = {};
  for (const field of TRIP_CREATE_FIELDS) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  payload.status = 'Scheduled';
  return payload;
}
module.exports = { buildTripCreatePayload };
