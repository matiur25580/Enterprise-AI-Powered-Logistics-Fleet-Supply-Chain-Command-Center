const r = require('express').Router();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const { authorize } = require('../middleware/auth');

r.get('/expiring/list', authorize('Admin', 'FleetManager', 'Accountant'), async (req, res) => {
  const parsed = Number.parseInt(req.query.days || '30', 10);
  const days = Number.isFinite(parsed) ? Math.min(365, Math.max(1, parsed)) : 30;
  const limit = new Date(Date.now() + days * 86400000);
  const now = new Date();
  const vehicles = await Vehicle.find({}).select('vehicleNumber insuranceExpiry fitnessExpiry permitExpiry pollutionExpiry').limit(500);
  const output = [];
  for (const vehicle of vehicles) {
    const documents = [
      ['Insurance', vehicle.insuranceExpiry],
      ['Fitness', vehicle.fitnessExpiry],
      ['Permit', vehicle.permitExpiry],
      ['Pollution', vehicle.pollutionExpiry]
    ];
    const expiring = documents
      .filter((item) => item[1] && new Date(item[1]) <= limit)
      .map((item) => ({ name: item[0], expiry: item[1], overdue: new Date(item[1]) < now }));
    if (expiring.length) {
      output.push({
        _id: vehicle._id,
        vehicleNo: vehicle.vehicleNumber,
        expiring
      });
    }
  }
  return res.json(output);
});

r.put('/:id', authorize('Admin', 'FleetManager'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid vehicle ID.' });
  const allowed = ['insuranceExpiry', 'fitnessExpiry', 'permitExpiry', 'pollutionExpiry'];
  const update = {};
  for (const field of allowed) {
    if (req.body[field] === undefined) continue;
    const date = new Date(req.body[field]);
    if (Number.isNaN(date.getTime()) || date.getTime() < 0 || date.getTime() > Date.now() + 20 * 365 * 86400000) {
      return res.status(400).json({ message: 'Provide a valid document expiry date.' });
    }
    update[field] = date;
  }
  if (!Object.keys(update).length) return res.status(400).json({ message: 'No supported document expiry fields were supplied.' });
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  return res.json({ success: true, vehicle });
});

module.exports = r;
