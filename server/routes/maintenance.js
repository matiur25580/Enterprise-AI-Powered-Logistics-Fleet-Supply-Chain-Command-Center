const r = require('express').Router();
const mongoose = require('mongoose');
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const { authorize } = require('../middleware/auth');

r.post('/fuel', authorize('Admin', 'FleetManager', 'Driver'), async (req, res) => {
  const vehicleId = req.body.vehicle;
  const liters = Number(req.body.liters);
  const cost = Number(req.body.cost || 0);
  const odometer = Number(req.body.odometer || 0);
  const note = String(req.body.note || '').trim();
  if (!mongoose.isValidObjectId(vehicleId) || !Number.isFinite(liters) || liters <= 0 || liters > 10000
    || !Number.isFinite(cost) || cost < 0 || cost > 10000000
    || !Number.isFinite(odometer) || odometer < 0 || note.length > 500) {
    return res.status(400).json({ message: 'Provide valid fuel log details.' });
  }
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  if (req.user.role === 'Driver' && String(vehicle.driver || '') !== req.userId) {
    return res.status(404).json({ message: 'Vehicle not found.' });
  }
  if (odometer > 0 && odometer < Number(vehicle.odometer || 0)) {
    return res.status(409).json({ message: 'Odometer cannot move backwards.' });
  }
  const log = await FuelLog.create({
    vehicle: vehicle._id,
    vehicleNo: vehicle.vehicleNumber,
    liters, cost, odometer, note,
    createdBy: req.user._id
  });
  if (odometer > Number(vehicle.odometer || 0)) {
    await Vehicle.updateOne({ _id: vehicle._id, odometer: { $lte: odometer } }, { $set: { odometer } });
  }
  return res.status(201).json({ success: true, fuelLog: log });
});

r.get('/fuel/:vehicleId', authorize('Admin', 'FleetManager', 'Driver'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.vehicleId)) return res.status(400).json({ message: 'Invalid vehicle ID.' });
  const vehicle = await Vehicle.findById(req.params.vehicleId).select('_id driver');
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  if (req.user.role === 'Driver' && String(vehicle.driver || '') !== req.userId) {
    return res.status(404).json({ message: 'Vehicle not found.' });
  }
  const logs = await FuelLog.find({ vehicle: vehicle._id }).sort({ date: -1 }).limit(100);
  return res.json(logs);
});

r.put('/service/:vehicleId', authorize('Admin', 'FleetManager'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.vehicleId)) return res.status(400).json({ message: 'Invalid vehicle ID.' });
  const nextServiceDue = new Date(req.body.nextServiceDue);
  const odometer = req.body.odometer === undefined || req.body.odometer === '' ? undefined : Number(req.body.odometer);
  if (Number.isNaN(nextServiceDue.getTime()) || nextServiceDue.getTime() < Date.now() - 86400000
    || nextServiceDue.getTime() > Date.now() + 3 * 365 * 86400000
    || (odometer !== undefined && (!Number.isFinite(odometer) || odometer < 0))) {
    return res.status(400).json({ message: 'Provide a valid service date and odometer.' });
  }
  const update = { nextServiceDue };
  if (odometer !== undefined) update.odometer = odometer;
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.vehicleId, { $set: update }, { new: true, runValidators: true });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  return res.json(vehicle);
});

r.get('/due', authorize('Admin', 'FleetManager'), async (req, res) => {
  const soon = new Date(Date.now() + 7 * 86400000);
  const vehicles = await Vehicle.find({ nextServiceDue: { $lte: soon } }).sort({ nextServiceDue: 1 }).limit(100);
  return res.json(vehicles);
});

module.exports = r;
