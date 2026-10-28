const mongoose=require('mongoose');
const w=new mongoose.Schema({
  name:{type:String,required:true}, location:String,
  totalCapacity:Number, usedCapacity:{type:Number,default:0},
  manager:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});
module.exports=mongoose.model('Warehouse',w);
