const mongoose=require('mongoose');
// A trip links a booking, assigned vehicle and driver with its route, schedule, and proof of delivery.
const t=new mongoose.Schema({
  bookingId:String, vehicle:{type:mongoose.Schema.Types.ObjectId,ref:'Vehicle'},
  driver:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  from:String, to:String, status:{type:String,enum:['Scheduled','OnGoing','Delivered','Cancelled'],default:'Scheduled'},
  startDate:Date, endDate:Date, podUrl:String
},{timestamps:true});
module.exports=mongoose.model('Trip',t);
