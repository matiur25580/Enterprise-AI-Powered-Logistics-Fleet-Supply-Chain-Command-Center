const express = require('express');
const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');
const { sendMail } = require('../utils/mailer');
const { authorize } = require('../middleware/auth');
const {
  normalizeBookingInput, isBookingStatus, isPaymentStatus,
  parseNonNegativeAmount, escapeHtml
} = require('../utils/bookingValidation');

const r = express.Router();
const STAFF_READ = ['Admin', 'FleetManager', 'Accountant'];

function ownsBooking(user, booking) {
  return String(booking.user || '') === String(user._id)
    || (!booking.user && String(booking.email || '').toLowerCase() === String(user.email || '').toLowerCase());
}

r.post('/create', authorize('Client'), async (req, res) => {
  try {
    const input = normalizeBookingInput({
      ...req.body,
      clientName: req.user.fullName,
      email: req.user.email
    });
    if (!input) return res.status(400).json({ message: 'Provide a valid origin and destination.' });
    const invoiceNo = 'INV-' + Date.now().toString(36).toUpperCase() + '-' + require('crypto').randomBytes(3).toString('hex').toUpperCase();
    const booking = await Booking.create({
      ...input,
      user: req.user._id,
      clientName: req.user.fullName,
      email: req.user.email,
      invoiceNo,
      status: 'Pending'
    });
    sendMail(req.user.email, 'Booking Received - ' + booking.invoiceNo,
      '<h2>FleetCommand</h2><p>Hi ' + escapeHtml(req.user.fullName) + ',</p><p>Your shipment booking has been received.</p><p><b>Invoice:</b> ' + booking.invoiceNo + '<br><b>Route:</b> ' + escapeHtml(booking.from) + ' to ' + escapeHtml(booking.to) + '</p>').catch(() => {});
    return res.status(201).json({ message: 'Booking created successfully', success: true, b: booking });
  } catch (error) {
    return res.status(400).json({ message: 'Booking could not be created with the supplied details.' });
  }
});

r.get('/all', async (req, res) => {
  const filter = req.user.role === 'Client' ? { $or: [{ user: req.user._id }, { email: req.user.email }] }
    : STAFF_READ.includes(req.user.role) ? {}
      : null;
  if (!filter) return res.status(403).json({ message: 'You cannot view bookings.' });
  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(500);
  return res.json(bookings);
});

r.get('/invoice/:id', async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).send('Not found');
  if (req.user.role === 'Client' && !ownsBooking(req.user, booking)) return res.status(404).send('Not found');
  if (!['Client', ...STAFF_READ].includes(req.user.role)) return res.status(403).send('Forbidden');

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=' + String(booking.invoiceNo).replace(/[^A-Za-z0-9_-]/g, '') + '.pdf');
  doc.pipe(res);
  doc.fontSize(20).text('Logistics Invoice', 100, 100);
  doc.fontSize(12).text('Invoice No: ' + booking.invoiceNo, 100, 140);
  doc.text('Client: ' + booking.clientName, 100, 160);
  doc.text('From: ' + booking.from + ' To: ' + booking.to, 100, 180);
  doc.text('Goods: ' + (booking.goods || '-') + ' Weight: ' + (booking.weight || '-'), 100, 200);
  doc.text('Status: ' + booking.status, 100, 220);
  doc.text('Date: ' + new Date(booking.createdAt).toLocaleDateString('en-GB'), 100, 240);
  doc.end();
});

r.put('/status/:id', authorize('Admin', 'FleetManager'), async (req, res) => {
  try {
    if (!isBookingStatus(req.body.status)) return res.status(400).json({ message: 'Invalid booking status' });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const transitions = {
      Pending: ['Approved', 'Rejected', 'Cancelled'],
      Approved: ['Confirmed', 'Rejected', 'Cancelled'],
      Confirmed: ['Delivered', 'Cancelled'],
      Delivered: [],
      Rejected: [],
      Cancelled: []
    };
    if (!transitions[booking.status]?.includes(req.body.status)) {
      return res.status(409).json({ message: 'This booking status transition is not allowed.' });
    }
    booking.status = req.body.status;
    await booking.save();
    if (booking.email) {
      const subject = req.body.status === 'Delivered' ? 'Shipment Delivered - ' : 'Booking Update - ';
      sendMail(booking.email, subject + booking.invoiceNo,
        '<h2>FleetCommand</h2><p>Hi ' + escapeHtml(booking.clientName || 'Customer') + ',</p><p>Your booking <b>' + booking.invoiceNo + '</b> is now <b>' + booking.status + '</b>.</p>').catch(() => {});
    }
    return res.json({ message: 'Booking status updated successfully', success: true, booking });
  } catch (error) {
    return res.status(400).json({ message: 'Booking status could not be updated.' });
  }
});

r.put('/billing/:id', authorize('Admin', 'Accountant'), async (req, res) => {
  try {
    const update = {};
    if (req.body.amount !== undefined && req.body.amount !== '') {
      const amount = parseNonNegativeAmount(req.body.amount);
      if (amount === null) return res.status(400).json({ message: 'Amount must be a non-negative number' });
      update.amount = amount;
    }
    if (req.body.paymentStatus !== undefined) {
      if (!isPaymentStatus(req.body.paymentStatus)) return res.status(400).json({ message: 'Invalid payment status' });
      update.paymentStatus = req.body.paymentStatus;
    }
    if (!Object.keys(update).length) return res.status(400).json({ message: 'Provide an amount or payment status to update' });
    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    return res.json({ message: 'Billing updated', success: true, booking });
  } catch (error) {
    return res.status(400).json({ message: 'Billing could not be updated.' });
  }
});

module.exports = r;
