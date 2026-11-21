const r = require('express').Router();
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const {authorize}=require('../middleware/auth');
r.post('/fuel',authorize('Admin','FleetManager'),async (req,res)=>{try{const f=await FuelLog.create(req.body);if(req.body.odometer)await Vehicle.findByIdAndUpdate(req.body.vehicle,{odometer:req.body.odometer});res.json(f);}catch(e){res.status(400).json({message:e.message});}});
r.get('/fuel/:vehicleId',authorize('Admin','FleetManager'),async (req,res)=>{res.json(await FuelLog.find({vehicle:req.params.vehicleId}).sort({date:-1}).limit(100));});
r.put('/service/:vehicleId',authorize('Admin','FleetManager'),async (req,res)=>{const v=await Vehicle.findByIdAndUpdate(req.params.vehicleId,{nextServiceDue:req.body.nextServiceDue,odometer:req.body.odometer},{new:true});if(!v)return res.status(404).json({message:'Vehicle not found'});res.json(v);});
r.get('/due',authorize('Admin','FleetManager'),async (req,res)=>{const soon=new Date(Date.now()+7*864e5);res.json(await Vehicle.find({$or:[{nextServiceDue:{$lte:soon}},{nextServiceDue:null}]}).limit(100));});
module.exports = r;
