const mongoose=require('mongoose');
const b=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',index:true},
  email:String,
  clientName:String, from:String, to:String, goods:String, weight:String,
  status:{type:String,enum:['Pending','Approved','Confirmed','Rejected','Delivered','Cancelled'],default:'Pending'}, invoiceNo:{type:String,unique:true},
  amount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'Unpaid' },
},{timestamps:true});
module.exports=mongoose.model('Booking',b);
