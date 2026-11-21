const express = require('express');
const mongoose = require('mongoose');
const Warehouse = require('../models/Warehouse');
const User = require('../models/User');
const { authorize } = require('../middleware/auth');
const r = express.Router();

r.post('/add', authorize('Admin', 'WarehouseManager'), async (req, res) => {
  try {
    const { name, location, totalCapacity, manager } = req.body;
    const capacity = Number(totalCapacity);
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100
      || !Number.isFinite(capacity) || capacity <= 0 || capacity > 1_000_000_000
      || (manager && !mongoose.isValidObjectId(manager))) {
      return res.status(400).json({ success: false, message: 'Provide valid warehouse details.' });
    }
    if (manager) {
      const managerUser = await User.findOne({ _id: manager, role: 'WarehouseManager', isActive: { $ne: false } }).select('_id');
      if (!managerUser) return res.status(400).json({ success: false, message: 'Selected user is not an active warehouse manager.' });
    }
    const warehouse = await Warehouse.create({
      name: name.trim(), location: String(location || '').trim(),
      totalCapacity: capacity, usedCapacity: 0, manager: manager || null
    });
    return res.status(201).json({ message: 'Warehouse added successfully', success: true, w: warehouse });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Warehouse could not be added.' });
  }
});

r.get('/all', authorize('Admin', 'FleetManager', 'WarehouseManager', 'Accountant'), async (req, res) => {
  const warehouses = await Warehouse.find().populate('manager', 'fullName').sort({ createdAt: -1 }).limit(300);
  return res.json(warehouses);
});

r.put('/stock/:id', authorize('Admin', 'WarehouseManager'), async (req, res) => {
  const usedCapacity = Number(req.body.usedCapacity);
  if (!mongoose.isValidObjectId(req.params.id) || !Number.isFinite(usedCapacity) || usedCapacity < 0) {
    return res.status(400).json({ message: 'Stock must be a non-negative number.' });
  }
  const warehouse = await Warehouse.findOneAndUpdate(
    { _id: req.params.id, totalCapacity: { $gte: usedCapacity } },
    { $set: { usedCapacity } },
    { new: true, runValidators: true }
  );
  if (!warehouse) return res.status(404).json({ message: 'Warehouse not found or stock exceeds total capacity.' });
  return res.json({ message: 'Stock updated successfully', success: true, warehouse });
});

module.exports = r;
