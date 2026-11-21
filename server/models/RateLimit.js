const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  hits: { type: Number, required: true, min: 0 },
  resetAt: { type: Date, required: true }
}, { versionKey: false });

schema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.models.RateLimit || mongoose.model('RateLimit', schema);
