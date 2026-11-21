const express = require('express');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Trip = require('../models/Trip');
const { authorize } = require('../middleware/auth');
const r = express.Router();

const TYPES = ['Truck', 'MiniTruck', 'Van', 'Container', 'Refrigerated'];
const STATUSES = ['Active', 'Maintenance', 'OnTrip', 'Idle'];
const READ_ROLES = ['Admin', 'FleetManager', 'WarehouseManager', 'Accountant'];

r.post('/add', authorize('Admin', 'FleetManager'), async (req, res) => {
  try {
    const { vehicleNumber, type, capacity, driver } = req.body;
    if (typeof vehicleNumber !== 'string' || vehicleNumber.trim().length < 3 || vehicleNumber.trim().length > 32
      || !TYPES.includes(type) || (capacity !== undefined && String(capacity).length > 40)
      || (driver && !mongoose.isValidObjectId(driver))) {
      return res.status(400).json({ success: false, message: 'Provide valid vehicle details.' });
    }
    if (driver) {
      const assignedDriver = await User.findOne({ _id: driver, role: 'Driver', isActive: { $ne: false } }).select('_id');
      if (!assignedDriver) return res.status(400).json({ success: false, message: 'Selected user is not an active driver.' });
    }
    const vehicle = await Vehicle.create({
      vehicleNumber: vehicleNumber.trim().toUpperCase(), type,
      capacity: String(capacity || '').trim(), driver: driver || null
    });
    return res.status(201).json({ message: 'Vehicle added successfully', success: true, v: vehicle });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Vehicle number already exists.' });
    return res.status(400).json({ success: false, message: 'Vehicle could not be added.' });
  }
});

r.get('/all', async (req, res) => {
  if (!READ_ROLES.includes(req.user.role) && req.user.role !== 'Driver') {
    return res.status(403).json({ message: 'You cannot view fleet vehicles.' });
  }
  const filter = req.user.role === 'Driver' ? { driver: req.user._id } : {};
  const vehicles = await Vehicle.find(filter).populate('driver', 'fullName').sort({ createdAt: -1 }).limit(500);
  return res.json(vehicles);
});

r.put('/status/:id', authorize('Admin', 'FleetManager'), async (req, res) => {
  if (!STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid vehicle status.' });
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  return res.json({ message: 'Status updated successfully', success: true, vehicle });
});

r.delete('/:id', authorize('Admin'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid vehicle ID.' });
  const activeTrip = await Trip.exists({ vehicle: req.params.id, status: { $in: ['Scheduled', 'OnGoing'] } });
  if (activeTrip) return res.status(409).json({ message: 'Vehicle cannot be deleted while it has an active trip.' });
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  return res.json({ message: 'Vehicle deleted successfully', success: true });
});

module.exports = r;
