const r = require('express').Router();
const Vehicle = require('../models/Vehicle');
r.get('/expiring/list', async (req,res)=>{
  const days = parseInt(req.query.days||'30');
  const lim = new Date(Date.now()+days*864e5);
  const now = new Date();
  const vs = await Vehicle.find({}).limit(500);
  const out = [];
  for(const v of vs){
    const docs = [['Insurance',v.insuranceExpiry],['Fitness',v.fitnessExpiry],['Permit',v.permitExpiry],['Pollution',v.pollutionExpiry]];
    const exp = docs.filter(d=>d[1] && new Date(d[1])<=lim).map(d=>({name:d[0], expiry:d[1], overdue:new Date(d[1])<now}));
    if(exp.length) out.push({_id:v._id, vehicleNo:v.vehicleNo||v.regNo||v.number||v.vehicleNumber||String(v._id).slice(-6), expiring:exp});
  }
  res.json(out);
});
r.put('/:id', async (req,res)=>{
  res.json(await Vehicle.findByIdAndUpdate(req.params.id, req.body, {new:true}));
});
module.exports = r;
