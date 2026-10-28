const r = require('express').Router();
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
r.post('/fuel', async (req,res)=>{
  const f = await FuelLog.create(req.body);
  if(req.body.odometer) await Vehicle.findByIdAndUpdate(req.body.vehicle,{odometer:req.body.odometer}).catch(()=>{});
  res.json(f);
});
r.get('/fuel/:vehicleId', async (req,res)=>{
  res.json(await FuelLog.find({vehicle:req.params.vehicleId}).sort({date:-1}).limit(100));
});
r.put('/service/:vehicleId', async (req,res)=>{
  res.json(await Vehicle.findByIdAndUpdate(req.params.vehicleId,{nextServiceDue:req.body.nextServiceDue, odometer:req.body.odometer},{new:true}));
});
r.get('/due', async (req,res)=>{
  const soon = new Date(Date.now()+7*864e5);
  res.json(await Vehicle.find({$or:[{nextServiceDue:{$lte:soon}},{nextServiceDue:null}]}).limit(100));
});
module.exports = r;
