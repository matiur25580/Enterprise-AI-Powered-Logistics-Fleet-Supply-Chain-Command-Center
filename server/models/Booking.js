const mongoose=require('mongoose');
const b=new mongoose.Schema({
  email:String,
  clientName:String, from:String, to:String, goods:String, weight:String,
  status:{type:String,default:'Pending'}, invoiceNo:{type:String,unique:true},
  amount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'Unpaid' },
},{timestamps:true});
module.exports=mongoose.model('Booking',b);
