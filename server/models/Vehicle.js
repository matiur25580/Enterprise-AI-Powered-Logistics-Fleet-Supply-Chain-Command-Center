const mongoose=require('mongoose');
const v=new mongoose.Schema({
  vehicleNumber:{type:String,required:true,unique:true},
  type:{type:String,enum:['Truck','MiniTruck','Van','Container','Refrigerated'],required:true},
  capacity:String, driver:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  status:{type:String,enum:['Active','Maintenance','OnTrip','Idle'],default:'Idle'},
  lastLocation:{lat:Number,lng:Number}
},{timestamps:true});
module.exports=mongoose.model('Vehicle',v);
