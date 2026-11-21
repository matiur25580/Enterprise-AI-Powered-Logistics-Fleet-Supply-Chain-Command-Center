const express = require('express');
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { authorize } = require('../middleware/auth');
const r = express.Router();

const STAFF_READ = ['Admin', 'FleetManager', 'Accountant'];
const ACTIVE_TRIP_STATES = ['Scheduled', 'OnGoing'];
const VALID_STATUSES = ['Scheduled', 'OnGoing', 'Delivered', 'Cancelled'];

r.post('/create', authorize('Admin', 'FleetManager'), async (req, res) => {
  const { vehicle: vehicleId, driver: driverId, bookingId, from, to, startDate } = req.body;
  if (!mongoose.isValidObjectId(vehicleId)
    || (driverId && !mongoose.isValidObjectId(driverId))
    || (bookingId && !mongoose.isValidObjectId(bookingId))
    || typeof from !== 'string' || !from.trim() || from.trim().length > 160
    || typeof to !== 'string' || !to.trim() || to.trim().length > 160
    || (startDate && Number.isNaN(new Date(startDate).getTime()))) {
    return res.status(400).json({ success: false, message: 'Provide valid trip, vehicle and route details.' });
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || !['Idle', 'Active'].includes(vehicle.status)) {
    return res.status(409).json({ success: false, message: 'Selected vehicle is unavailable.' });
  }
  if (driverId) {
    const driver = await User.findOne({ _id: driverId, role: 'Driver', isActive: { $ne: false } }).select('_id');
    if (!driver) return res.status(400).json({ success: false, message: 'Selected user is not an active driver.' });
    const existingTrip = await Trip.exists({ driver: driverId, status: { $in: ACTIVE_TRIP_STATES } });
    if (existingTrip) return res.status(409).json({ success: false, message: 'Selected driver already has an active trip.' });
  }
  let booking = null;
  if (bookingId) {
    booking = await Booking.findById(bookingId);
    if (!booking || !['Pending', 'Approved', 'Confirmed'].includes(booking.status)) {
      return res.status(409).json({ success: false, message: 'Selected booking is not available for scheduling.' });
    }
  }

  const session = await mongoose.startSession();
  let trip;
  try {
    await session.withTransaction(async () => {
      const updatedVehicle = await Vehicle.findOneAndUpdate(
        { _id: vehicleId, status: { $in: ['Idle', 'Active'] } },
        { $set: { status: 'OnTrip', ...(driverId ? { driver: driverId } : {}) } },
        { new: true, session }
      );
      if (!updatedVehicle) throw new Error('VEHICLE_UNAVAILABLE');
      const [created] = await Trip.create([{
        bookingId: bookingId || undefined,
        vehicle: vehicleId,
        driver: driverId || vehicle.driver || undefined,
        from: from.trim(),
        to: to.trim(),
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'Scheduled'
      }], { session });
      trip = created;
      if (booking) {
        await Booking.updateOne(
          { _id: booking._id, status: { $in: ['Pending', 'Approved', 'Confirmed'] } },
          { $set: { status: 'Confirmed' } },
          { session }
        );
      }
    });
    return res.status(201).json({ message: 'Trip created successfully', success: true, t: trip });
  } catch (error) {
    return res.status(409).json({ success: false, message: 'Trip could not be scheduled; verify vehicle, driver and booking availability.' });
  } finally {
    await session.endSession();
  }
});

r.get('/all', async (req, res) => {
  let filter;
  if (STAFF_READ.includes(req.user.role)) filter = {};
  else if (req.user.role === 'Driver') filter = { driver: req.user._id };
  else if (req.user.role === 'Client') {
    const bookings = await Booking.find({ $or: [{ user: req.user._id }, { email: req.user.email }] }).select('_id');
    filter = { bookingId: { $in: bookings.map((booking) => String(booking._id)) } };
  } else return res.status(403).json({ message: 'You cannot view trips.' });

  const trips = await Trip.find(filter).populate('vehicle driver', 'vehicleNumber fullName').sort({ createdAt: -1 }).limit(500);
  return res.json(trips);
});

r.put('/status/:id', async (req, res) => {
  const nextStatus = req.body.status;
  if (!VALID_STATUSES.includes(nextStatus)) return res.status(400).json({ message: 'Invalid trip status.' });
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found.' });

  const isDriver = req.user.role === 'Driver';
  if (isDriver && String(trip.driver || '') !== req.userId) return res.status(404).json({ message: 'Trip not found.' });
  if (!isDriver && !['Admin', 'FleetManager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'You cannot update trip status.' });
  }

  const transitions = trip.status === 'Scheduled'
    ? (isDriver ? ['OnGoing'] : ['OnGoing', 'Cancelled'])
    : trip.status === 'OnGoing'
      ? (isDriver ? ['Delivered'] : ['Delivered', 'Cancelled'])
      : [];
  if (!transitions.includes(nextStatus)) return res.status(409).json({ message: 'This trip status transition is not allowed.' });

  const updated = await Trip.findOneAndUpdate(
    { _id: trip._id, status: trip.status },
    { $set: { status: nextStatus, ...(nextStatus === 'Delivered' ? { endDate: new Date() } : {}) } },
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(409).json({ message: 'Trip changed concurrently. Refresh and try again.' });

  if (updated.vehicle) {
    await Vehicle.findByIdAndUpdate(updated.vehicle, {
      $set: { status: nextStatus === 'OnGoing' ? 'OnTrip' : 'Idle' }
    });
  }
  if (updated.bookingId && ['Delivered', 'Cancelled'].includes(nextStatus)) {
    await Booking.findByIdAndUpdate(updated.bookingId, { $set: { status: nextStatus } });
  }
  return res.json({ message: 'Trip status updated successfully', success: true, trip: updated });
});

r.delete('/:id', authorize('Admin'), async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found.' });
  if (!['Scheduled', 'Cancelled'].includes(trip.status)) {
    return res.status(409).json({ message: 'Only unstarted or cancelled trips can be deleted.' });
  }
  await Trip.deleteOne({ _id: trip._id });
  if (trip.vehicle) await Vehicle.findByIdAndUpdate(trip.vehicle, { $set: { status: 'Idle' } });
  return res.json({ message: 'Trip deleted successfully', success: true });
});

module.exports = r;
