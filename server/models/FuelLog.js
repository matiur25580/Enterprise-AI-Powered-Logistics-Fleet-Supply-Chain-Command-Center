const mongoose = require('mongoose');
const FuelLogSchema = new mongoose.Schema({
  vehicle: {type:mongoose.Schema.Types.ObjectId, ref:'Vehicle'},
  vehicleNo: String,
  date: {type:Date, default:Date.now},
  liters: Number,
  cost: Number,
  odometer: Number,
  note: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps:true});
module.exports = mongoose.model('FuelLog', FuelLogSchema);
