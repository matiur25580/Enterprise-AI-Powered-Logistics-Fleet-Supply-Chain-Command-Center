const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['Admin', 'FleetManager', 'WarehouseManager', 'Driver', 'Client', 'Accountant'],
    required: true
  },
  contactNumber: { type: String, trim: true, maxlength: 24 },
  dob: { type: String, trim: true, maxlength: 10 },
  uniqueId: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  tokenVersion: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

userSchema.index({ email: 1, role: 1 }, { unique: true });
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
