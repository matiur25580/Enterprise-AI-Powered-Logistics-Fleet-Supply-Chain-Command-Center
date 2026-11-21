const express = require('express');
const mongoose = require('mongoose');
const Warehouse = require('../models/Warehouse');
const User = require('../models/User');
const { authorize } = require('../middleware/auth');

const router = express.Router();

function managerScope(user) {
  return user.role === 'WarehouseManager' ? { manager: user._id } : {};
}

router.post('/add', authorize('Admin', 'WarehouseManager'), async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const location = typeof req.body?.location === 'string' ? req.body.location.trim() : '';
    const totalCapacity = Number(req.body?.totalCapacity);
    const usedCapacity = req.body?.usedCapacity === undefined ? 0 : Number(req.body.usedCapacity);

    if (!name || name.length > 120 || location.length > 240 ||
        !Number.isFinite(totalCapacity) || totalCapacity <= 0 ||
        !Number.isFinite(usedCapacity) || usedCapacity < 0 || usedCapacity > totalCapacity) {
      return res.status(400).json({ message: 'Provide a valid name, location, and capacity values.' });
    }

    let manager = req.user._id;
    if (req.user.role === 'Admin' && req.body.manager) {
      if (!mongoose.isValidObjectId(req.body.manager)) {
        return res.status(400).json({ message: 'Invalid warehouse manager.' });
      }
      const managerUser = await User.findById(req.body.manager).select('_id role');
      if (!managerUser || managerUser.role !== 'WarehouseManager') {
        return res.status(400).json({ message: 'The selected user is not a warehouse manager.' });
      }
      manager = managerUser._id;
    }

    const warehouse = await Warehouse.create({
      name,
      location,
      totalCapacity,
      usedCapacity,
      manager,
    });
    return res.status(201).json({ message: 'Warehouse added successfully', success: true, warehouse });
  } catch (error) {
    console.error('Warehouse creation failed:', error.message);
    return res.status(500).json({ message: 'Unable to create warehouse.' });
  }
});

router.get('/all', authorize('Admin', 'WarehouseManager'), async (req, res) => {
  try {
    const warehouses = await Warehouse.find(managerScope(req.user))
      .populate('manager', 'fullName')
      .sort({ createdAt: -1 });
    return res.json(warehouses);
  } catch (error) {
    console.error('Warehouse listing failed:', error.message);
    return res.status(500).json({ message: 'Unable to retrieve warehouses.' });
  }
});

router.put('/stock/:id', authorize('Admin', 'WarehouseManager'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid warehouse identifier.' });
  }
  const usedCapacity = Number(req.body?.usedCapacity);
  if (!Number.isFinite(usedCapacity) || usedCapacity < 0) {
    return res.status(400).json({ message: 'Stock must be a non-negative number.' });
  }

  try {
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      ...managerScope(req.user),
    });
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found.' });
    if (usedCapacity > warehouse.totalCapacity) {
      return res.status(400).json({
        message: 'Stock cannot exceed total capacity (' + warehouse.totalCapacity + ').',
      });
    }

    warehouse.usedCapacity = usedCapacity;
    await warehouse.save();
    return res.json({ message: 'Stock updated successfully', success: true });
  } catch (error) {
    console.error('Warehouse stock update failed:', error.message);
    return res.status(500).json({ message: 'Unable to update warehouse stock.' });
  }
});

module.exports = router;
