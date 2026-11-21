const DOCUMENT_EXPIRY_FIELDS = [
  'insuranceExpiry',
  'fitnessExpiry',
  'permitExpiry',
  'pollutionExpiry',
];

function buildDocumentExpiryUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'A document expiry object is required' };
  }

  const update = {};
  for (const field of DOCUMENT_EXPIRY_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    if (body[field] === null) {
      update[field] = null;
      continue;
    }
    if (typeof body[field] !== 'string' && !(body[field] instanceof Date)) {
      return { error: `${field} must be a valid date or null` };
    }
    const date = new Date(body[field]);
    if (Number.isNaN(date.getTime())) {
      return { error: `${field} must be a valid date or null` };
    }
    update[field] = date;
  }

  if (!Object.keys(update).length) {
    return { error: 'No supported document fields provided' };
  }
  return { update };
}

module.exports = { buildDocumentExpiryUpdate };
