const mongoose=require('mongoose');
const t=new mongoose.Schema({
  bookingId:String, vehicle:{type:mongoose.Schema.Types.ObjectId,ref:'Vehicle'},
  driver:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  from:String, to:String, status:{type:String,enum:['Scheduled','OnGoing','Delivered','Cancelled'],default:'Scheduled'},
  startDate:Date, endDate:Date, podUrl:String
},{timestamps:true});
module.exports=mongoose.model('Trip',t);
