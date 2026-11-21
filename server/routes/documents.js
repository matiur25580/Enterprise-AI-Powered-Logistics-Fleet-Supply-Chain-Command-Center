const r = require('express').Router();
const Vehicle = require('../models/Vehicle');
const {authorize}=require('../middleware/auth');
const {buildDocumentExpiryUpdate}=require('../utils/documentPolicy');
r.get('/expiring/list',authorize('Admin','FleetManager'),async (req,res)=>{const days=Math.min(90,Math.max(1,parseInt(req.query.days||'30',10)||30));const lim=new Date(Date.now()+days*864e5);const now=new Date();const vs=await Vehicle.find({}).limit(500);const out=[];for(const v of vs){const docs=[['Insurance',v.insuranceExpiry],['Fitness',v.fitnessExpiry],['Permit',v.permitExpiry],['Pollution',v.pollutionExpiry]];const exp=docs.filter(d=>d[1]&&new Date(d[1])<=lim).map(d=>({name:d[0],expiry:d[1],overdue:new Date(d[1])<now}));if(exp.length)out.push({_id:v._id,vehicleNo:v.vehicleNumber||String(v._id).slice(-6),expiring:exp});}res.json(out);});
r.put('/:id',authorize('Admin'),async (req,res)=>{
  const result=buildDocumentExpiryUpdate(req.body);
  if(result.error)return res.status(400).json({message:result.error});
  const v=await Vehicle.findByIdAndUpdate(req.params.id,result.update,{new:true,runValidators:true});
  if(!v)return res.status(404).json({message:'Vehicle not found'});
  res.json(v);
});
module.exports = r;
