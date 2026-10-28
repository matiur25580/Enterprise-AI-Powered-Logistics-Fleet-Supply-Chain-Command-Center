const mongoose=require('mongoose');
const v=new mongoose.Schema({
  vehicleNumber:{type:String,required:true,unique:true},
  type:{type:String,enum:['Truck','MiniTruck','Van','Container','Refrigerated'],required:true},
  capacity:String, driver:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  status:{type:String,enum:['Active','Maintenance','OnTrip','Idle'],default:'Idle'},
  lastLocation:{lat:Number,lng:Number}
},{timestamps:true});

v.add({ insuranceExpiry: Date, fitnessExpiry: Date, permitExpiry: Date, pollutionExpiry: Date, odometer: {type:Number, default:0}, nextServiceDue: Date });
module.exports=mongoose.model('Vehicle',v);
