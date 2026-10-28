const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  fullName:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true},
  role:{type:String,enum:['Admin','FleetManager','WarehouseManager','Driver','Client'],required:true},
  contactNumber:String,
  dob:String,
  uniqueId:{type:String,unique:true}
},{timestamps:true});
module.exports = mongoose.model('User',userSchema);
