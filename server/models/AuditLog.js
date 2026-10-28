const mongoose = require('mongoose');
const AuditLogSchema = new mongoose.Schema({
  actor: {type:String, default:'unknown'},
  role: {type:String, default:'-'},
  action: String,
  entity: String,
  details: String,
  ip: String
}, {timestamps:true});
module.exports = mongoose.model('AuditLog', AuditLogSchema);
