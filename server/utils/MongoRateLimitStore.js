const RateLimit = require('../models/RateLimit');

class MongoRateLimitStore {
  constructor(prefix) {
    this.prefix = prefix || 'rate-limit:';
    this.windowMs = 60000;
  }

  init(options) {
    if (Number.isFinite(options && options.windowMs) && options.windowMs > 0) this.windowMs = options.windowMs;
  }

  async increment(key) {
    const storageKey = this.prefix + String(key);
    const now = new Date();
    const resetAt = new Date(now.getTime() + this.windowMs);
    const update = [{
      $set: {
        hits: { $cond: [{ $gt: ['$resetAt', now] }, { $add: [{ $ifNull: ['$hits', 0] }, 1] }, 1] },
        resetAt: { $cond: [{ $gt: ['$resetAt', now] }, '$resetAt', resetAt] }
      }
    }];
    let record;
    try {
      record = await RateLimit.findOneAndUpdate({ key: storageKey }, update, {
        new: true, upsert: true, setDefaultsOnInsert: false
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      record = await RateLimit.findOneAndUpdate({ key: storageKey }, update, {
        new: true, upsert: false, setDefaultsOnInsert: false
      });
      if (!record) record = await RateLimit.findOneAndUpdate({ key: storageKey }, update, {
        new: true, upsert: true, setDefaultsOnInsert: false
      });
    }
    if (!record) throw new Error('Rate-limit counter unavailable.');
    return { totalHits: record.hits, resetTime: record.resetAt };
  }

  async get(key) {
    const record = await RateLimit.findOne({ key: this.prefix + String(key), resetAt: { $gt: new Date() } }).lean();
    return record ? { totalHits: record.hits, resetTime: record.resetAt } : undefined;
  }

  async decrement(key) {
    await RateLimit.updateOne({ key: this.prefix + String(key), hits: { $gt: 0 } }, { $inc: { hits: -1 } });
  }

  async resetKey(key) {
    await RateLimit.deleteOne({ key: this.prefix + String(key) });
  }

  async resetAll() {
    await RateLimit.deleteMany({ key: { $regex: '^' + this.prefix } });
  }
}

module.exports = MongoRateLimitStore;
