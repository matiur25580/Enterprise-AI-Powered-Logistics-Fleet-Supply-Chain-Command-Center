const mongoose=require('mongoose');
const b=new mongoose.Schema({
  clientName:String, from:String, to:String, goods:String, weight:String,
  status:{type:String,default:'Pending'}, invoiceNo:{type:String,unique:true}
},{timestamps:true});
module.exports=mongoose.model('Booking',b);
