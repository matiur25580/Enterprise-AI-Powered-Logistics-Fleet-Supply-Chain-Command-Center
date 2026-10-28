const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  to: String,
  title: String,
  message: String,
  type: {type:String, default:'info'},
  read: {type:Boolean, default:false}
}, {timestamps:true});
module.exports = mongoose.model('Notification', NotificationSchema);
